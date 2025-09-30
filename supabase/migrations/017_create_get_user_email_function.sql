-- Créer une fonction pour récupérer l'email et les métadonnées d'un utilisateur
-- Cette fonction permet d'accéder aux données de auth.users de manière sécurisée

CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TABLE (
  email TEXT,
  raw_user_meta_data JSONB
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.email,
    au.raw_user_meta_data
  FROM auth.users au
  WHERE au.id = user_uuid;
END;
$$;

-- Accorder les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

COMMENT ON FUNCTION get_user_email IS 'Récupère l''email et les métadonnées d''un utilisateur de manière sécurisée';