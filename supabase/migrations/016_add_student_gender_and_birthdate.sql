-- Ajouter les colonnes sexe et date de naissance à la table students

-- Ajouter la colonne pour le sexe (genre)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('M', 'F', 'Autre', NULL));

-- Ajouter la colonne pour la date de naissance
ALTER TABLE students
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Créer un index sur la date de naissance pour les requêtes de tri par âge
CREATE INDEX IF NOT EXISTS idx_students_birth_date ON students(birth_date);

-- Commentaires pour documentation
COMMENT ON COLUMN students.gender IS 'Sexe de l''élève: M (Masculin), F (Féminin), Autre, ou NULL';
COMMENT ON COLUMN students.birth_date IS 'Date de naissance de l''élève';