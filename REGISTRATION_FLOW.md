# EduVision Registration Flow

This document explains the complete registration flow for students and faculty in the EduVision system.

## Overview

The registration flow consists of the following steps:
1. Landing Page → Login Selection
2. Google Sign-In
3. Registration Form (Student/Faculty specific)
4. Face Capture (Python App)
5. Pending Approval
6. Admin Approval
7. Dashboard Access

## Flow Details

### 1. Landing Page (`/`)
- Beautiful animated landing page with Sanjivani University branding
- "Get Started" button leads to welcome page
- Welcome page has separate buttons for Student and Faculty login

### 2. Login Page (`/login`)
- Tabbed interface for Student and Faculty login
- Google Sign-In integration
- Redirects to appropriate registration based on user type

### 3. Registration Forms

#### Student Registration (`/student-registration`)
- Pre-filled with Google account information
- Department selection (CSE, Cyber Security, AIDS, AIML)
- Year of study selection (1st-4th year)
- Mobile number and password
- Redirects to face capture after form submission

#### Faculty Registration (`/faculty-registration`)
- Pre-filled with Google account information
- Department selection
- Mobile number and password
- Redirects to face capture after form submission

### 4. Face Capture

#### Python Flask App (`face-capture-flask/`)
- **Features:**
  - Automatic face detection using OpenCV
  - Circular overlay around detected faces
  - Auto-capture after 2 seconds of face detection
  - Real-time face detection feedback
  - Image quality validation

- **Endpoints:**
  - `POST /start_capture` - Initialize camera and start capture
  - `POST /stop_capture` - Stop camera capture
  - `GET /get_captured_image` - Retrieve captured image
  - `POST /upload_to_webapp` - Upload to main web application
  - `GET /status` - Get current capture status

- **Usage:**
  ```bash
  cd face-capture-flask
  pip install -r requirements.txt
  python app.py
  ```
  Access at `http://localhost:5000`

### 5. Pending Approval (`/auth/pending-approval`)
- Real-time status checking
- Shows registration details
- Automatic redirect when approved/rejected
- Real-time updates via Supabase subscriptions

### 6. Admin Approval (`/admin/registration-approvals`)
- Admin dashboard for reviewing registrations
- Approve/Reject with comments
- View captured face images
- Real-time updates
- Filtering and search capabilities

### 7. Dashboard Access
- **Students:** `/student-dashboard`
- **Faculty:** `/faculty-dashboard`
- Automatic redirect after approval

## Database Schema

### `pending_registrations` Table
```sql
CREATE TABLE pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'faculty')),
  department TEXT NOT NULL,
  year TEXT,
  phone TEXT,
  name TEXT,
  face_url TEXT,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `students` Table
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  phone TEXT,
  face_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `faculty` Table
```sql
CREATE TABLE faculty (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  face_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Registration APIs
- `POST /api/auth/secure-registration` - Submit registration form
- `POST /api/student/complete-registration` - Complete student registration with face image
- `POST /api/faculty/complete-registration` - Complete faculty registration with face image

### Admin APIs
- `GET /api/admin/pending-registrations` - Get all pending registrations
- `POST /api/admin/approve-registration` - Approve/reject registration

## Middleware

The `middleware.ts` file handles:
- Authentication checks
- Automatic redirects based on registration status
- Admin route protection
- Dashboard routing logic

## Key Features

### 1. Face Recognition Integration
- Captured face images are stored in Supabase Storage
- Used for attendance system
- Automatic face detection and quality validation

### 2. Real-time Updates
- Supabase real-time subscriptions for status updates
- Automatic page refreshes when approval status changes

### 3. Security
- Admin-only access to approval system
- Email domain validation
- Secure file uploads

### 4. User Experience
- Smooth animations and transitions
- Clear status indicators
- Responsive design
- Error handling and user feedback

## Setup Instructions

### 1. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup
Run the SQL migrations in `supabase/migrations/` to create the necessary tables.

### 3. Storage Bucket
Create a `profile-images` bucket in Supabase Storage with appropriate policies.

### 4. Python Face Capture App
```bash
cd face-capture-flask
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 5. Web Application
```bash
npm install
npm run dev
```

## Testing the Flow

1. Start both the web app and Python face capture app
2. Navigate to the landing page
3. Click "Student Login" or "Faculty Login"
4. Sign in with Google
5. Fill out the registration form
6. Capture face image using the Python app
7. Wait for admin approval
8. Access dashboard after approval

## Troubleshooting

### Common Issues
1. **Camera not working**: Ensure camera permissions are granted
2. **Face detection not working**: Check OpenCV installation
3. **Upload failures**: Verify Supabase Storage configuration
4. **Approval not working**: Check admin email configuration

### Debug Mode
Enable debug logging in both applications for detailed error information.

## Future Enhancements

1. **Advanced Face Recognition**: Integration with face recognition APIs
2. **Bulk Approval**: Admin can approve multiple registrations at once
3. **Email Notifications**: Automatic email notifications for status changes
4. **Mobile App**: Native mobile application for face capture
5. **Analytics**: Registration analytics and reporting
