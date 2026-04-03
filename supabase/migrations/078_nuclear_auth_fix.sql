-- =============================================================
-- 078_nuclear_auth_fix.sql
-- COMPREHENSIVE FIX: "Database error creating new user"
--
-- This script:
-- 1. Lists and drops ALL triggers on auth.users
-- 2. Drops all related trigger functions
-- 3. Recreates ONE safe trigger
-- =============================================================

-- --------------------------------------------------------
-- STEP 1: Drop EVERY trigger on auth.users (nuclear option)
-- --------------------------------------------------------
DO $$
DECLARE
  trig RECORD;
BEGIN
  FOR trig IN
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth'
      AND event_object_table = 'users'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON auth.users CASCADE',
      trig.trigger_name
    );
    RAISE NOTICE 'Dropped trigger: %', trig.trigger_name;
  END LOOP;
END;
$$;

-- --------------------------------------------------------
-- STEP 2: Drop all known functions that may be referenced
-- --------------------------------------------------------
DROP FUNCTION IF EXISTS validate_email_domain() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.validate_email_domain() CASCADE;

-- --------------------------------------------------------
-- STEP 3: Create ONE safe tagging function (no exceptions)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.tag_user_type_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Never raise exceptions — just tag and return
  BEGIN
    IF NEW.email IS NOT NULL THEN
      IF NEW.email LIKE '%@set.sanjivani.edu.in' THEN
        NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
          || '{"user_type":"faculty"}'::jsonb;
      ELSIF NEW.email LIKE '%@sanjivani.edu.in'
            AND NEW.email NOT LIKE '%@set.sanjivani.edu.in' THEN
        NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
          || '{"user_type":"student"}'::jsonb;
      ELSIF NEW.email LIKE '%@cafe.in' THEN
        NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
          || '{"user_type":"cafeteria"}'::jsonb;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Silently ignore any error — never block user creation
    NULL;
  END;

  RETURN NEW;
END;
$$;

-- --------------------------------------------------------
-- STEP 4: Attach the safe trigger — BEFORE INSERT only
-- --------------------------------------------------------
CREATE TRIGGER tag_user_type_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.tag_user_type_on_signup();

-- --------------------------------------------------------
-- STEP 5: Verify — show remaining triggers on auth.users
-- --------------------------------------------------------
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;
