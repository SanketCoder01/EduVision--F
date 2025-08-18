# Architecture Summary for Code Implementation

This document summarizes the architectural analysis and planning work completed for fixing the EduVision system issues. It provides clear instructions for implementing the fixes in Code mode.

## Problem Statement

The EduVision system has two critical issues:

1. **Database Schema Error**: "Could not find the 'name' column of 'students' in the schema cache" (PGRST204)
2. **Cookie Parsing Error**: "Failed to parse cookie string: [SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON]"

## Root Cause Analysis

### Database Schema Issue
- The `students` table in the database is missing the `name` column
- The `approve-registration/route.ts` API is trying to insert a `name` field when creating student records
- This causes a PostgREST error because the column doesn't exist in the schema cache

### Cookie Parsing Issue
- Cookies are not being properly serialized/deserialized
- The "base64-eyJ" prefix indicates base64-encoded JSON data that is malformed
- This suggests issues with middleware implementation or Supabase client configuration

## Solution Overview

### Database Schema Fix
1. Add the missing `name` column to the `students` table in the database
2. Update the database types file to reflect this change
3. Add other missing columns for complete schema alignment

### Cookie Parsing Fix
1. Review middleware implementation for proper cookie handling
2. Verify Supabase client configuration
3. Ensure cookies are properly serialized/deserialized

## Implementation Instructions for Code Mode

### Task 1: Fix Database Schema Issue

#### Step 1: Execute SQL Script
File: `scripts/fix-students-faculty-schema-updated.sql`

Execute this script in your Supabase SQL Editor to add all missing columns:
- `name` column to the `students` table
- `face_data`, `face_url`, `face_registered`, `face_registered_at`, `password_hash` columns to both `students` and `faculty` tables
- `designation`, `qualification`, `experience_years` columns to the `faculty` table

#### Step 2: Update Database Types File
File: `types/database.types.ts`

Modify the `students` table definition to include the `name` column:
- In the `Row` interface, add: `name: string | null`
- In the `Insert` interface, add: `name?: string | null`
- In the `Update` interface, add: `name?: string | null`

#### Step 3: Test the Fix
Test the approve-registration API endpoint to verify the error is resolved.

### Task 2: Fix Cookie Parsing Issue

#### Step 1: Review Middleware
File: `middleware.ts` (or equivalent)

Check for proper cookie handling:
- Ensure cookies are properly serialized before being sent
- Verify cookies are properly deserialized when received
- Check for any base64 encoding/decoding issues

#### Step 2: Check Supabase Client Configuration
File: `lib/supabase/server.ts` (or equivalent)

Verify:
- Proper initialization of Supabase client
- Correct cookie handling in Supabase auth configuration
- Proper session management

#### Step 3: Test Cookie Handling
Verify that cookies are properly formatted as JSON and can be parsed without errors.

## Files to be Modified

1. Database (via SQL script execution)
2. `types/database.types.ts` - Add `name` column to students table
3. `middleware.ts` - Review and fix cookie handling (if needed)
4. `lib/supabase/server.ts` - Verify Supabase client configuration (if needed)

## Expected Outcomes

1. The approve-registration API will successfully create student records
2. The "name column not found" error will be resolved
3. Cookie parsing errors will be eliminated
4. Overall system functionality will be restored

## Supporting Documentation

- `SOLUTION_OVERVIEW.md` - Complete solution overview
- `IMPLEMENTATION_PLAN.md` - Detailed implementation plan
- `types/database.types.update.spec.md` - Exact changes needed for database types
- `scripts/fix-students-faculty-schema-updated.md` - Updated SQL script

## Next Steps

Switch to Code mode to implement these fixes according to the detailed instructions above.