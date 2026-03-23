-- Minimal registration schema cleanup for EduVision
--
-- IMPORTANT:
-- Your "students" relation appears to be a VIEW in Supabase, so you cannot
-- ALTER TABLE students ... DROP COLUMN.
--
-- This migration focuses on:
-- 1) Keeping only the columns the app uses for simplified registration.
-- 2) Dropping the extra tables used by the old extended registration flow.
-- 3) Providing helper queries to locate the base table behind the students view.
--
-- Run each section in Supabase SQL editor.

-- =========================================================
-- 0) Detect what "students" is (VIEW vs TABLE)
-- =========================================================
select table_schema, table_name, table_type
from information_schema.tables
where table_name = 'students';

select view_definition
from information_schema.views
where table_name = 'students';

-- =========================================================
-- 1) Drop old extended registration tables (safe if you don't need them)
-- =========================================================
-- These tables were used for SSC/HSC/Diploma/Docs/etc.
-- Drop them if you are sure you won't use them.

drop table if exists student_documents cascade;
drop table if exists student_education_details cascade;

-- =========================================================
-- 1B) Ensure minimal columns exist on the BASE student table (not the students view)
-- =========================================================
-- The frontend now only requires these columns:
-- - prn
-- - name
-- - registration_step
-- - registration_completed
--
-- IMPORTANT: You must run this against the underlying BASE TABLE that the
-- students VIEW selects from.
--
-- Steps:
-- 1) Run section (0) above and copy the view_definition.
-- 2) Identify the base table name inside the view definition.
-- 3) Replace <BASE_TABLE> below and run.

-- alter table <BASE_TABLE>
--   add column if not exists prn text,
--   add column if not exists name text,
--   add column if not exists registration_step int default 0,
--   add column if not exists registration_completed boolean default false;

-- If your base table is named "students_base", this block may work as-is:
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'students_base'
      and table_type = 'BASE TABLE'
  ) then
    execute 'alter table public.students_base add column if not exists prn text';
    execute 'alter table public.students_base add column if not exists name text';
    execute 'alter table public.students_base add column if not exists registration_step int default 0';
    execute 'alter table public.students_base add column if not exists registration_completed boolean default false';
  end if;
end $$;

-- =========================================================
-- 2) OPTIONAL: Create a new minimal base table (recommended if students is a VIEW)
-- =========================================================
-- If you want a clean minimal storage without touching your existing view/base,
-- create a new table and update the app to use it.
--
-- NOTE: This does NOT modify existing auth/user flows.
--
-- create table if not exists students_minimal (
--   id uuid primary key,
--   email text unique,
--   department text,
--   year text,
--   prn text,
--   first_name text,
--   middle_name text,
--   last_name text,
--   name text,
--   registration_step int default 0,
--   registration_completed boolean default false,
--   created_at timestamptz default now()
-- );

-- =========================================================
-- 3) OPTIONAL: If students is a TABLE (not a view), you may drop extra columns
-- =========================================================
-- Uncomment only if section (0) shows table_type = 'BASE TABLE'
--
-- alter table students
--   drop column if exists date_of_birth,
--   drop column if exists gender,
--   drop column if exists blood_group,
--   drop column if exists nationality,
--   drop column if exists religion,
--   drop column if exists caste,
--   drop column if exists sub_caste,
--   drop column if exists domicile,
--   drop column if exists birth_place,
--   drop column if exists birth_country,
--   drop column if exists mobile_number,
--   drop column if exists alternate_mobile,
--   drop column if exists aadhar_number,
--   drop column if exists pan_number,
--   drop column if exists passport_number,
--   drop column if exists passport_issue_date,
--   drop column if exists passport_expiry_date,
--   drop column if exists passport_issue_place,
--   drop column if exists permanent_address,
--   drop column if exists permanent_city,
--   drop column if exists permanent_state,
--   drop column if exists permanent_pincode,
--   drop column if exists permanent_country,
--   drop column if exists current_address,
--   drop column if exists current_city,
--   drop column if exists current_state,
--   drop column if exists current_pincode,
--   drop column if exists current_country,
--   drop column if exists father_name,
--   drop column if exists father_occupation,
--   drop column if exists father_mobile,
--   drop column if exists father_email,
--   drop column if exists father_annual_income,
--   drop column if exists mother_name,
--   drop column if exists mother_occupation,
--   drop column if exists mother_mobile,
--   drop column if exists mother_email,
--   drop column if exists mother_annual_income,
--   drop column if exists guardian_name,
--   drop column if exists guardian_relation,
--   drop column if exists guardian_mobile,
--   drop column if exists guardian_email,
--   drop column if exists emergency_contact_name,
--   drop column if exists emergency_contact_relation,
--   drop column if exists emergency_contact_mobile,
--   drop column if exists emergency_contact_address,
--   drop column if exists bank_name,
--   drop column if exists bank_account_number,
--   drop column if exists bank_ifsc_code,
--   drop column if exists bank_branch,
--   drop column if exists bank_account_holder_name,
--   drop column if exists physically_handicapped,
--   drop column if exists minority_status,
--   drop column if exists gap_year,
--   drop column if exists gap_reason;
