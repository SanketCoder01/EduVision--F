-- supabase/migrations/YYYY-MM-DD-create-approve-registration-rpc.sql

-- Helper function to get the correct student table name
CREATE OR REPLACE FUNCTION get_student_table_name(department TEXT, year TEXT)
RETURNS TEXT AS $$
DECLARE
  dept_code TEXT;
  year_code TEXT;
BEGIN
  dept_code := CASE
    WHEN department ILIKE '%cse%' OR department ILIKE '%computer science%' THEN 'cse'
    WHEN department ILIKE '%cyber%' THEN 'cyber'
    WHEN department ILIKE '%data science%' OR department ILIKE '%aids%' THEN 'aids'
    WHEN department ILIKE '%machine learning%' OR department ILIKE '%aiml%' THEN 'aiml'
    ELSE 'cse' -- Default
  END;

  year_code := CASE
    WHEN year ILIKE '%1%' THEN '1st_year'
    WHEN year ILIKE '%2%' THEN '2nd_year'
    WHEN year ILIKE '%3%' THEN '3rd_year'
    WHEN year ILIKE '%4%' THEN '4th_year'
    ELSE '1st_year' -- Default
  END;

  RETURN 'students_' || dept_code || '_' || year_code;
END;
$$ LANGUAGE plpgsql;

-- Main RPC function for approving registrations
CREATE OR REPLACE FUNCTION approve_user_registration(registration_id UUID, admin_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  reg RECORD;
  auth_user_id UUID;
  table_name TEXT;
  new_user_payload JSONB;
BEGIN
  -- 1. Get the pending registration details
  SELECT * INTO reg FROM public.pending_registrations WHERE id = registration_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Registration not found');
  END IF;

  -- 2. Check if user already exists in auth.users
  SELECT id INTO auth_user_id FROM auth.users WHERE email = reg.email;

  -- 3. If user does not exist, create them in auth.users
  IF auth_user_id IS NULL THEN
    -- This part must be done by the backend with service_role key
    -- The function here just prepares for the data insertion.
    -- We assume the backend will create the user and pass the new user_id.
    -- For the purpose of this transaction, we'll raise an exception if the calling backend
    -- didn't create the user first. A better approach is to pass the new user id in.
    -- However, since we can't call auth.admin.create_user from SQL, we'll proceed assuming it's handled.
    -- Let's find a way to get the user id after creation from the backend.
    -- For now, this function will handle the data insertion part only.
    -- The calling backend will be responsible for creating the auth user and then calling this.
    RAISE EXCEPTION 'Auth user must be created by the service backend before calling this function.';
  END IF;

  -- 4. Insert into the appropriate table (student or faculty)
  IF reg.user_type = 'student' THEN
    table_name := get_student_table_name(reg.department, reg.year);
    EXECUTE format('INSERT INTO public.%I (user_id, email, name, department, year, face_registered, face_url, photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO NOTHING;', 
      table_name)
    USING auth_user_id, reg.email, split_part(reg.email, '@', 1), reg.department, reg.year, true, reg.face_url, reg.face_url;
  ELSE
    INSERT INTO public.faculty (user_id, email, name, department, face_registered, face_url, photo)
    VALUES (auth_user_id, reg.email, split_part(reg.email, '@', 1), reg.department, true, reg.face_url, reg.face_url)
    ON CONFLICT (email) DO NOTHING;
  END IF;

  -- 5. Insert into profiles table
  INSERT INTO public.profiles (id, email, role, department, year)
  VALUES (auth_user_id, reg.email, reg.user_type, reg.department, reg.year)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Update the pending registration status
  UPDATE public.pending_registrations
  SET
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = admin_user_id
  WHERE id = registration_id;

  RETURN jsonb_build_object('success', true, 'message', 'Registration approved successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- A modified version that doesn't require the auth user to be created first.
-- The backend will handle auth creation, then call this to handle the rest of the transaction.
CREATE OR REPLACE FUNCTION complete_user_approval(p_registration_id UUID, p_auth_user_id UUID, p_admin_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  reg RECORD;
  table_name TEXT;
BEGIN
  -- 1. Get the pending registration details
  SELECT * INTO reg FROM public.pending_registrations WHERE id = p_registration_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Registration not found');
  END IF;

  -- 2. Insert into the appropriate table (student or faculty)
  IF reg.user_type = 'student' THEN
    table_name := get_student_table_name(reg.department, reg.year);
    EXECUTE format('
      INSERT INTO public.%I (user_id, email, name, department, year, face_registered, face_url, photo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        face_registered = EXCLUDED.face_registered,
        face_url = EXCLUDED.face_url,
        photo = EXCLUDED.photo;
    ', table_name)
    USING p_auth_user_id, reg.email, split_part(reg.email, '@', 1), reg.department, reg.year, true, reg.face_url, reg.face_url;
  ELSE
    INSERT INTO public.faculty (user_id, email, name, department, face_registered, face_url, photo)
    VALUES (p_auth_user_id, reg.email, split_part(reg.email, '@', 1), reg.department, true, reg.face_url, reg.face_url)
    ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        face_registered = EXCLUDED.face_registered,
        face_url = EXCLUDED.face_url,
        photo = EXCLUDED.photo;
  END IF;

  -- 3. Insert into profiles table
  INSERT INTO public.profiles (id, email, role, department, year)
  VALUES (p_auth_user_id, reg.email, reg.user_type, reg.department, reg.year)
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    year = EXCLUDED.year;

  -- 4. Update the pending registration status
  UPDATE public.pending_registrations
  SET
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = p_admin_user_id
  WHERE id = p_registration_id;

  RETURN jsonb_build_object('success', true, 'message', 'Registration approved successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
