# 🚨 EMERGENCY FIX - DO THIS NOW

## Problem
Schema cache not refreshed. The column exists but PostgREST doesn't know about it yet.

## ✅ Solution (3 Steps)

### Step 1: Run SQL (30 seconds)
1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy **ALL** from `EMERGENCY_FIX.sql`
3. Click **Run**
4. **WAIT 30 SECONDS** (important!)

### Step 2: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 3: Clear Cache & Test
- Press `Ctrl + Shift + R`
- Try login again

---

## ✅ Code Already Fixed
- `lib/simple-auth.ts` updated to work without `registration_completed` field
- Will insert only: `email`, `name`, `prn`

## 🎯 What EMERGENCY_FIX.sql Does
1. Adds `registration_completed` column to all 16 tables
2. Makes `prn` nullable
3. Disables RLS
4. Forces schema cache reload
5. **WAIT 30 SECONDS** after running!

---

## If Still Not Working

### Option A: Manual Schema Reload
Go to Supabase Dashboard → Settings → API → Click **"Restart PostgREST"**

### Option B: Wait Longer
Sometimes cache takes 2-3 minutes to refresh. Be patient.

### Option C: Check Column Exists
Run this in SQL Editor:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'students_cse_3rd_year';
```

Should show `registration_completed` in the list.

---

**TL;DR:** Run `EMERGENCY_FIX.sql` → Wait 30 seconds → Restart server → Try again
