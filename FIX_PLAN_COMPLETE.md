# EduVision Terminal Issues Fix Plan - Complete Version

## 1. Database Schema Issues

### Problem
The approve-registration API is trying to insert data into columns that don't exist in the database schema:
- `name` column missing from `students` table
- `face_data` column missing from `students` and `faculty` tables
- Other face-related columns missing from main tables

### Solution
1. Run the SQL script to add missing columns to the database:
   - `name` (TEXT) for students table
   - `face_data` (JSONB)
   - `face_url` (TEXT)
   - `face_registered` (BOOLEAN)
   - `face_registered_at` (TIMESTAMP WITH TIME ZONE)
   - `password_hash` (TEXT) for students table
   - `designation`, `qualification`, `experience_years` for faculty table

2. Update the database types file to reflect these changes

## 2. Cookie Parsing Issues

### Problem
"Failed to parse cookie string: [SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON]"

### Analysis
This error suggests that cookie data is not properly formatted as JSON. The "base64-eyJ" indicates base64 encoded JSON data that is malformed.

### Solution
1. Check middleware implementation for proper cookie handling
2. Verify Supabase client configuration in server.ts
3. Ensure cookies are properly serialized/deserialized

## 3. Implementation Steps

### Step 1: Database Schema Fix
- Execute the SQL script to add missing columns
- Update database types file

### Step 2: Cookie Issue Fix
- Review middleware implementation
- Check Supabase client configuration
- Test cookie handling

### Step 3: Testing
- Test the approve-registration API endpoint
- Verify all database operations work correctly
- Ensure no more cookie parsing errors
- Test overall application functionality

## 4. Files to Modify

1. SQL script for database schema updates
2. Database types file (types/database.types.ts)
3. Middleware file (middleware.ts) if needed
4. Supabase client configuration (lib/supabase/server.ts) if needed

## 5. Updated Database Types for Students Table

The students table needs to be updated to include the following columns:
- `name` (string | null) - NEW COLUMN
- `face_data` (JSONB)
- `face_url` (TEXT)
- `face_registered` (BOOLEAN)
- `face_registered_at` (TIMESTAMP WITH TIME ZONE)
- `password_hash` (TEXT)

## 6. Testing Plan

1. Run the SQL script to update database schema
2. Test approve-registration API endpoint
3. Verify no more database schema errors
4. Check that cookie parsing errors are resolved
5. Test overall application functionality