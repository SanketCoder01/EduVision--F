-- =============================================================
-- 077_fix_auth_trigger.sql
-- Fix: "Database error creating new user" / "Failed to create user"
--
-- Root cause: The validate_email_domain trigger runs BEFORE INSERT
-- OR UPDATE on auth.users. It raises an EXCEPTION for any email
-- that doesn't match the three allowed domains. This blocks:
--   - Supabase dashboard "Create User" action
--   - Any internal Supabase system account creation
--   - Future admin-created users (e.g. google oauth, magic links)
--
-- Fix: Make the trigger INSERT-only, guard against NULL email,
-- and NEVER raise an exception (just tag meta instead).
-- =============================================================

-- 1. Drop the old broken trigger & function completely
DROP TRIGGER IF EXISTS validate_email_domain_trigger ON auth.users;
DROP FUNCTION IF EXISTS validate_email_domain();

-- 2. Re-create the function — safe version
--    Instead of RAISE EXCEPTION (which blocks user creation),
--    we just tag users with their type or 'unknown'.
--    The app-level API routes already enforce domain separately.
CREATE OR REPLACE FUNCTION validate_email_domain()
RETURNS TRIGGER AS $$
BEGIN
  -- Guard: if email is NULL or empty, skip tagging
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  -- Tag faculty
  IF NEW.email LIKE '%@set.sanjivani.edu.in' THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{user_type}',
      '"faculty"'::jsonb
    );

  -- Tag students (sanjivani.edu.in but NOT set.sanjivani.edu.in)
  ELSIF NEW.email LIKE '%@sanjivani.edu.in'
    AND NEW.email NOT LIKE '%@set.sanjivani.edu.in' THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{user_type}',
      '"student"'::jsonb
    );

  -- Tag cafeteria
  ELSIF NEW.email LIKE '%@cafe.in' THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{user_type}',
      '"cafeteria"'::jsonb
    );

  -- Unknown domain — tag but DO NOT block (was the bug)
  ELSE
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{user_type}',
      '"unknown"'::jsonb
    );
  END IF;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Safety net: if anything goes wrong, never block auth
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach the trigger — INSERT only, not UPDATE
--    (UPDATE would fire on every password change / email update etc.)
CREATE TRIGGER validate_email_domain_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_email_domain();

-- 4. Backfill existing users that are tagged 'unknown'
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{user_type}',
  CASE
    WHEN email LIKE '%@set.sanjivani.edu.in' THEN '"faculty"'::jsonb
    WHEN email LIKE '%@sanjivani.edu.in'
      AND email NOT LIKE '%@set.sanjivani.edu.in' THEN '"student"'::jsonb
    WHEN email LIKE '%@cafe.in' THEN '"cafeteria"'::jsonb
    ELSE '"unknown"'::jsonb
  END
)
WHERE email IS NOT NULL;
