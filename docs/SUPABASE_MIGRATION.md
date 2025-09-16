# Migration Supabase pour les Résultats d'Évaluation

## Tables à créer dans Supabase

Pour activer la persistance Supabase des résultats d'évaluation, vous devez créer les tables suivantes dans votre base de données Supabase.

### 1. Table `evaluations`

```sql
-- Table pour les évaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL,
  description text,
  framework_id uuid NOT NULL REFERENCES competency_frameworks(id) ON DELETE CASCADE,
  class_id text, -- Pour l'instant un simple text, peut être étendu plus tard
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Table `evaluation_results`

```sql
-- Table pour les résultats d'évaluation
CREATE TABLE IF NOT EXISTS evaluation_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  student_id text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  specific_competency_id uuid NOT NULL REFERENCES specific_competencies(id) ON DELETE CASCADE,
  level text NOT NULL CHECK (level IN ('A', 'B', 'C', 'D', 'E', 'N/A')),
  comment text,
  evaluated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Contrainte d'unicité : un seul résultat par évaluation/élève/compétence
  UNIQUE(evaluation_id, student_id, specific_competency_id)
);
```

### 3. Index pour optimiser les performances

```sql
-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_evaluations_framework_id ON evaluations(framework_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_class_id ON evaluations(class_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluation_id ON evaluation_results(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_student_id ON evaluation_results(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_specific_competency_id ON evaluation_results(specific_competency_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_level ON evaluation_results(level);
```

### 4. Triggers pour updated_at automatique

```sql
-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_results_updated_at
  BEFORE UPDATE ON evaluation_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Row Level Security (RLS)

```sql
-- Activer RLS (Row Level Security)
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;

-- Politique RLS temporaire permettant toutes les opérations
-- (à adapter selon les besoins de sécurité réels)
CREATE POLICY "Enable all operations for evaluations" ON evaluations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for evaluation_results" ON evaluation_results
  FOR ALL USING (true) WITH CHECK (true);
```

## Migration script complet

Voici le script SQL complet à exécuter dans Supabase SQL Editor :

```sql
-- Migration complète pour les résultats d'évaluation

-- 1. Table evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL,
  description text,
  framework_id uuid NOT NULL REFERENCES competency_frameworks(id) ON DELETE CASCADE,
  class_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Table evaluation_results
CREATE TABLE IF NOT EXISTS evaluation_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  student_id text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  specific_competency_id uuid NOT NULL REFERENCES specific_competencies(id) ON DELETE CASCADE,
  level text NOT NULL CHECK (level IN ('A', 'B', 'C', 'D', 'E', 'N/A')),
  comment text,
  evaluated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(evaluation_id, student_id, specific_competency_id)
);

-- 3. Index
CREATE INDEX IF NOT EXISTS idx_evaluations_framework_id ON evaluations(framework_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_class_id ON evaluations(class_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluation_id ON evaluation_results(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_student_id ON evaluation_results(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_specific_competency_id ON evaluation_results(specific_competency_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_level ON evaluation_results(level);

-- 4. Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_results_updated_at
  BEFORE UPDATE ON evaluation_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for evaluations" ON evaluations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for evaluation_results" ON evaluation_results
  FOR ALL USING (true) WITH CHECK (true);
```

## Vérification de la migration

Après avoir exécuté le script, vérifiez que les tables ont été créées correctement :

```sql
-- Vérifier les tables
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('evaluations', 'evaluation_results');

-- Vérifier les contraintes
SELECT
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('evaluations', 'evaluation_results');

-- Vérifier les index
SELECT
  indexname,
  tablename
FROM pg_indexes
WHERE tablename IN ('evaluations', 'evaluation_results');
```

## Structure de données

### Table `evaluations`
- `id`: UUID unique de l'évaluation
- `name`: Nom de l'évaluation
- `description`: Description optionnelle
- `framework_id`: Référence vers le framework de compétences
- `class_id`: Identifiant de la classe (format libre)
- `created_at`, `updated_at`: Horodatage

### Table `evaluation_results`
- `id`: UUID unique du résultat
- `evaluation_id`: Référence vers l'évaluation
- `student_id`: Référence vers l'élève
- `specific_competency_id`: Référence vers la compétence spécifique
- `level`: Niveau d'évaluation ('A', 'B', 'C', 'D', 'E', 'N/A')
- `comment`: Commentaire optionnel
- `evaluated_at`: Date/heure de l'évaluation
- `created_at`, `updated_at`: Horodatage

## Rollback (en cas de problème)

Si vous devez supprimer les tables créées :

```sql
-- ATTENTION: Ceci supprimera toutes les données !
DROP TABLE IF EXISTS evaluation_results CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Notes importantes

1. **Contrainte d'unicité**: Un élève ne peut avoir qu'un seul résultat par compétence dans une évaluation
2. **Suppression en cascade**: Supprimer une évaluation supprime tous ses résultats
3. **RLS activé**: Les politiques de sécurité doivent être adaptées selon vos besoins
4. **Performance**: Les index optimisent les requêtes fréquentes
5. **Backup**: Le système garde automatiquement une copie locale en localStorage