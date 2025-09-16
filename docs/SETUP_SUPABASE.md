# Configuration Supabase - Élèves

## 🎯 Étapes pour activer Supabase

L'intégration Supabase est prête ! Il ne reste qu'à créer la table `students` dans votre projet Supabase.

### 📝 1. Créer la table via le dashboard Supabase

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Ouvrez votre projet: `cnvlxwtjtlpeohmlfjsb`
3. Allez dans **SQL Editor**
4. Exécutez ce script SQL :

```sql
-- Créer la table des élèves
CREATE TABLE students (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_students_first_name ON students(first_name);
CREATE INDEX idx_students_last_name ON students(last_name);
CREATE INDEX idx_students_display_name ON students(display_name);

-- Activer RLS (Row Level Security)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Créer des politiques pour permettre l'accès anonyme
CREATE POLICY "Allow anonymous read access" ON students
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON students
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access" ON students
  FOR DELETE USING (true);

-- Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour mettre à jour updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 🔄 2. Alternative : Copier le script depuis le fichier

Le script SQL complet est disponible dans :
```
supabase/migrations/001_create_students_table.sql
```

### ✅ 3. Vérifier que ça fonctionne

Après avoir exécuté le script SQL :

1. Rafraîchissez l'application (F5)
2. La console devrait afficher : **"Élèves chargés depuis Supabase"**
3. Testez l'ajout/modification/suppression d'élèves

### 🎯 4. Fonctionnalités disponibles une fois la table créée

- ✅ **Persistance** : Les élèves sont sauvegardés en base
- ✅ **Synchronisation** : Partagé entre tous les utilisateurs
- ✅ **Recherche** : Recherche optimisée en base
- ✅ **Temps réel** : Mise à jour automatique (optionnel)
- ✅ **Fallback** : Fonctionne même si Supabase est indisponible

### 🔍 5. Debug

Si des erreurs persistent, vérifiez :

1. **Table créée** : Dashboard Supabase → Table Editor → `students`
2. **RLS activé** : La table doit avoir Row Level Security activé
3. **Politiques** : Les 4 politiques "Allow anonymous..." doivent être créées
4. **Variables d'env** : `.env` contient les bonnes URL et clés

---

## 🚀 État actuel

✅ **Fallback actif** : L'application utilise les données locales
⏳ **Supabase** : En attente de création de la table
🎯 **Prêt** : Tous les fichiers de configuration sont en place

Une fois la table créée, l'application basculera automatiquement sur Supabase !