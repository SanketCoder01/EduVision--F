# EduVision Setup Instructions

## 🚀 Quick Setup (3 Steps)

### Step 1: Run the SQL Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire content from:
   ```
   supabase/migrations/200_complete_department_security_realtime.sql
   ```
5. Click **Run** (or press F5)
6. ✅ You should see "Success. No rows returned"

### Step 2: Enable Real-time

1. In Supabase Dashboard, go to **Database → Replication**
2. Find and enable real-time for these tables:
   - ✅ assignments
   - ✅ announcements
   - ✅ events
   - ✅ study_materials
   - ✅ timetable_entries
   - ✅ quizzes
   - ✅ attendance_sessions
   - ✅ study_groups
   - ✅ students
   - ✅ faculty

3. Click **Save** or **Enable** for each table

### Step 3: Test the System

1. **Test Faculty:**
   ```
   - Login as faculty
   - Should see RED registration banner
   - Complete registration (name, dept, designation)
   - Dashboard should unlock immediately
   ```

2. **Test Student:**
   ```
   - Login as student  
   - Should see RED registration banner
   - No assignments/content visible
   - Complete 19-step registration
   - Dashboard should fill with content
   ```

3. **Test Department Security:**
   ```
   - CSE faculty posts assignment → Only CSE students see it
   - CY faculty can post to CSE/AIDS/AIML/CY → Respective students see it
   - AIDS faculty posts to AIDS → Only AIDS students see it
   ```

## 🔍 Verification Commands

Run these in Supabase SQL Editor to verify setup:

### Check RLS is Enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('assignments', 'announcements', 'events', 'study_materials', 'students', 'faculty');
```
**Expected:** All should show `rowsecurity = true`

### Test Department Function:
```sql
-- CY should access CSE (TRUE)
SELECT can_faculty_access_department('CY', 'CSE');

-- CSE should NOT access AIDS (FALSE)
SELECT can_faculty_access_department('CSE', 'AIDS');

-- AIDS should access AIDS (TRUE)
SELECT can_faculty_access_department('AIDS', 'AIDS');
```

### Check Registration Columns:
```sql
-- Faculty table should have registration_completed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'faculty' 
AND column_name = 'registration_completed';

-- Students table should have registration_completed and registration_step
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('registration_completed', 'registration_step');
```

### Check Indexes:
```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE '%registration%';
```

## 🎯 Department Codes

Use these exact department codes:

- **CSE** → Computer Science & Engineering
- **CY** → Cyber Security
- **AIDS** → AI & Data Science
- **AIML** → AI & Machine Learning

## 📝 Important Notes

1. **Department Hierarchy:**
   - CY (Cyber Security) → Can access: CSE, AIDS, AIML, CY
   - CSE → Can access: CSE only
   - AIDS → Can access: AIDS only
   - AIML → Can access: AIML only

2. **Registration is Mandatory:**
   - No dashboard content visible until registration complete
   - Enforced at database level via RLS policies
   - Cannot be bypassed

3. **Real-time Updates:**
   - All changes appear instantly
   - No page refresh needed
   - Uses Supabase real-time subscriptions

4. **No Static Data:**
   - Everything comes from Supabase
   - No localStorage usage for content
   - All module data is dynamic

## 🐛 Troubleshooting

### Problem: "Permission denied for table assignments"
**Solution:** RLS policies not created properly. Re-run the migration.

### Problem: "Function can_faculty_access_department does not exist"
**Solution:** The function wasn't created. Re-run the migration from the beginning.

### Problem: Students see all departments' content
**Solution:** RLS policies not enforced. Check if RLS is enabled on the tables.

### Problem: Content not updating in real-time
**Solution:** 
1. Check if real-time is enabled in Supabase Dashboard
2. Verify the table is added to `supabase_realtime` publication
3. Check browser console for subscription errors

### Problem: Faculty can't post assignments
**Solution:** 
1. Ensure `registration_completed = TRUE` in faculty table
2. Check department value matches one of: CSE, CY, AIDS, AIML
3. Verify RLS policies allow INSERT

## ✅ Success Checklist

After setup, verify:

- [ ] SQL migration ran without errors
- [ ] Real-time enabled for all tables
- [ ] RLS is enabled (verification query returns true)
- [ ] Department function works (test queries return correct results)
- [ ] Faculty dashboard shows registration banner initially
- [ ] Student dashboard shows registration banner initially
- [ ] After registration, content becomes visible
- [ ] Faculty can only post to accessible departments
- [ ] Students see only their department/year content
- [ ] Real-time updates work (test by posting assignment)

## 🆘 Need Help?

If something isn't working:

1. Check the **SECURITY_AND_REALTIME_IMPLEMENTATION.md** file for detailed information
2. Run the verification commands above
3. Check Supabase Dashboard → Logs for errors
4. Verify environment variables are set correctly

## 🎉 You're All Set!

Once all checkboxes are ticked, your EduVision platform is fully secured with:
- ✅ Mandatory registration enforcement
- ✅ Department-based security
- ✅ Real-time data synchronization
- ✅ Complete privacy isolation
- ✅ Dynamic content delivery

Happy teaching and learning! 📚
