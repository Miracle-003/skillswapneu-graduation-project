-- Ensure user identity is owned by the application.
-- This migration removes any dependency on external auth tables (auth.users) and
-- makes public.user_profiles.user_id reference public.app_users(id).

DO $$
DECLARE
  r record;
BEGIN
  -- Drop any foreign key on public.user_profiles that references auth.users
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_class rt ON c.confrelid = rt.oid
    JOIN pg_namespace rn ON rn.oid = rt.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'user_profiles'
      AND c.contype = 'f'
      AND rn.nspname = 'auth'
      AND rt.relname = 'users'
  LOOP
    EXECUTE format('ALTER TABLE public.user_profiles DROP CONSTRAINT %I', r.conname);
  END LOOP;

  -- Add FK to app_users if not already present
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_class rt ON c.confrelid = rt.oid
    JOIN pg_namespace rn ON rn.oid = rt.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'user_profiles'
      AND c.contype = 'f'
      AND rn.nspname = 'public'
      AND rt.relname = 'app_users'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.app_users(id)
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;
