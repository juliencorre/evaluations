-- Migration 012: Add email restrictions system
-- Created: 2025-09-27
-- Description: Add system to restrict user registration to specific emails or domains

-- =====================================================
-- ÉTAPE 1 : CRÉATION DE LA TABLE EMAIL_RESTRICTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS email_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_type TEXT NOT NULL CHECK (rule_type IN ('email', 'domain')),
    value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Contrainte d'unicité pour éviter les doublons
    CONSTRAINT unique_email_restriction UNIQUE(rule_type, value)
);

-- Index pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_email_restrictions_rule_type ON email_restrictions(rule_type);
CREATE INDEX IF NOT EXISTS idx_email_restrictions_active ON email_restrictions(is_active);
CREATE INDEX IF NOT EXISTS idx_email_restrictions_value ON email_restrictions(value);

-- =====================================================
-- ÉTAPE 2 : CONFIGURATION INITIALE
-- =====================================================

-- Insérer quelques règles par défaut (exemples)
INSERT INTO email_restrictions (rule_type, value, description, is_active) VALUES
    ('domain', 'education.gouv.fr', 'Domaine officiel de l''Éducation Nationale', true),
    ('domain', 'ac-*.fr', 'Académies françaises (wildcard)', true),
    ('email', 'admin@localhost', 'Compte administrateur local pour développement', true)
ON CONFLICT (rule_type, value) DO NOTHING;

-- =====================================================
-- ÉTAPE 3 : FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_email_restrictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_email_restrictions_updated_at ON email_restrictions;
CREATE TRIGGER trigger_update_email_restrictions_updated_at
    BEFORE UPDATE ON email_restrictions
    FOR EACH ROW
    EXECUTE FUNCTION update_email_restrictions_updated_at();

-- Fonction pour vérifier si un email est autorisé
CREATE OR REPLACE FUNCTION is_email_allowed(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    email_lower TEXT;
    domain_part TEXT;
    restriction RECORD;
BEGIN
    -- Normaliser l'email
    email_lower := LOWER(TRIM(email_to_check));

    -- Extraire le domaine
    domain_part := SPLIT_PART(email_lower, '@', 2);

    -- Si aucune restriction n'est active, autoriser par défaut
    IF NOT EXISTS (SELECT 1 FROM email_restrictions WHERE is_active = true) THEN
        RETURN true;
    END IF;

    -- Vérifier les emails exacts
    IF EXISTS (
        SELECT 1 FROM email_restrictions
        WHERE rule_type = 'email'
        AND is_active = true
        AND LOWER(value) = email_lower
    ) THEN
        RETURN true;
    END IF;

    -- Vérifier les domaines (avec support wildcards)
    FOR restriction IN
        SELECT value FROM email_restrictions
        WHERE rule_type = 'domain'
        AND is_active = true
    LOOP
        -- Support pour les wildcards avec *
        IF restriction.value LIKE '%*%' THEN
            -- Convertir le pattern wildcard en regex
            DECLARE
                pattern TEXT := REPLACE(LOWER(restriction.value), '*', '.*');
            BEGIN
                IF domain_part ~ ('^' || pattern || '$') THEN
                    RETURN true;
                END IF;
            END;
        ELSE
            -- Correspondance exacte du domaine
            IF LOWER(restriction.value) = domain_part THEN
                RETURN true;
            END IF;
        END IF;
    END LOOP;

    -- Aucune règle ne correspond
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le message d'erreur personnalisé
CREATE OR REPLACE FUNCTION get_email_restriction_message()
RETURNS TEXT AS $$
DECLARE
    domains TEXT;
    message TEXT;
BEGIN
    -- Construire la liste des domaines autorisés
    SELECT STRING_AGG(
        CASE
            WHEN rule_type = 'domain' THEN '@' || value
            ELSE value
        END,
        ', '
    ) INTO domains
    FROM email_restrictions
    WHERE is_active = true
    ORDER BY rule_type, value;

    IF domains IS NULL THEN
        RETURN 'L''inscription est actuellement fermée.';
    ELSE
        RETURN 'Seuls les emails des domaines suivants sont autorisés : ' || domains;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ÉTAPE 4 : POLITIQUES RLS
-- =====================================================

-- Activer RLS sur la table email_restrictions
ALTER TABLE email_restrictions ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture: tous les utilisateurs authentifiés peuvent voir les restrictions
CREATE POLICY "Authenticated users can view email restrictions" ON email_restrictions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour la modification: seuls les super admins (ou rôle spécifique)
CREATE POLICY "Only admins can modify email restrictions" ON email_restrictions
    FOR ALL USING (
        auth.uid() IN (
            -- Ici vous pouvez définir une liste d'UIDs d'administrateurs
            -- ou créer une table user_roles séparée
            SELECT id FROM auth.users WHERE email IN (
                'admin@localhost',
                'admin@education.gouv.fr'
            )
        )
    );

-- =====================================================
-- ÉTAPE 5 : COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE email_restrictions IS 'Configuration des restrictions d''emails pour l''inscription des utilisateurs';
COMMENT ON COLUMN email_restrictions.rule_type IS 'Type de règle: email (exact) ou domain';
COMMENT ON COLUMN email_restrictions.value IS 'Valeur de la règle (email complet ou domaine, wildcards supportés)';
COMMENT ON COLUMN email_restrictions.description IS 'Description de la règle pour l''administration';
COMMENT ON COLUMN email_restrictions.is_active IS 'Indique si la règle est active';

-- =====================================================
-- ÉTAPE 6 : FONCTION PUBLIQUE POUR L'API
-- =====================================================

-- Fonction accessible via l'API REST pour valider un email
CREATE OR REPLACE FUNCTION public.validate_email_registration(email_to_validate TEXT)
RETURNS JSON AS $$
DECLARE
    is_allowed BOOLEAN;
    error_message TEXT;
BEGIN
    is_allowed := is_email_allowed(email_to_validate);

    IF is_allowed THEN
        RETURN JSON_BUILD_OBJECT(
            'allowed', true,
            'message', 'Email autorisé'
        );
    ELSE
        error_message := get_email_restriction_message();
        RETURN JSON_BUILD_OBJECT(
            'allowed', false,
            'message', error_message
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;