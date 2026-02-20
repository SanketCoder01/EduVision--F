# 🚀 COMPLETE SETUP - CORRECT ORDER

## 📋 **RUN IN THIS EXACT ORDER:**

### **STEP 1: Fix Year Column** ⚡
```
File: SAFE_YEAR_FIX.sql
What: Adds year column + creates students VIEW
Run: Supabase Dashboard → SQL Editor
```

### **STEP 2: Fix RLS Policies** ⚡
```
File: FIX_RLS_POLICIES.sql
What: Fixes "violates row-level security" error
Run: Supabase Dashboard → SQL Editor
```

### **STEP 3: Create Module Tables** ⚡
```
File: COMPLETE_REALTIME_FIX.sql
What: Creates all tables + enables real-time
Run: Supabase Dashboard → SQL Editor
```

### **STEP 4: Setup Files** 📁
```
Script: setup-all-modules.ps1
What: Activates new module files
Run: PowerShell in project root
```

### **STEP 5: Install & Run** 🏃
```bash
npm install tesseract.js
npm run dev
```

---

## ✅ **WHAT EACH FILE FIXES:**

### **1. SAFE_YEAR_FIX.sql**
**Fixes:**
- ❌ "column year does not exist"
- ❌ "students table/view not found"
- ❌ Dean dashboard errors
- ❌ Expense sharing errors

**Creates:**
- ✅ `year` column in all 16 student tables
- ✅ `students` VIEW (unified)
- ✅ `year` in `user_profiles`

### **2. FIX_RLS_POLICIES.sql**
**Fixes:**
- ❌ "new row violates row-level security policy"
- ❌ Faculty can't create assignments
- ❌ Faculty can't create announcements
- ❌ Faculty can't upload materials

**Creates:**
- ✅ Proper INSERT policies for faculty
- ✅ Proper SELECT policies for students
- ✅ Proper UPDATE/DELETE policies

### **3. COMPLETE_REALTIME_FIX.sql**
**Fixes:**
- ❌ Missing module tables
- ❌ No real-time updates
- ❌ Missing RLS policies

**Creates:**
- ✅ All module tables
- ✅ Real-time subscriptions
- ✅ Additional RLS policies
- ✅ Grants permissions

---

## 🧪 **TESTING AFTER SETUP:**

### **Test 1: Year Column**
```sql
SELECT * FROM students LIMIT 10;
```
**Expected:** Returns students with year ✅

### **Test 2: Create Assignment**
```
1. Login as faculty
2. Go to Assignments
3. Create new assignment
4. Should save without RLS error ✅
```

### **Test 3: Upload Timetable**
```
1. Login as faculty
2. Go to Timetable
3. Upload image
4. OCR extracts real data ✅
5. Saves to Supabase ✅
```

### **Test 4: Upload Study Material**
```
1. Login as faculty
2. Go to Study Materials
3. Upload PDF
4. Saves to Supabase ✅
5. Student sees it instantly ✅
```

---

## ❌ **COMMON ERRORS & FIXES:**

### **Error: "column year does not exist"**
**Solution:** Run `SAFE_YEAR_FIX.sql`

### **Error: "violates row-level security policy"**
**Solution:** Run `FIX_RLS_POLICIES.sql`

### **Error: "table assignments does not exist"**
**Solution:** Run `COMPLETE_REALTIME_FIX.sql`

### **Error: Still seeing fake timetable data**
**Solution:** Run `setup-all-modules.ps1`

---

## 📁 **ALL FILES YOU NEED:**

### **SQL Files (Run in Supabase):**
1. ✅ `SAFE_YEAR_FIX.sql` - Run FIRST
2. ✅ `FIX_RLS_POLICIES.sql` - Run SECOND
3. ✅ `COMPLETE_REALTIME_FIX.sql` - Run THIRD

### **Setup Script:**
4. ✅ `setup-all-modules.ps1` - Run FOURTH

### **Optional Check:**
5. ⚠️ `CHECK_STUDENT_COLUMNS.sql` - Check schema

---

## 🎯 **SUCCESS INDICATORS:**

After all steps, you should have:

✅ No "column year does not exist" errors
✅ No "violates row-level security" errors
✅ Faculty can create assignments
✅ Faculty can upload timetables
✅ Faculty can upload study materials
✅ Students see content instantly
✅ Real-time updates work
✅ OCR shows real data (not fake)

---

## 📊 **WHAT WILL WORK:**

| Module | Faculty | Student | Real-Time |
|--------|---------|---------|-----------|
| Assignments | ✅ Create | ✅ View | ✅ Yes |
| Timetable | ✅ Upload | ✅ View | ✅ Yes |
| Study Materials | ✅ Upload | ✅ View | ✅ Yes |
| Announcements | ✅ Create | ✅ View | ✅ Yes |
| Study Groups | ✅ Create | ✅ Join | ✅ Yes |
| Events | ✅ Create | ✅ View | ✅ Yes |

---

## 🎉 **READY TO START!**

Follow the 5 steps above in order!

**Start with STEP 1 now!** 🚀
