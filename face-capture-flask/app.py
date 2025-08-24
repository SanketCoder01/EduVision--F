from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import os
import base64
import json
import requests
from datetime import datetime
import threading
import time

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Configuration
UPLOAD_FOLDER = 'static/captures'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
FACE_CASCADE_PATH = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables for face detection
face_cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)
camera = None
is_capturing = False
captured_image = None
face_detected = False
face_detection_count = 0
last_face_detection_time = 0
camera_error = None
auto_capture_enabled = True

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_faces(frame):
    """Detect faces in the frame and return face coordinates"""
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        return faces
    except Exception as e:
        print(f"Face detection error: {e}")
        return []

def draw_face_circle(frame, faces):
    """Draw circular overlay around detected faces"""
    try:
        for (x, y, w, h) in faces:
            # Calculate center and radius for circle
            center_x = x + w // 2
            center_y = y + h // 2
            radius = max(w, h) // 2 + 20  # Add some padding
            
            # Draw circle
            cv2.circle(frame, (center_x, center_y), radius, (0, 255, 0), 3)
            
            # Draw face detection indicator
            cv2.putText(frame, 'Face Detected', (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        return frame
    except Exception as e:
        print(f"Error drawing face circle: {e}")
        return frame

def initialize_camera():
    """Initialize camera with multiple fallback options"""
    global camera_error
    
    # Try different camera indices
    for camera_index in [0, 1, -1]:
        try:
            print(f"Trying camera index: {camera_index}")
            camera = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)  # Use DirectShow on Windows
            
            if camera.isOpened():
                # Test reading a frame
                ret, frame = camera.read()
                if ret and frame is not None:
                    print(f"Camera {camera_index} initialized successfully")
                    
                    # Set camera properties for better performance
                    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                    camera.set(cv2.CAP_PROP_FPS, 10)
                    camera.set(cv2.CAP_PROP_AUTOFOCUS, 1)  # Enable autofocus
                    camera.set(cv2.CAP_PROP_BRIGHTNESS, 128)  # Set brightness
                    
                    camera_error = None
                    return camera
                else:
                    camera.release()
            else:
                if camera:
                    camera.release()
        except Exception as e:
            print(f"Error initializing camera {camera_index}: {e}")
            if camera:
                camera.release()
    
    # If all cameras fail, try without DirectShow
    try:
        print("Trying camera without DirectShow...")
        camera = cv2.VideoCapture(0)
        if camera.isOpened():
            ret, frame = camera.read()
            if ret and frame is not None:
                print("Camera initialized without DirectShow")
                camera_error = None
                return camera
            else:
                camera.release()
    except Exception as e:
        print(f"Error initializing camera without DirectShow: {e}")
    
    camera_error = "Could not initialize any camera. Please check camera permissions and connections."
    return None

def auto_capture_frame():
    """Automatically capture frame when face is detected"""
    global captured_image, face_detected, is_capturing, face_detection_count, last_face_detection_time, camera
    
    while is_capturing:
        if camera is not None and camera.isOpened():
            try:
                ret, frame = camera.read()
                if ret and frame is not None:
                    faces = detect_faces(frame)
                    
                    if len(faces) > 0:
                        # Face detected
                        if not face_detected:
                            face_detected = True
                            face_detection_count = 0
                            last_face_detection_time = time.time()
                        
                        face_detection_count += 1
                        
                        # Draw face circle
                        frame = draw_face_circle(frame, faces)
                        
                        # Auto-capture after 2 seconds of continuous face detection (20 frames at 10fps)
                        if auto_capture_enabled and face_detection_count > 20 and not captured_image:
                            captured_image = frame.copy()
                            is_capturing = False
                            print("Auto-capture triggered!")
                            break
                    else:
                        # No face detected
                        if face_detected:
                            face_detected = False
                            face_detection_count = 0
                            last_face_detection_time = 0
                    
                    time.sleep(0.1)  # Control frame rate
                else:
                    print("Failed to read frame from camera")
                    time.sleep(0.1)
            except Exception as e:
                print(f"Error in auto capture: {e}")
                time.sleep(0.1)
        else:
            print("Camera not available")
            time.sleep(0.1)
    
    if camera is not None:
        camera.release()
    cv2.destroyAllWindows()

def manual_capture_frame():
    """Manually capture the current frame"""
    global captured_image, is_capturing, camera
    
    if camera is not None and camera.isOpened() and is_capturing:
        try:
            ret, frame = camera.read()
            if ret and frame is not None:
                captured_image = frame.copy()
                is_capturing = False
                print("Manual capture triggered!")
                return True
            else:
                print("Failed to read frame for manual capture")
                return False
        except Exception as e:
            print(f"Error in manual capture: {e}")
            return False
    return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start_capture', methods=['POST'])
def start_capture():
    global camera, is_capturing, captured_image, face_detected, face_detection_count, last_face_detection_time, camera_error
    
    try:
        # Initialize camera
        camera = initialize_camera()
        if camera is None:
            return jsonify({'error': camera_error or 'Could not initialize camera'}), 500
        
        # Reset variables
        captured_image = None
        face_detected = False
        face_detection_count = 0
        last_face_detection_time = 0
        is_capturing = True
        
        # Start capture thread
        capture_thread = threading.Thread(target=auto_capture_frame)
        capture_thread.daemon = True
        capture_thread.start()
        
        return jsonify({'message': 'Capture started successfully'})
    
    except Exception as e:
        camera_error = str(e)
        return jsonify({'error': f'Failed to start capture: {str(e)}'}), 500

@app.route('/manual_capture', methods=['POST'])
def manual_capture():
    """Manually capture the current frame"""
    try:
        if manual_capture_frame():
            return jsonify({'message': 'Manual capture successful'})
        else:
            return jsonify({'error': 'Failed to capture image. Please ensure camera is active.'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stop_capture', methods=['POST'])
def stop_capture():
    global is_capturing, camera
    
    try:
        is_capturing = False
        if camera is not None:
            camera.release()
            camera = None
        
        cv2.destroyAllWindows()
        return jsonify({'message': 'Capture stopped successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_captured_image', methods=['GET'])
def get_captured_image():
    global captured_image
    
    if captured_image is not None:
        try:
            # Save image
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'captured_face_{timestamp}.jpg'
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            cv2.imwrite(filepath, captured_image)
            
            # Convert to base64
            _, buffer = cv2.imencode('.jpg', captured_image)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return jsonify({
                'success': True,
                'image': img_base64,
                'filename': filename,
                'filepath': filepath
            })
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'No image captured'}), 404

@app.route('/upload_to_webapp', methods=['POST'])
def upload_to_webapp():
    try:
        data = request.get_json()
        image_data = data.get('image')
        user_type = data.get('user_type', 'student')
        user_email = data.get('user_email')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        
        # Create form data for web app upload
        files = {'face_image': ('face_capture.jpg', image_bytes, 'image/jpeg')}
        
        # Upload to web application
        webapp_url = f'http://localhost:3000/api/{user_type}/complete-registration'
        
        # Note: This would need proper authentication in production
        response = requests.post(webapp_url, files=files)
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'message': 'Image uploaded successfully to web application'
            })
        else:
            return jsonify({
                'error': f'Failed to upload to web app: {response.text}'
            }), response.status_code
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/captures/<filename>')
def get_capture(filename):
    """Serve captured images"""
    return send_file(os.path.join(UPLOAD_FOLDER, filename))

@app.route('/status', methods=['GET'])
def get_status():
    """Get current capture status"""
    return jsonify({
        'is_capturing': is_capturing,
        'face_detected': face_detected,
        'face_detection_count': face_detection_count,
        'has_captured_image': captured_image is not None,
        'camera_active': camera is not None and camera.isOpened(),
        'camera_error': camera_error
    })

@app.route('/validate_face_quality', methods=['POST'])
def validate_face_quality():
    """Validate if the captured face meets quality requirements"""
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Detect faces
        faces = detect_faces(frame)
        
        quality_score = 0
        issues = []
        
        if len(faces) == 0:
            issues.append("No face detected")
        elif len(faces) > 1:
            issues.append("Multiple faces detected - please ensure only one person is visible")
            quality_score = 30
        else:
            # Single face detected - check quality
            x, y, w, h = faces[0]
            
            # Check face size (should be at least 100x100 pixels)
            if w < 100 or h < 100:
                issues.append("Face too small - please move closer to camera")
                quality_score = 40
            else:
                quality_score = 70
            
            # Check if face is centered
            frame_center_x = frame.shape[1] // 2
            face_center_x = x + w // 2
            if abs(face_center_x - frame_center_x) > frame.shape[1] * 0.3:
                issues.append("Face not centered - please center your face")
                quality_score -= 10
            else:
                quality_score += 20
            
            # Check brightness (basic check)
            face_roi = frame[y:y+h, x:x+w]
            avg_brightness = np.mean(cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY))
            if avg_brightness < 80:
                issues.append("Image too dark - please improve lighting")
                quality_score -= 15
            elif avg_brightness > 200:
                issues.append("Image too bright - please reduce lighting")
                quality_score -= 10
            else:
                quality_score += 10
        
        # Determine if quality is acceptable
        is_acceptable = quality_score >= 70 and len(faces) == 1
        
        return jsonify({
            'success': True,
            'is_acceptable': is_acceptable,
            'quality_score': quality_score,
            'face_count': len(faces),
            'issues': issues,
            'message': 'Face quality validated successfully' if is_acceptable else 'Face quality needs improvement'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auto_detect_and_capture', methods=['POST'])
def auto_detect_and_capture():
    """Auto-detect face from webcam stream and capture when quality is good"""
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Detect faces
        faces = detect_faces(frame)
        
        # Check if we should auto-capture
        should_capture = False
        feedback = []
        
        if len(faces) == 0:
            feedback.append("Please position your face in front of the camera")
        elif len(faces) > 1:
            feedback.append("Multiple faces detected - please ensure only one person is visible")
        else:
            # Single face detected
            x, y, w, h = faces[0]
            
            # Check quality criteria
            face_area = w * h
            frame_area = frame.shape[0] * frame.shape[1]
            face_ratio = face_area / frame_area
            
            # Quality checks
            if face_ratio < 0.05:
                feedback.append("Move closer to the camera")
            elif face_ratio > 0.4:
                feedback.append("Move back from the camera")
            elif w < 100 or h < 100:
                feedback.append("Face too small - move closer")
            else:
                # Face is good quality - auto capture
                should_capture = True
                feedback.append("Perfect! Capturing image...")
        
        # If should capture, save the image and send to Next.js
        if should_capture:
            # Save image locally
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"face_capture_{timestamp}.jpg"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            cv2.imwrite(filepath, frame)
            
            # Convert to base64 for sending to Next.js
            _, buffer = cv2.imencode('.jpg', frame)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            img_data_url = f"data:image/jpeg;base64,{img_base64}"
            
            # Send to Next.js API
            try:
                response = requests.post('http://localhost:3000/api/face-capture', 
                    json={
                        'email': data.get('email', ''),
                        'imageData': img_data_url
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    return jsonify({
                        'success': True,
                        'captured': True,
                        'message': 'Face captured and saved successfully!',
                        'redirect_to': '/auth/pending-approval',
                        'image_url': img_data_url
                    })
                else:
                    return jsonify({
                        'success': False,
                        'captured': True,
                        'message': 'Image captured but failed to save to database',
                        'image_url': img_data_url
                    })
            except Exception as e:
                print(f"Error sending to Next.js: {e}")
                return jsonify({
                    'success': False,
                    'captured': True,
                    'message': 'Image captured but failed to save',
                    'image_url': img_data_url
                })
        
        return jsonify({
            'success': True,
            'captured': False,
            'feedback': feedback,
            'face_count': len(faces)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting EduVision Face Capture System...")
    print("📹 Testing camera access...")
    
    # Test camera on startup
    test_cam = initialize_camera()
    if test_cam:
        print("✅ Camera initialized successfully")
        test_cam.release()
    else:
        print(f"⚠️  Camera initialization warning: {camera_error}")
        print("   The app will still start, but camera functionality may not work")
    
    print("🌐 Starting Flask server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
