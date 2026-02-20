# Dean Account Setup Guide

## ⚠️ IMPORTANT: The 400 Error Fix

The **400 Bad Request** error occurs because the dean user doesn't exist in **Supabase Authentication**. You need to create the user in **TWO** places:

1. ✅ Supabase Authentication (for login) - **YOU NEED TO DO THIS**
2. ✅ Deans database table (for profile data)

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Dean User in Supabase Authentication**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `jtguryzyprgqraimyimt`
3. Navigate to: **Authentication** → **Users** (left sidebar)
4. Click: **"Add user"** → **"Create new user"**
5. Fill in:
   - **Email**: `dean123@sanjivani.edu.in`
   - **Password**: `dean@123`
   - **Auto Confirm User**: ✅ **ENABLE THIS** (important!)
6. Click: **"Create user"**

### **Step 2: Get the User ID**

After creating the user, you'll see a **UUID** (something like `a1b2c3d4-e5f6-7890-abcd-ef1234567890`). 

**COPY THIS UUID** - you'll need it for Step 3.

### **Step 3: Create Dean Profile in Database**

Run this SQL in **Supabase SQL Editor**:

```sql
-- Replace 'YOUR_AUTH_USER_ID_HERE' with the UUID from Step 2
INSERT INTO deans (
    id,
    name,
    email,
    department,
    designation,
    phone
) VALUES (
    'YOUR_AUTH_USER_ID_HERE'::uuid,  -- Replace with actual UUID from Step 2
    'Dr. Dean Admin',
    'dean123@sanjivani.edu.in',
    'Computer Science & Engineering',
    'Dean of Engineering',
    '+91 9876543210'
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name;
```

### **Step 4: Fix RLS Policies (if needed)**

Run this SQL to ensure proper authentication:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Deans can view their own profile" ON deans;
DROP POLICY IF EXISTS "Deans can update their own profile" ON deans;

-- Create new policies that work with email-based auth
CREATE POLICY "Authenticated users can view deans"
    ON deans FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Deans can update their own profile"
    ON deans FOR UPDATE
    TO authenticated
    USING (email = auth.jwt()->>'email');

-- Allow deans to insert their profile
CREATE POLICY "Deans can insert their profile"
    ON deans FOR INSERT
    TO authenticated
    WITH CHECK (email = auth.jwt()->>'email');
```

---

## 🔐 Login Credentials

- **URL**: `http://localhost:3000/deanlogin`
- **Email**: `dean123@sanjivani.edu.in`
- **Password**: `dean@123`

---

## ✅ Verification Steps

1. Open browser: `http://localhost:3000/deanlogin`
2. Enter email: `dean123@sanjivani.edu.in`
3. Enter password: `dean@123`
4. Click **"Sign In to Dashboard"**
5. You should be redirected to: `/dean-dashboard`

---

## 🔄 Password Management

### **How Password Changes Work:**

The system uses **Supabase Auth** which automatically handles password updates:

1. Dean logs into dashboard
2. Goes to **Profile** module
3. Clicks **"Change Password"**
4. Enters new password
5. System calls: `supabase.auth.updateUser({ password: newPassword })`
6. ✅ **Password automatically updates in Supabase Authentication**

**No manual database updates needed!** The password is stored securely in Supabase's auth system, not in the deans table.

---

## 🐛 Troubleshooting

### Error: "400 Bad Request"
- ❌ **Cause**: User doesn't exist in Supabase Authentication
- ✅ **Fix**: Complete Step 1 above

### Error: "Access Denied - Not authorized as dean"
- ❌ **Cause**: User exists in auth but not in deans table
- ✅ **Fix**: Complete Step 3 above

### Error: "Invalid email or password"
- ❌ **Cause**: Wrong credentials or user not confirmed
- ✅ **Fix**: Check email/password and ensure "Auto Confirm User" was enabled

### Error: RLS policy violations
- ❌ **Cause**: UUID mismatch between auth and deans table
- ✅ **Fix**: Complete Step 4 above

---

## 📝 Quick Setup Script

If you want to do it all at once, run this after creating the auth user:

```sql
-- 1. Get the auth user ID (replace with actual email)
DO $$
DECLARE
    dean_auth_id uuid;
BEGIN
    -- This won't work directly, you need to get it from the Supabase dashboard
    -- But here's the structure for reference
    
    -- Insert dean profile (use actual UUID from authentication)
    INSERT INTO deans (id, name, email, department, designation, phone)
    VALUES (
        'PASTE_UUID_HERE'::uuid,
        'Dr. Dean Admin',
        'dean123@sanjivani.edu.in',
        'Computer Science & Engineering',
        'Dean of Engineering',
        '+91 9876543210'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name;
END $$;
```

---

## 🎯 Summary

**The key issue:** Supabase Authentication and Database are separate systems.

- **Authentication** = Login system (email + password)
- **Database** = Profile data (name, department, phone, etc.)

Both need the **same UUID** to work together!

**After setup, the system is fully dynamic:**
- ✅ Login works with Supabase Auth
- ✅ Password changes update automatically
- ✅ Profile changes sync immediately
- ✅ No hardcoded credentials anywhere

---

## 📞 Need Help?

If you're still having issues:
1. Check Supabase Authentication → Users (is the user there?)
2. Check deans table (does the email match?)
3. Check the UUID matches in both places
4. Verify "Auto Confirm User" was enabled
