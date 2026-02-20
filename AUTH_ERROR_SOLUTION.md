# 🔧 Authentication Error Solution

## ❌ Error
```
Could not find the 'prn' column of 'students' in the schema cache
```

## 🎯 Root Cause
1. **Schema Mismatch**: The `students` table has `prn` as `NOT NULL`, but authentication code tries to insert with temporary PRN
2. **PostgREST Cache**: The schema cache is out of sync with actual database structure
3. **RLS Policies**: Row Level Security might be blocking the insert operation

## ✅ Quick Fix (5 minutes)

### Step 1: Run SQL Script
Open **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Copy and paste contents of quick_fix_auth.sql
-- OR run this directly:

ALTER TABLE students ALTER COLUMN prn DROP NOT NULL;
ALTER TABLE students ALTER COLUMN department DROP NOT NULL;
ALTER TABLE students ALTER COLUMN year DROP NOT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
NOTIFY pgrst, 'reload schema';
```

### Step 2: Restart Your Dev Server
```bash
# In your terminal, stop the server (Ctrl+C) and restart:
npm run dev
```

### Step 3: Clear Browser Cache
- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or open DevTools → Application → Clear Storage → Clear site data

### Step 4: Test Login
Try logging in again. It should now work! ✨

## 📁 Files Created
1. **quick_fix_auth.sql** - Quick SQL fix (run this first!)
2. **fix_students_schema.sql** - Comprehensive fix with detailed checks
3. **AUTHENTICATION_FIX_INSTRUCTIONS.md** - Detailed troubleshooting guide

## 🔍 What the Fix Does

### Before (❌ Broken)
```typescript
// Tries to insert with NOT NULL constraint on prn
INSERT INTO students (email, name, prn, department, year)
VALUES ('user@email.com', 'John', 'TEMP_123', 'CSE', 'third')
// ❌ FAILS: prn column not found in schema cache
```

### After (✅ Working)
```typescript
// Inserts with nullable prn column
INSERT INTO students (email, name, prn, department, year, registration_completed)
VALUES ('user@email.com', 'John', 'TEMP_123', 'CSE', 'third', false)
// ✅ SUCCESS: Record created, user can complete registration later
```

## 🎨 Authentication Flow

```
1. User Login
   ↓
2. Supabase Auth (email/password)
   ↓
3. Check if student exists in database
   ↓
4. If NOT exists → Create student record
   - email: from auth
   - name: from auth metadata
   - prn: TEMP_timestamp
   - department: CSE (default)
   - year: third (default)
   - registration_completed: false
   ↓
5. Return student data
   ↓
6. User completes registration later
```

## 🚨 Troubleshooting

### Error still persists?
1. **Wait 2-3 minutes** for PostgREST cache to refresh
2. **Restart Supabase** (if using local instance):
   ```bash
   supabase stop
   supabase start
   ```
3. **Check environment variables** in `.env.local`
4. **Verify SQL ran successfully** - check for error messages

### RLS Error?
If you see "row-level security" errors:
```sql
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
```

### Schema Cache Not Refreshing?
Manually trigger refresh:
```sql
NOTIFY pgrst, 'reload schema';
```
Or wait 5-10 minutes for automatic refresh.

## 📊 Verify the Fix

Run this query to confirm:
```sql
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
AND column_name IN ('prn', 'department', 'year');
```

Expected output:
```
column_name  | is_nullable
-------------|------------
prn          | YES
department   | YES
year         | YES
```

## 🎯 Next Steps

After authentication works:
1. ✅ Test student login flow
2. ✅ Test faculty login flow  
3. ✅ Implement registration completion
4. ✅ Add PRN validation
5. ✅ Re-enable RLS with proper policies (for production)

## 💡 Why This Happened

The original schema had strict `NOT NULL` constraints that conflicted with the authentication flow:
- **Original Design**: Expected complete data during first insert
- **Authentication Flow**: Creates minimal record first, completes later
- **Solution**: Made columns nullable to support two-phase registration

## 🔐 Security Note

RLS is currently **disabled** for development. Before deploying to production:

```sql
-- Re-enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Students view own data" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students update own data" ON students
  FOR UPDATE USING (auth.uid() = id);
```

---

**Need help?** Check `AUTHENTICATION_FIX_INSTRUCTIONS.md` for detailed troubleshooting.
