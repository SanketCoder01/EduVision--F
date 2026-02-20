# Authentication Schema Fix Instructions

## Problem
The error `Could not find the 'prn' column of 'students' in the schema cache` indicates that:
1. The PostgREST schema cache is out of sync with the actual database
2. The `students` table structure doesn't match what the authentication code expects

## Solution

### Step 1: Run the SQL Fix Script
Execute the `fix_students_schema.sql` file in your Supabase SQL Editor:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `fix_students_schema.sql`
4. Click "Run"

### Step 2: Restart PostgREST (Refresh Schema Cache)
After running the SQL script, you need to refresh the PostgREST schema cache:

**Option A: Via Supabase Dashboard**
1. Go to Settings → API
2. Click "Restart PostgREST" or wait a few minutes for auto-refresh

**Option B: Via SQL (Automatic)**
The script already includes `NOTIFY pgrst, 'reload schema';` which should trigger a refresh.

**Option C: Restart Local Supabase (if using local instance)**
```bash
supabase stop
supabase start
```

### Step 3: Verify the Fix
Run this query in Supabase SQL Editor to verify:

```sql
-- Check students table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- Check if RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'students';
```

Expected results:
- `prn` column should exist and be nullable (YES)
- `department` should be nullable (YES)
- `year` should be nullable (YES)
- `registration_completed` should exist with default FALSE
- `rowsecurity` should be `f` (false/disabled)

### Step 4: Test Authentication
Try logging in again. The authentication flow should now work:
1. User enters email/password
2. Supabase Auth authenticates
3. System checks if student exists in database
4. If not, creates student record with temporary PRN
5. User can complete registration later

## What Changed

### Database Schema
- **prn**: Changed from `NOT NULL` to `NULLABLE` (allows temp PRN during auth)
- **department**: Changed to `NULLABLE` (set during registration)
- **year**: Changed to `NULLABLE` (set during registration)
- **registration_completed**: Added to track registration status

### Authentication Flow
```typescript
// Before: Failed because prn was required
INSERT INTO students (email, name, prn) VALUES (...)

// After: Works with temporary PRN
INSERT INTO students (
  email, 
  name, 
  prn,  // 'TEMP_' + timestamp
  department,  // 'CSE' (default)
  year,  // 'third' (default)
  registration_completed  // false
) VALUES (...)
```

## Troubleshooting

### If error persists after running SQL:
1. **Clear browser cache** and reload the page
2. **Restart your Next.js dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. **Check Supabase connection** in browser console
4. **Verify environment variables** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

### If you see RLS errors:
The script disables RLS for development. To re-enable for production:
```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Add appropriate policies
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (auth.uid() = id);
```

### If schema cache still not refreshed:
Wait 5-10 minutes or manually restart PostgREST from Supabase dashboard.

## Next Steps
After authentication works:
1. Implement proper registration completion flow
2. Re-enable RLS with appropriate policies
3. Add validation for PRN format
4. Implement department verification
