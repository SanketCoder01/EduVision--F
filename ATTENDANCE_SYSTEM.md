# Attendance System Documentation

## Overview

The EduVision Attendance System is a comprehensive solution that implements smart attendance tracking with face recognition, geo-fencing, and liveness detection to ensure real, in-person attendance that students cannot fake.

## 🎯 Key Features

### 1. Face Recognition + Geo-Fencing Attendance
- **Face Recognition**: Real-time face detection and verification using camera
- **Geo-Fencing**: GPS location verification within campus boundaries
- **Anti-Fake Logic**: Prevents home-based faking and proxy attendance

### 2. AI Proctored Camera Attendance
- **Liveness Detection**: Detects if the person is live (not a photo/video)
- **Eye Movement Analysis**: Monitors blink patterns and eye movements
- **Real-time Processing**: 3-second video analysis for verification

## 🏗️ System Architecture

### Database Schema

#### Core Tables
- `attendance_sessions`: Faculty-created attendance sessions
- `student_attendance`: Student attendance records with verification data
- `faculty_attendance`: Faculty attendance records
- `student_faces`: Face recognition data for students
- `faculty_faces`: Face recognition data for faculty
- `attendance_reports`: Analytics and reporting data
- `attendance_notifications`: System notifications

#### Key Features
- UUID-based primary keys
- Comprehensive verification tracking
- Device and location information storage
- Confidence scoring for all verifications

### API Endpoints

#### Faculty Endpoints
- `POST /api/attendance/sessions` - Create attendance session
- `GET /api/attendance/sessions/faculty/:id` - Get faculty sessions
- `GET /api/attendance/sessions/:id/records` - Get session records
- `PUT /api/attendance/sessions/:id/end` - End attendance session

#### Student Endpoints
- `GET /api/attendance/sessions/student/:id` - Get student sessions
- `POST /api/attendance/mark` - Mark student attendance
- `POST /api/attendance/verify-face` - Face verification
- `POST /api/attendance/verify-location` - Location verification

## 🔧 Implementation Details

### Face Recognition System

#### Features
- **Real-time Detection**: Uses MediaDevices API for camera access
- **Skin Tone Analysis**: Basic face detection using skin tone analysis
- **Feature Extraction**: Generates face encodings for comparison
- **Confidence Scoring**: Provides confidence levels for face matches

#### Code Location
```typescript
// lib/face-recognition.ts
export async function detectFace(videoElement: HTMLVideoElement): Promise<FaceDetectionResult>
export async function generateFaceEncoding(videoElement: HTMLVideoElement): Promise<string>
export async function matchFace(currentFaceData: string, storedFaceData: string): Promise<FaceMatchResult>
```

### Liveness Detection

#### Features
- **Eye Movement Tracking**: Monitors eye region changes
- **Blink Detection**: Counts blink patterns
- **Movement Analysis**: Detects natural eye movements
- **Spoofing Prevention**: Prevents photo/video attacks

#### Code Location
```typescript
// lib/face-recognition.ts
export async function detectLiveness(videoElement: HTMLVideoElement, duration: number = 3000): Promise<LivenessDetectionResult>
```

### Geo-Fencing System

#### Features
- **GPS Integration**: Uses browser geolocation API
- **Haversine Formula**: Accurate distance calculation
- **Configurable Radius**: Faculty can set geo-fence radius
- **Real-time Verification**: Instant location validation

#### Code Location
```typescript
// lib/face-recognition.ts
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }>

// app/actions/attendance-actions.ts
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number
export async function verifyGeoFencing(session_id: string, user_latitude: number, user_longitude: number)
```

## 🎨 User Interface

### Faculty Dashboard (`/dashboard/attendance`)

#### Features
- **Session Management**: Create and manage attendance sessions
- **Real-time Analytics**: Live attendance statistics
- **Verification Settings**: Configure face, geo, and liveness requirements
- **Attendance Records**: Detailed student and faculty records
- **Export Functionality**: Download attendance data

#### Components
- `CreateAttendanceSession`: Modal for creating new sessions
- `AttendanceAnalytics`: Charts and statistics
- `AttendanceRecords`: Detailed attendance table

### Student Dashboard (`/student-dashboard/attendance`)

#### Features
- **Active Sessions**: View available attendance sessions
- **Face Attendance Modal**: Complete attendance process
- **Step-by-step Guidance**: Clear instructions for attendance
- **Real-time Feedback**: Live verification status

#### Components
- `FaceAttendanceModal`: Complete attendance workflow
- Session cards with verification requirements
- Progress indicators and status feedback

## 🔒 Security Features

### Anti-Fake Measures

1. **Face Recognition**
   - Real-time face detection
   - Confidence scoring
   - Face encoding comparison

2. **Liveness Detection**
   - Eye movement analysis
   - Blink pattern detection
   - Video spoofing prevention

3. **Geo-Fencing**
   - GPS location verification
   - Campus boundary enforcement
   - Distance calculation

4. **Device Tracking**
   - Device information logging
   - IP address tracking
   - Session management

### Verification Process

1. **Face Detection**: Student looks at camera
2. **Liveness Check**: Follow prompts for eye movements
3. **Location Verification**: GPS confirms campus location
4. **Attendance Recording**: All verifications pass

## 📊 Analytics and Reporting

### Attendance Analytics
- **Attendance Rate**: Percentage of present students
- **Verification Statistics**: Face, geo, and liveness success rates
- **Session Overview**: Total, present, absent, and late counts
- **Real-time Updates**: Live dashboard updates

### Export Features
- **JSON Export**: Complete attendance data
- **Filtering**: By status, date, or verification type
- **Search**: By student name or PRN
- **Detailed Records**: All verification data included

## 🚀 Setup Instructions

### 1. Database Setup
```bash
# Run the attendance tables creation script
POST /api/attendance/init
```

### 2. Navigation Integration
The attendance module is already integrated into both faculty and student navigation:
- Faculty: `/dashboard/attendance`
- Student: `/student-dashboard/attendance`

### 3. Testing
Visit `/test-attendance` to test the system functionality.

## 🔧 Configuration

### Session Settings
Faculty can configure:
- **Face Recognition**: Enable/disable face verification
- **Geo-Fencing**: Enable/disable location verification
- **Liveness Detection**: Enable/disable liveness checks
- **Geo-Fence Radius**: Set campus boundary radius (default: 100m)

### Verification Thresholds
- **Face Confidence**: Minimum 70% for face match
- **Liveness Score**: Minimum 30% for liveness detection
- **Location Accuracy**: High accuracy GPS required

## 📱 Browser Requirements

### Required Permissions
- **Camera Access**: For face recognition
- **Location Access**: For geo-fencing
- **HTTPS**: Required for camera and location APIs

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 🐛 Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Check browser permissions
   - Ensure HTTPS connection
   - Try refreshing the page

2. **Location Not Working**
   - Allow location access
   - Check GPS settings
   - Verify campus boundaries

3. **Face Detection Failing**
   - Ensure good lighting
   - Look directly at camera
   - Remove glasses if needed

### Debug Information
- Check browser console for errors
- Verify database connectivity
- Test with `/test-attendance` page

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Face Recognition**: Integration with AWS Rekognition
2. **Mobile App**: Native mobile attendance app
3. **Offline Support**: Offline attendance marking
4. **Biometric Integration**: Fingerprint and iris scanning
5. **AI Analytics**: Predictive attendance analysis

### Performance Optimizations
1. **Caching**: Face data caching
2. **Compression**: Video compression for faster processing
3. **CDN**: Static asset optimization
4. **Database Indexing**: Query optimization

## 📄 License

This attendance system is part of the EduVision project and follows the same licensing terms.

## 🤝 Contributing

To contribute to the attendance system:
1. Follow the existing code structure
2. Add comprehensive tests
3. Update documentation
4. Ensure security best practices

---

**Note**: This attendance system implements industry-standard security measures to prevent attendance fraud while maintaining user privacy and data protection. 