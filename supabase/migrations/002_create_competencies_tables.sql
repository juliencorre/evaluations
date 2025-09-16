-- Migration pour créer les tables des compétences hiérarchiques
-- Ordre de création respecting les dépendances

-- 1. Table des frameworks de compétences
CREATE TABLE IF NOT EXISTS competency_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des domaines
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL REFERENCES competency_frameworks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(framework_id, order_index)
);

-- 3. Table des champs
CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(domain_id, order_index)
);

-- 4. Table des compétences
CREATE TABLE IF NOT EXISTS competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(field_id, order_index)
);

-- 5. Table des sous-compétences spécifiques
CREATE TABLE IF NOT EXISTS specific_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(competency_id, order_index)
);

-- Index pour optimiser les requêtes hiérarchiques
CREATE INDEX IF NOT EXISTS idx_domains_framework_order ON domains(framework_id, order_index);
CREATE INDEX IF NOT EXISTS idx_fields_domain_order ON fields(domain_id, order_index);
CREATE INDEX IF NOT EXISTS idx_competencies_field_order ON competencies(field_id, order_index);
CREATE INDEX IF NOT EXISTS idx_specific_competencies_competency_order ON specific_competencies(competency_id, order_index);

-- Triggers pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_competency_frameworks_updated_at
    BEFORE UPDATE ON competency_frameworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at
    BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fields_updated_at
    BEFORE UPDATE ON fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competencies_updated_at
    BEFORE UPDATE ON competencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specific_competencies_updated_at
    BEFORE UPDATE ON specific_competencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Accès libre pour le moment
ALTER TABLE competency_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE specific_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on competency_frameworks" ON competency_frameworks FOR ALL USING (true);
CREATE POLICY "Allow all operations on domains" ON domains FOR ALL USING (true);
CREATE POLICY "Allow all operations on fields" ON fields FOR ALL USING (true);
CREATE POLICY "Allow all operations on competencies" ON competencies FOR ALL USING (true);
CREATE POLICY "Allow all operations on specific_competencies" ON specific_competencies FOR ALL USING (true);

-- Fonctions utilitaires pour réorganiser les ordres lors d'insertion/suppression
CREATE OR REPLACE FUNCTION reorder_domains_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE domains
    SET order_index = order_index - 1
    WHERE framework_id = OLD.framework_id
    AND order_index > OLD.order_index;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION reorder_fields_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE fields
    SET order_index = order_index - 1
    WHERE domain_id = OLD.domain_id
    AND order_index > OLD.order_index;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION reorder_competencies_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE competencies
    SET order_index = order_index - 1
    WHERE field_id = OLD.field_id
    AND order_index > OLD.order_index;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION reorder_specific_competencies_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE specific_competencies
    SET order_index = order_index - 1
    WHERE competency_id = OLD.competency_id
    AND order_index > OLD.order_index;
    RETURN OLD;
END;
$$ language 'plpgsql';

-- Triggers pour maintenir l'ordre automatiquement
CREATE TRIGGER reorder_domains_trigger
    AFTER DELETE ON domains
    FOR EACH ROW EXECUTE FUNCTION reorder_domains_after_delete();

CREATE TRIGGER reorder_fields_trigger
    AFTER DELETE ON fields
    FOR EACH ROW EXECUTE FUNCTION reorder_fields_after_delete();

CREATE TRIGGER reorder_competencies_trigger
    AFTER DELETE ON competencies
    FOR EACH ROW EXECUTE FUNCTION reorder_competencies_after_delete();

CREATE TRIGGER reorder_specific_competencies_trigger
    AFTER DELETE ON specific_competencies
    FOR EACH ROW EXECUTE FUNCTION reorder_specific_competencies_after_delete();

-- Insérer un framework par défaut si aucun n'existe (UUID auto-généré)
INSERT INTO competency_frameworks (name, version, description)
SELECT
    'Framework par défaut',
    '1.0',
    'Framework de compétences par défaut pour l''évaluation des élèves'
WHERE NOT EXISTS (
    SELECT 1 FROM competency_frameworks WHERE name = 'Framework par défaut'
);