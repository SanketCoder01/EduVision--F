# Python Flask Attendance System Setup Guide

## 🎯 Overview

This guide will help you set up the Python Flask-based attendance system with face recognition and geo-location verification for Sanjivani University.

## 📋 Prerequisites

### System Requirements
- Python 3.8 or higher
- Node.js 16 or higher (for frontend)
- Git
- Webcam-enabled device
- GPS-enabled device (for geo-location)

### Python Dependencies
The system requires several Python packages for face recognition and web services.

## 🚀 Installation Steps

### 1. Backend Setup (Python Flask)

#### Step 1: Create Backend Directory
```bash
mkdir backend
cd backend
```

#### Step 2: Create Virtual Environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

#### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 4: Environment Configuration
Create a `.env` file in the backend directory:
```bash
# Copy the example file
cp env.example .env
```

Edit `.env` with your Supabase credentials:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Campus Coordinates (Sanjivani University)
CAMPUS_LATITUDE=19.8762
CAMPUS_LONGITUDE=73.1083
CAMPUS_RADIUS_METERS=500

# Face Recognition Settings
FACE_RECOGNITION_TOLERANCE=0.6
FACE_CONFIDENCE_THRESHOLD=0.7
```

#### Step 5: Initialize Database
```bash
# Run the SQL script to create tables
psql -h your_supabase_host -U your_username -d your_database -f app/sql/create_python_attendance_tables.sql
```

#### Step 6: Start Python Backend
```bash
python app.py
```

The Flask server will start on `http://localhost:5000`

### 2. Frontend Integration

#### Step 1: Update Environment Variables
Add the Python API URL to your Next.js environment:

```env
# .env.local
PYTHON_API_URL=http://localhost:5000
```

#### Step 2: Test API Connection
Visit `/test-attendance` to verify the Python API is working.

## 🔧 Configuration

### Campus Coordinates
Update the campus coordinates in `backend/app.py`:

```python
CAMPUS_CENTER = {
    'latitude': 19.8762,  # Sanjivani University latitude
    'longitude': 73.1083, # Sanjivani University longitude
    'radius_meters': 500  # Campus radius in meters
}
```

### Face Recognition Settings
Adjust face recognition parameters in `backend/app.py`:

```python
# In recognize_face function
matches = face_recognition.compare_faces(KNOWN_FACE_ENCODINGS, face_encoding, tolerance=0.6)
```

## 📱 Usage Flow

### For Students

1. **First-Time Setup**
   - Login to student dashboard
   - System detects first-time user
   - Camera opens for face registration
   - Face data stored in Supabase

2. **Daily Attendance**
   - Navigate to `/student-dashboard/attendance`
   - Select subject from dropdown
   - Select time slot
   - Select date (today or past date)
   - Click "Mark Attendance"
   - Camera opens for face verification
   - System verifies geo-location
   - Attendance marked if all checks pass

### For Faculty

1. **First-Time Setup**
   - Login to faculty dashboard
   - System detects first-time user
   - Camera opens for face registration
   - Face data stored in Supabase

2. **Daily Attendance**
   - Navigate to `/dashboard/attendance`
   - Select date
   - Click "Mark Attendance"
   - Camera opens for face verification
   - System verifies geo-location
   - Attendance marked if all checks pass

## 🔒 Security Features

### Anti-Fake Measures

1. **Face Recognition**
   - Real-time face detection using OpenCV
   - Face encoding comparison with stored data
   - Confidence scoring (minimum 70% required)

2. **Geo-Location Verification**
   - GPS coordinates verification
   - Campus boundary enforcement (500m radius)
   - Distance calculation using Haversine formula

3. **Device Tracking**
   - Browser fingerprinting
   - IP address logging
   - Session management

### Verification Process

1. **Face Detection**: User looks at camera
2. **Face Recognition**: System compares with stored face data
3. **Location Check**: GPS coordinates verified against campus boundaries
4. **Attendance Recording**: All verifications must pass

## 🐛 Troubleshooting

### Common Issues

#### 1. Camera Not Working
```bash
# Check browser permissions
# Ensure HTTPS connection
# Try refreshing the page
```

#### 2. Location Not Working
```bash
# Allow location access in browser
# Check GPS settings
# Verify campus coordinates
```

#### 3. Face Detection Failing
```bash
# Ensure good lighting
# Look directly at camera
# Remove glasses if needed
# Check face recognition tolerance settings
```

#### 4. Python API Not Responding
```bash
# Check if Flask server is running
# Verify port 5000 is available
# Check environment variables
# Review Python logs
```

### Debug Information

#### Check Python API Health
```bash
curl http://localhost:5000/api/health
```

#### Test Face Registration
```bash
curl -X POST http://localhost:5000/api/register-face \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","user_type":"student","image_data":"data:image/jpeg;base64,..."}'
```

## 📊 Database Schema

### Tables Overview

1. **student_faces**: Stores student face encodings
2. **faculty_faces**: Stores faculty face encodings
3. **student_attendance**: Student attendance records
4. **faculty_attendance**: Faculty attendance records
5. **subjects**: Available subjects for students
6. **time_slots**: Available time slots

### Key Fields

- `face_encoding`: Base64 encoded face data
- `face_confidence`: Recognition confidence score (0-1)
- `geo_verified`: Boolean for location verification
- `latitude/longitude`: GPS coordinates

## 🔮 Future Enhancements

### Planned Features

1. **Advanced Face Recognition**
   - Integration with AWS Rekognition
   - Liveness detection improvements
   - Anti-spoofing measures

2. **Mobile App**
   - Native mobile attendance app
   - Offline support
   - Push notifications

3. **Analytics Dashboard**
   - Real-time attendance analytics
   - Attendance trends
   - Performance metrics

4. **Biometric Integration**
   - Fingerprint scanning
   - Iris recognition
   - Multi-factor authentication

## 📞 Support

For technical support or questions:

1. Check the troubleshooting section above
2. Review Python logs in backend directory
3. Verify database connectivity
4. Test API endpoints individually

## 📄 License

This attendance system is part of the EduVision project and follows the same licensing terms.

---

**Note**: This system implements industry-standard security measures to prevent attendance fraud while maintaining user privacy and data protection. 