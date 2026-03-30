-- ================================================================
-- Migration 071: Insert Cafeteria Owner Credentials
-- Important: Run this inside the Supabase SQL Editor
-- This script creates a new user in Supabase Auth bypassing the UI
-- ================================================================

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  user_email text := 'sumit@cafe.in'; -- Must end in @cafe.in
  user_password text := 'Cafe@123';   -- Change this to a secure password
  encrypted_pw text;
BEGIN
  -- We use pgcrypto for password hashing (Supabase auth uses bcrypt)
  encrypted_pw := crypt(user_password, gen_salt('bf'));

  -- 1. Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    user_email,
    encrypted_pw,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  );

  -- 2. Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    new_user_id,
    new_user_id::text,
    format('{"sub":"%s","email":"%s"}', new_user_id::text, user_email)::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Created cafeteria owner user: %', user_email;
END $$;
