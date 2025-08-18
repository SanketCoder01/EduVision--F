# EduVision System Issues and Solutions

## Problem Summary

The EduVision system is experiencing two main issues:

1. **Database Schema Error**: "Could not find the 'name' column of 'students' in the schema cache"
2. **Cookie Parsing Error**: "Failed to parse cookie string: [SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON]"

## Root Cause Analysis

### Database Schema Issue
- The `students` table in the database is missing the `name` column
- The `approve-registration/route.ts` API is trying to insert a `name` field when creating student records
- This causes a PostgREST error (PGRST204) because the column doesn't exist in the schema cache

### Cookie Parsing Issue
- Cookies are not being properly serialized/deserialized
- The "base64-eyJ" prefix indicates base64-encoded JSON data that is malformed
- This suggests issues with middleware implementation or Supabase client configuration

## Solution Components

### 1. Database Schema Fixes

#### SQL Script Updates
A new SQL script has been created (`scripts/fix-students-faculty-schema-updated.md`) that adds:
- `name` column to the `students` table
- `face_data` column (JSONB) to both `students` and `faculty` tables
- `face_url` column (TEXT) to both tables
- `face_registered` column (BOOLEAN) to both tables
- `face_registered_at` column (TIMESTAMP WITH TIME ZONE) to both tables
- `password_hash` column (TEXT) to both tables
- `designation`, `qualification`, and `experience_years` columns to the `faculty` table

#### Database Types Updates
The `types/database.types.ts` file needs to be updated to include:
- `name: string | null` in the `students` table Row definition
- `name?: string | null` in the `students` table Insert definition
- `name?: string | null` in the `students` table Update definition
- Similar updates for all other new columns

### 2. Cookie Parsing Fixes

#### Middleware Review
- Check the middleware implementation for proper cookie handling
- Verify Supabase client configuration in `lib/supabase/server.ts`
- Ensure cookies are properly serialized/deserialized

#### Implementation Steps
1. Review middleware code for cookie handling logic
2. Check Supabase client initialization
3. Test cookie serialization/deserialization functions

## Implementation Plan

### Phase 1: Database Schema Fix
1. Execute the updated SQL script to add missing columns
2. Update the database types file to reflect these changes
3. Test the approve-registration API endpoint

### Phase 2: Cookie Issue Fix
1. Review middleware implementation
2. Check Supabase client configuration
3. Test cookie handling

### Phase 3: Testing and Verification
1. Test the approve-registration API endpoint
2. Verify all database operations work correctly
3. Ensure no more cookie parsing errors
4. Test overall application functionality

## Files to be Modified

1. `scripts/fix-students-faculty-schema-updated.sql` - Database schema updates
2. `types/database.types.ts` - Database types file updates
3. `middleware.ts` - Middleware implementation (if needed)
4. `lib/supabase/server.ts` - Supabase client configuration (if needed)

## Expected Outcomes

1. The approve-registration API will successfully create student records
2. The "name column not found" error will be resolved
3. Cookie parsing errors will be eliminated
4. Overall system functionality will be restored