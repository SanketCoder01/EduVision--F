#!/usr/bin/env python3
"""
Test script for EduVision Face Capture System
Tests the improved face detection and capture functionality
"""

import cv2
import numpy as np
import requests
import json
import time
import sys

def test_opencv_installation():
    """Test if OpenCV is properly installed"""
    print("🔍 Testing OpenCV installation...")
    try:
        print(f"OpenCV version: {cv2.__version__}")
        print(f"OpenCV build information: {cv2.getBuildInformation()}")
        return True
    except Exception as e:
        print(f"❌ OpenCV installation error: {e}")
        return False

def test_face_cascade():
    """Test if face cascade classifier is available"""
    print("\n🎭 Testing face cascade classifier...")
    try:
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        print(f"Cascade path: {cascade_path}")
        
        face_cascade = cv2.CascadeClassifier(cascade_path)
        if face_cascade.empty():
            print("❌ Face cascade classifier is empty")
            return False
        
        print("✅ Face cascade classifier loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Face cascade error: {e}")
        return False

def test_camera_access():
    """Test if camera can be accessed"""
    print("\n📹 Testing camera access...")
    try:
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            print("❌ Could not open camera")
            return False
        
        # Test reading a frame
        ret, frame = camera.read()
        if not ret:
            print("❌ Could not read frame from camera")
            camera.release()
            return False
        
        print(f"✅ Camera accessed successfully")
        print(f"   Frame size: {frame.shape}")
        print(f"   Frame type: {frame.dtype}")
        
        camera.release()
        return True
    except Exception as e:
        print(f"❌ Camera access error: {e}")
        return False

def test_face_detection():
    """Test face detection on a test image or camera frame"""
    print("\n👤 Testing face detection...")
    try:
        # Try to get a frame from camera
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            print("❌ Could not open camera for face detection test")
            return False
        
        # Set camera properties
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, 10)
        
        # Read a frame
        ret, frame = camera.read()
        if not ret:
            print("❌ Could not read frame for face detection test")
            camera.release()
            return False
        
        # Load face cascade
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        print(f"✅ Face detection test completed")
        print(f"   Detected faces: {len(faces)}")
        
        if len(faces) > 0:
            print("   🎯 Face detected! Face detection is working")
        else:
            print("   ⚠️  No face detected (this is normal if no one is in front of camera)")
        
        camera.release()
        return True
    except Exception as e:
        print(f"❌ Face detection test error: {e}")
        return False

def test_flask_api():
    """Test Flask API endpoints"""
    print("\n🌐 Testing Flask API endpoints...")
    
    base_url = "http://localhost:5000"
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Flask server is running")
        else:
            print(f"❌ Flask server returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Flask server is not running: {e}")
        print("   Please start the Flask app with: python app.py")
        return False
    
    # Test 2: Test status endpoint
    try:
        response = requests.get(f"{base_url}/status", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Status endpoint working")
            print(f"   Response: {data}")
        else:
            print(f"❌ Status endpoint returned status {response.status_code}")
    except Exception as e:
        print(f"❌ Status endpoint error: {e}")
    
    # Test 3: Test start capture endpoint
    try:
        response = requests.post(f"{base_url}/start_capture", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Start capture endpoint working")
            print(f"   Response: {data}")
            
            # Stop capture immediately
            requests.post(f"{base_url}/stop_capture", timeout=5)
        else:
            print(f"❌ Start capture endpoint returned status {response.status_code}")
    except Exception as e:
        print(f"❌ Start capture endpoint error: {e}")
    
    return True

def test_manual_capture():
    """Test manual capture functionality"""
    print("\n📸 Testing manual capture...")
    
    base_url = "http://localhost:5000"
    
    try:
        # Start capture
        response = requests.post(f"{base_url}/start_capture", timeout=5)
        if response.status_code != 200:
            print("❌ Could not start capture for manual capture test")
            return False
        
        # Wait a moment for camera to initialize
        time.sleep(2)
        
        # Test manual capture
        response = requests.post(f"{base_url}/manual_capture", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Manual capture endpoint working")
            print(f"   Response: {data}")
        else:
            print(f"❌ Manual capture endpoint returned status {response.status_code}")
        
        # Stop capture
        requests.post(f"{base_url}/stop_capture", timeout=5)
        
        return True
    except Exception as e:
        print(f"❌ Manual capture test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 EduVision Face Capture System Test")
    print("=" * 50)
    
    tests = [
        ("OpenCV Installation", test_opencv_installation),
        ("Face Cascade Classifier", test_face_cascade),
        ("Camera Access", test_camera_access),
        ("Face Detection", test_face_detection),
        ("Flask API", test_flask_api),
        ("Manual Capture", test_manual_capture)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
        
        print("-" * 30)
    
    # Summary
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Face capture system is working correctly.")
        print("\n🚀 Next steps:")
        print("1. Start the Flask app: python app.py")
        print("2. Open http://localhost:5000 in your browser")
        print("3. Test face capture with the improved interface")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("1. Ensure OpenCV is installed: pip install opencv-python")
        print("2. Check camera permissions")
        print("3. Verify Flask app is running")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
