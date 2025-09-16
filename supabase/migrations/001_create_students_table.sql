-- Créer la table des élèves
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index sur les noms pour améliorer les performances de recherche
CREATE INDEX idx_students_first_name ON students(first_name);
CREATE INDEX idx_students_last_name ON students(last_name);
CREATE INDEX idx_students_display_name ON students(display_name);

-- Activer RLS (Row Level Security)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre l'accès anonyme en lecture
CREATE POLICY "Allow anonymous read access" ON students
  FOR SELECT
  USING (true);

-- Créer une politique pour permettre l'accès anonyme en écriture
CREATE POLICY "Allow anonymous insert access" ON students
  FOR INSERT
  WITH CHECK (true);

-- Créer une politique pour permettre l'accès anonyme en mise à jour
CREATE POLICY "Allow anonymous update access" ON students
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Créer une politique pour permettre l'accès anonyme en suppression
CREATE POLICY "Allow anonymous delete access" ON students
  FOR DELETE
  USING (true);

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