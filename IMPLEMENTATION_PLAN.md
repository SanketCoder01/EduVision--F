# EduVision System Fixes Implementation Plan

This document provides a detailed implementation plan for fixing the database schema and cookie parsing issues in the EduVision system.

## Issue Summary

1. **Database Schema Error**: "Could not find the 'name' column of 'students' in the schema cache"
2. **Cookie Parsing Error**: "Failed to parse cookie string: [SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON]"

## Fix 1: Database Schema Issues

### Step 1: Execute SQL Script to Add Missing Columns

File: `scripts/fix-students-faculty-schema-updated.sql`

The script adds the following columns:
- `name` column to the `students` table
- `face_data` column (JSONB) to both `students` and `faculty` tables
- `face_url` column (TEXT) to both tables
- `face_registered` column (BOOLEAN) to both tables
- `face_registered_at` column (TIMESTAMP WITH TIME ZONE) to both tables
- `password_hash` column (TEXT) to both tables
- `designation`, `qualification`, and `experience_years` columns to the `faculty` table

### Step 2: Update Database Types File

File: `types/database.types.ts`

Modify the `students` table definition to include the `name` column in all three interfaces:
- Row: Add `name: string | null`
- Insert: Add `name?: string | null`
- Update: Add `name?: string | null`

### Step 3: Verify Changes

Test the approve-registration API endpoint to ensure the "name column not found" error is resolved.

## Fix 2: Cookie Parsing Issues

### Step 1: Review Middleware Implementation

File: `middleware.ts` (or equivalent)

Check for proper cookie handling:
- Ensure cookies are properly serialized before being sent
- Verify cookies are properly deserialized when received
- Check for any base64 encoding/decoding issues

### Step 2: Check Supabase Client Configuration

File: `lib/supabase/server.ts` (or equivalent)

Verify:
- Proper initialization of Supabase client
- Correct cookie handling in Supabase auth configuration
- Proper session management

### Step 3: Test Cookie Handling

Verify that cookies are properly formatted as JSON and can be parsed without errors.

## Implementation Steps in Order

### Phase 1: Database Schema Fix

1. Execute the SQL script to add missing columns to the database
2. Update the database types file to reflect these changes
3. Test the approve-registration API endpoint

### Phase 2: Cookie Issue Fix

1. Review middleware implementation for cookie handling
2. Check Supabase client configuration
3. Test cookie serialization/deserialization

### Phase 3: Testing and Verification

1. Test the approve-registration API endpoint
2. Verify all database operations work correctly
3. Ensure no more cookie parsing errors
4. Test overall application functionality

## Files to be Modified

1. Database (via SQL script execution)
2. `types/database.types.ts` - Add `name` column to students table
3. `middleware.ts` - Review and fix cookie handling (if needed)
4. `lib/supabase/server.ts` - Verify Supabase client configuration (if needed)

## Expected Results

1. The approve-registration API will successfully create student records
2. The "name column not found" error will be resolved
3. Cookie parsing errors will be eliminated
4. Overall system functionality will be restored

## Rollback Plan

If issues occur during implementation:
1. Revert the database changes using a rollback script
2. Restore the original database.types.ts file from version control
3. Revert any middleware changes
4. Test to confirm system is back to original state

## Testing Checklist

- [ ] Execute SQL script successfully
- [ ] Update database.types.ts with name column
- [ ] Test approve-registration API endpoint
- [ ] Verify no database schema errors
- [ ] Check middleware implementation
- [ ] Verify Supabase client configuration
- [ ] Test cookie handling
- [ ] Confirm no more cookie parsing errors
- [ ] Test overall application functionality