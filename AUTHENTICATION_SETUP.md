# Authentication Setup Guide

## 🔴 **Current Issue: Login Failed**

The login is failing because Supabase Auth requires users to be created in **two places**:
1. Supabase Authentication (Auth Users)
2. Your database tables (students/faculty)

## 🛠️ **Quick Fix Options**

### **Option 1: Create Supabase Auth Users (Recommended for Production)**

1. **Go to Supabase Dashboard**
   - Open your project at https://supabase.com
   - Navigate to: **Authentication** → **Users**

2. **Add Student User**
   - Click "Add User" button
   - Email: `student@sanjivani.edu.in`
   - Password: `password123` (or your choice)
   - ✅ Enable "Auto Confirm User"
   - Click "Create User"

3. **Add Faculty User**
   - Click "Add User" button
   - Email: `faculty@sanjivani.edu.in`
   - Password: `password123` (or your choice)
   - ✅ Enable "Auto Confirm User"
   - Click "Create User"

4. **Verify Database Entries Exist**
   - Go to **Table Editor** → **students** table
   - Make sure there's a student with email: `student@sanjivani.edu.in`
   - Go to **Table Editor** → **faculty** table
   - Make sure there's a faculty with email: `faculty@sanjivani.edu.in`

5. **Test Login**
   - Try logging in with the credentials you created

---

### **Option 2: Use Database-Only Authentication (Simpler for Development)**

I can modify the login to check the database directly without Supabase Auth. This is simpler for development but less secure.

**Pros:**
- No need to create Auth users
- Works with just database entries
- Faster development

**Cons:**
- Less secure (no password hashing)
- Not recommended for production

Would you like me to implement Option 2?

---

## 📋 **Current Database Check**

Run this in Supabase SQL Editor to see your existing users:

```sql
-- Check students
SELECT id, name, email, department, year, registration_completed 
FROM students;

-- Check faculty
SELECT id, name, email, department, registration_completed 
FROM faculty;
```

---

## 🔑 **What Each Login Method Does**

### **Current Implementation (Supabase Auth)**
```typescript
// 1. Authenticate with Supabase Auth
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// 2. Fetch user data from database
const { data: student } = await supabase
  .from('students')
  .select('*')
  .eq('email', email)
  .single()
```

### **Alternative (Database-Only)**
```typescript
// Just check database directly
const { data: student } = await supabase
  .from('students')
  .select('*')
  .eq('email', email)
  .eq('password', password) // Store hashed passwords
  .single()
```

---

## ✅ **Recommended Steps**

1. **For immediate testing**: Use Option 1 (create Auth users in dashboard)
2. **For production**: Keep Supabase Auth (current implementation)
3. **For quick development**: I can implement Option 2

Let me know which approach you prefer!
