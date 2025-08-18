# Admin Access Guide

## 🏛️ How to Access Admin Dashboard

### **Step 1: Navigate to Admin Login**
Go to: `http://localhost:3000/admin/login`

### **Step 2: Use Demo Admin Credentials**
**Email:** Any of these:
- `sanket.gaikwad_24uce@sanjivani.edu.in`
- `admin@sanjivani.edu.in`
- `test@admin.sanjivani.edu.in`

**Password:** Any password (demo mode)

### **Step 3: Access Admin Dashboard**
After login, you'll be redirected to:
`http://localhost:3000/admin/registration-approvals`

## 🔧 Admin Dashboard Features
### **📊 Registration Management**
- View all pending registrations
- Approve/Reject user registrations
- See captured face images
- Real-time updates

### **🔍 Search & Filter**
- Search by email or department
- Filter by user type (Student/Faculty)
- Filter by department

### **📈 Statistics**
- Total registrations
- Pending approvals
- Approved users
- Rejected applications

## 🚀 Quick Start

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Access admin login:**
   ```
   http://localhost:3000/admin/login
   ```

3. **Login with demo credentials:**
   - Email: `admin@sanjivani.edu.in`
   - Password: `anypassword`

4. **Manage registrations:**
   - View pending registrations
   - Approve or reject users
   - Monitor statistics

## 🔐 Security Notes

- **Demo Mode:** Currently allows any password for admin emails
- **Production:** Should implement proper authentication
- **Admin Emails:** Only specific emails can access admin features

## 📱 Admin Navigation

- **Dashboard:** Overview and statistics
- **Registration Approvals:** Main admin interface
- **Settings:** Admin configuration (future)

## 🎯 Admin Actions

### **Approve Registration**
1. Click "Approve" button
2. Confirm action
3. User gets access to dashboard

### **Reject Registration**
1. Click "Reject" button
2. Enter rejection reason (optional)
3. Confirm action
4. User can reapply

## 🔄 Real-time Updates

The admin dashboard updates automatically when:
- New registrations are submitted
- Users complete face capture
- Registration status changes

## 🛠️ Troubleshooting

### **Can't Access Admin Page?**
1. Make sure you're logged in with admin email
2. Check if admin session is active
3. Try logging out and back in
4. Clear browser cache and localStorage
5. Use the debug page: `/admin/debug`

### **Getting Redirected to Login?**
1. Check if localStorage is working in your browser
2. Try using the debug page to test authentication
3. Clear all localStorage and try again
4. Check browser console for errors

### **No Registrations Showing?**
1. Check if users have completed registration
2. Verify database connection
3. Check API endpoints

### **Approval Not Working?**
1. Check browser console for errors
2. Verify API response
3. Check database permissions

### **Debug Tools**
Visit `/admin/debug` to:
- Check authentication status
- View localStorage values
- Test login/logout functions
- Clear session data
- Navigate between admin pages
