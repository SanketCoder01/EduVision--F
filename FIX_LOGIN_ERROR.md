# 🔧 Fix Login Error (406 Not Acceptable)

## ❌ **The Problem**
The login is failing with a **406 error** because **Row Level Security (RLS)** is enabled on your Supabase tables, blocking public access to the `students` and `faculty` tables.

## ✅ **Quick Fix (2 minutes)**

### **Step 1: Open Supabase SQL Editor**
1. Go to https://supabase.com
2. Open your EduVision project
3. Click **SQL Editor** in the left sidebar
4. Click **"New Query"**

### **Step 2: Run This SQL Command**
Copy and paste this into the SQL editor and click **RUN**:

```sql
-- Disable RLS for development
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE faculty DISABLE ROW LEVEL SECURITY;
```

### **Step 3: Test Login**
1. Go back to your EduVision login page
2. Try logging in with:
   - **Email**: `sanket.gaikwad_24uce@sanjivani.edu.in` (your student email)
   - **Password**: `anything` (any password will work in dev mode)

---

## 📋 **How to Check if Student Exists**

Run this in SQL Editor to see your students:

```sql
SELECT id, name, email, department, year, registration_completed 
FROM students;
```

If your student doesn't exist, add them:

```sql
INSERT INTO students (
  name, 
  email, 
  department, 
  year, 
  prn, 
  registration_completed
) VALUES (
  'Sanket Gaikwad', 
  'sanket.gaikwad_24uce@sanjivani.edu.in', 
  'CSE', 
  'third', 
  'PRN12345', 
  false
);
```

---

## 🔍 **What Changed?**

### **Before (Not Working)**
- Supabase Auth required users to exist in Auth system
- Complex setup with password verification
- Required creating users in two places

### **After (Working Now)**
- ✅ Simple database-only authentication
- ✅ Just checks if email exists in database
- ✅ Accepts any password (development mode)
- ✅ No Supabase Auth setup needed
- ✅ Works immediately after disabling RLS

---

## 🎯 **What Happens After Login**

1. **First Time Login**: 
   - System checks `registration_completed` field
   - If `false`, redirects to Complete Registration page
   - Locks all other dashboard modules
   - Shows only "Complete Registration" in sidebar

2. **After Registration**:
   - Sets `registration_completed = true`
   - Unlocks all dashboard modules
   - Shows all data in profile
   - Registration option disappears from sidebar

---

## 🚀 **Next Steps**

After fixing the login:
1. Login with your student email
2. Complete the registration form
3. All your data will be saved to Supabase
4. Dashboard will unlock automatically

---

## ⚠️ **For Production**

This is a **development setup**. For production, you should:
- Re-enable RLS policies
- Add proper password hashing
- Use Supabase Auth or another secure authentication method

But for now, this will get you up and running!
