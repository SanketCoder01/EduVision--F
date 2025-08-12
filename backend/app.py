from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import cv2
import numpy as np
import face_recognition
import os
import json
import requests
from datetime import datetime, timedelta
import base64
from supabase import create_client, Client
import geopy.distance
from dotenv import load_dotenv
from werkzeug.security import check_password_hash

load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Sanjivani College of Engineering, Kopargaon Coordinates
CAMPUS_CENTER = {
    'latitude': 19.90194,  # Sanjivani College latitude
    'longitude': 74.49428, # Sanjivani College longitude
    'radius_meters': 500   # Campus radius in meters
}

# Face recognition settings
KNOWN_FACE_ENCODINGS = []
KNOWN_FACE_NAMES = []

def load_known_faces():
    """Load known faces from Supabase"""
    try:
        response = supabase.table('student_faces').select('*').execute()
        for face_data in response.data:
            # Decode base64 face encoding
            face_encoding = np.frombuffer(
                base64.b64decode(face_data['face_encoding']), 
                dtype=np.float64
            )
            KNOWN_FACE_ENCODINGS.append(face_encoding)
            KNOWN_FACE_NAMES.append(face_data['student_id'])
        
        # Load faculty faces
        faculty_response = supabase.table('faculty_faces').select('*').execute()
        for face_data in faculty_response.data:
            face_encoding = np.frombuffer(
                base64.b64decode(face_data['face_encoding']), 
                dtype=np.float64
            )
            KNOWN_FACE_ENCODINGS.append(face_encoding)
            KNOWN_FACE_NAMES.append(face_data['faculty_id'])
            
    except Exception as e:
        print(f"Error loading known faces: {e}")

def verify_geo_location(latitude, longitude):
    """Verify if user is within campus boundaries"""
    try:
        # Calculate distance from campus center
        user_coords = (latitude, longitude)
        campus_coords = (CAMPUS_CENTER['latitude'], CAMPUS_CENTER['longitude'])
        
        distance = geopy.distance.geodesic(user_coords, campus_coords).meters
        
        return {
            'is_within_campus': distance <= CAMPUS_CENTER['radius_meters'],
            'distance': distance,
            'campus_radius': CAMPUS_CENTER['radius_meters']
        }
    except Exception as e:
        print(f"Error verifying geo-location: {e}")
        return {'is_within_campus': False, 'distance': 0, 'campus_radius': CAMPUS_CENTER['radius_meters']}

def recognize_face(image_data):
    """Recognize face from image data"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert BGR to RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Find faces in the image
        face_locations = face_recognition.face_locations(rgb_image)
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        if not face_encodings:
            return {'success': False, 'message': 'No face detected in image'}
        
        # Check each face found
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(KNOWN_FACE_ENCODINGS, face_encoding, tolerance=0.6)
            
            if True in matches:
                first_match_index = matches.index(True)
                user_id = KNOWN_FACE_NAMES[first_match_index]
                
                # Calculate face distance for confidence
                face_distances = face_recognition.face_distance(KNOWN_FACE_ENCODINGS, face_encoding)
                confidence = 1 - face_distances[first_match_index]
                
                return {
                    'success': True,
                    'user_id': user_id,
                    'confidence': float(confidence),
                    'message': 'Face recognized successfully'
                }
        
        return {'success': False, 'message': 'Face not recognized'}
        
    except Exception as e:
        print(f"Error recognizing face: {e}")
        return {'success': False, 'message': f'Error processing image: {str(e)}'}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Attendance API is running'})

@app.route('/detect_face', methods=['POST'])
def detect_face():
    """Detect if a face is present in the image"""
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'face_detected': False, 'message': 'No image provided'})
        
        # Process image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        face_locations = face_recognition.face_locations(rgb_image)
        
        return jsonify({
            'face_detected': len(face_locations) > 0,
            'face_count': len(face_locations)
        })
        
    except Exception as e:
        print(f"Error detecting face: {e}")
        return jsonify({'face_detected': False, 'message': f'Error: {str(e)}'})

@app.route('/register_face', methods=['POST'])
def register_face_endpoint():
    """Register a new face for a user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user_type = data.get('user_type')  # 'student' or 'faculty'
        image_data = data.get('image')
        
        if not all([user_id, user_type, image_data]):
            return jsonify({'success': False, 'message': 'Missing required fields'})
        
        # Process image and get face encoding
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        face_encodings = face_recognition.face_encodings(rgb_image)
        
        if not face_encodings:
            return jsonify({'success': False, 'message': 'No face detected in image'})
        
        # Use the first face found
        face_encoding = face_encodings[0]
        
        # Convert to base64 for storage
        encoding_bytes = face_encoding.tobytes()
        encoding_base64 = base64.b64encode(encoding_bytes).decode('utf-8')
        
        # Store in Supabase
        table_name = 'student_faces' if user_type == 'student' else 'faculty_faces'
        id_field = 'student_id' if user_type == 'student' else 'faculty_id'
        
        face_data = {
            id_field: user_id,
            'face_encoding': encoding_base64,
            'is_verified': True
        }
        
        # Check if face already exists
        existing = supabase.table(table_name).select('*').eq(id_field, user_id).execute()
        
        if existing.data:
            # Update existing
            supabase.table(table_name).update(face_data).eq(id_field, user_id).execute()
        else:
            # Insert new
            supabase.table(table_name).insert(face_data).execute()
        
        # Reload known faces
        load_known_faces()
        
        return jsonify({
            'success': True,
            'message': 'Face registered successfully',
            'user_name': user_id
        })
        
    except Exception as e:
        print(f"Error registering face: {e}")
        return jsonify({'success': False, 'message': f'Error registering face: {str(e)}'})

@app.route('/api/register-face', methods=['POST'])
def register_face():
    """Register a new face for a user (legacy endpoint)"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user_type = data.get('user_type')  # 'student' or 'faculty'
        image_data = data.get('image_data')
        
        if not all([user_id, user_type, image_data]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Process image and get face encoding
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        face_encodings = face_recognition.face_encodings(rgb_image)
        
        if not face_encodings:
            return jsonify({'success': False, 'message': 'No face detected in image'}), 400
        
        # Use the first face found
        face_encoding = face_encodings[0]
        
        # Convert to base64 for storage
        encoding_bytes = face_encoding.tobytes()
        encoding_base64 = base64.b64encode(encoding_bytes).decode('utf-8')
        
        # Store in Supabase
        table_name = 'student_faces' if user_type == 'student' else 'faculty_faces'
        id_field = 'student_id' if user_type == 'student' else 'faculty_id'
        
        face_data = {
            id_field: user_id,
            'face_encoding': encoding_base64,
            'is_verified': True
        }
        
        # Check if face already exists
        existing = supabase.table(table_name).select('*').eq(id_field, user_id).execute()
        
        if existing.data:
            # Update existing
            supabase.table(table_name).update(face_data).eq(id_field, user_id).execute()
        else:
            # Insert new
            supabase.table(table_name).insert(face_data).execute()
        
        # Reload known faces
        load_known_faces()
        
        return jsonify({
            'success': True,
            'message': 'Face registered successfully'
        })
        
    except Exception as e:
        print(f"Error registering face: {e}")
        return jsonify({'success': False, 'message': f'Error registering face: {str(e)}'}), 500

@app.route('/api/mark-attendance', methods=['POST'])
def mark_attendance():
    """Mark attendance for a user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user_type = data.get('user_type')
        image_data = data.get('image_data')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        subject_id = data.get('subject_id')  # For students
        time_slot = data.get('time_slot')    # For students
        date = data.get('date')
        
        if not all([user_id, user_type, image_data, date]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Verify geo-location
        if latitude and longitude:
            geo_result = verify_geo_location(latitude, longitude)
            if not geo_result['is_within_campus']:
                return jsonify({
                    'success': False,
                    'message': f'You are outside campus area. Distance: {geo_result["distance"]:.0f}m from campus center.'
                }), 400
        
        # Recognize face
        face_result = recognize_face(image_data)
        if not face_result['success']:
            return jsonify({'success': False, 'message': face_result['message']}), 400
        
        # Verify user ID matches
        if face_result['user_id'] != user_id:
            return jsonify({'success': False, 'message': 'Face does not match registered user'}), 400
        
        # Check if attendance already marked for today
        today = datetime.now().strftime('%Y-%m-%d')
        
        if user_type == 'student':
            # Check existing student attendance
            existing = supabase.table('student_attendance').select('*').eq('student_id', user_id).eq('session_date', today).execute()
        else:
            # Check existing faculty attendance
            existing = supabase.table('faculty_attendance').select('*').eq('faculty_id', user_id).eq('session_date', today).execute()
        
        if existing.data:
            return jsonify({'success': False, 'message': 'Attendance already marked for today'}), 400
        
        # Mark attendance
        attendance_data = {
            'user_id': user_id,
            'user_type': user_type,
            'date': today,
            'time': datetime.now().strftime('%H:%M:%S'),
            'latitude': latitude,
            'longitude': longitude,
            'face_confidence': face_result['confidence'],
            'geo_verified': geo_result['is_within_campus'] if latitude and longitude else True,
            'subject_id': subject_id,
            'time_slot': time_slot
        }
        
        # Store in appropriate table
        if user_type == 'student':
            supabase.table('student_attendance').insert(attendance_data).execute()
        else:
            supabase.table('faculty_attendance').insert(attendance_data).execute()
        
        return jsonify({
            'success': True,
            'message': 'Attendance marked successfully',
            'data': {
                'date': today,
                'time': attendance_data['time'],
                'confidence': face_result['confidence'],
                'geo_verified': attendance_data['geo_verified']
            }
        })
        
    except Exception as e:
        print(f"Error marking attendance: {e}")
        return jsonify({'success': False, 'message': f'Error marking attendance: {str(e)}'}), 500

@app.route('/api/get-attendance', methods=['GET'])
def get_attendance():
    """Get attendance records for a user"""
    try:
        user_id = request.args.get('user_id')
        user_type = request.args.get('user_type')
        date = request.args.get('date')
        
        if not all([user_id, user_type]):
            return jsonify({'success': False, 'message': 'Missing required parameters'}), 400
        
        # Get attendance records
        if user_type == 'student':
            query = supabase.table('student_attendance').select('*').eq('user_id', user_id)
        else:
            query = supabase.table('faculty_attendance').select('*').eq('user_id', user_id)
        
        if date:
            query = query.eq('date', date)
        
        response = query.execute()
        
        return jsonify({
            'success': True,
            'data': response.data
        })
        
    except Exception as e:
        print(f"Error getting attendance: {e}")
        return jsonify({'success': False, 'message': f'Error getting attendance: {str(e)}'}), 500

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get available subjects for students"""
    try:
        # This would typically come from your subjects table
        # For now, returning mock data
        subjects = [
            {'id': 'sub_001', 'name': 'Computer Science', 'code': 'CS101'},
            {'id': 'sub_002', 'name': 'Mathematics', 'code': 'MATH101'},
            {'id': 'sub_003', 'name': 'Physics', 'code': 'PHY101'},
            {'id': 'sub_004', 'name': 'English', 'code': 'ENG101'},
        ]
        
        return jsonify({
            'success': True,
            'data': subjects
        })
        
    except Exception as e:
        print(f"Error getting subjects: {e}")
        return jsonify({'success': False, 'message': f'Error getting subjects: {str(e)}'}), 500

@app.route('/api/time-slots', methods=['GET'])
def get_time_slots():
    """Get available time slots"""
    try:
        time_slots = [
            {'id': 'slot_1', 'name': '8:00 AM - 9:00 AM', 'start': '08:00', 'end': '09:00'},
            {'id': 'slot_2', 'name': '9:00 AM - 10:00 AM', 'start': '09:00', 'end': '10:00'},
            {'id': 'slot_3', 'name': '10:00 AM - 11:00 AM', 'start': '10:00', 'end': '11:00'},
            {'id': 'slot_4', 'name': '11:00 AM - 12:00 PM', 'start': '11:00', 'end': '12:00'},
            {'id': 'slot_5', 'name': '2:00 PM - 3:00 PM', 'start': '14:00', 'end': '15:00'},
            {'id': 'slot_6', 'name': '3:00 PM - 4:00 PM', 'start': '15:00', 'end': '16:00'},
        ]
        
        return jsonify({
            'success': True,
            'data': time_slots
        })
        
    except Exception as e:
        print(f"Error getting time slots: {e}")
        return jsonify({'success': False, 'message': f'Error getting time slots: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Login endpoint for students using PRN and password"""
    try:
        data = request.get_json()
        prn = data.get('prn')
        password = data.get('password')
        if not prn or not password:
            return jsonify({'success': False, 'message': 'PRN and password are required'}), 400

        # Fetch student by PRN from Supabase
        response = supabase.table('students').select('*').eq('prn', prn).execute()
        if not response.data:
            return jsonify({'success': False, 'message': 'Invalid PRN or password'}), 401
        student = response.data[0]
        # Check password (assuming password is stored as a hash in 'password_hash' field)
        if not check_password_hash(student.get('password_hash', ''), password):
            return jsonify({'success': False, 'message': 'Invalid PRN or password'}), 401
        # Success: return student info (omit sensitive fields)
        student_info = {k: v for k, v in student.items() if k not in ['password_hash']}
        return jsonify({'success': True, 'message': 'Login successful', 'student': student_info})
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({'success': False, 'message': f'Error during login: {str(e)}'}), 500

if __name__ == '__main__':
    # Load known faces on startup
    load_known_faces()
    print("Known faces loaded:", len(KNOWN_FACE_NAMES))
    
    app.run(debug=True, host='0.0.0.0', port=5000) 