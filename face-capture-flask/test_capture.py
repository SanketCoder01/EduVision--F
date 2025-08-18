#!/usr/bin/env python3
"""
Test script for the face capture functionality
"""

import cv2
import numpy as np
import requests
import json
import time
import base64

def test_face_detection():
    """Test face detection with a sample image"""
    print("Testing face detection...")
    
    # Load the face cascade
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Create a test image (you can replace this with a real image path)
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Add a simple face-like shape for testing
    cv2.circle(test_image, (320, 240), 100, (255, 255, 255), -1)
    cv2.circle(test_image, (300, 220), 10, (0, 0, 0), -1)
    cv2.circle(test_image, (340, 220), 10, (0, 0, 0), -1)
    cv2.ellipse(test_image, (320, 280), (30, 20), 0, 0, 180, (0, 0, 0), 3)
    
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(test_image, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    print(f"Detected {len(faces)} faces")
    
    # Draw rectangles around detected faces
    for (x, y, w, h) in faces:
        cv2.rectangle(test_image, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    # Save the result
    cv2.imwrite('test_face_detection.jpg', test_image)
    print("Test image saved as 'test_face_detection.jpg'")
    
    return len(faces) > 0

def test_api_endpoints():
    """Test the Flask API endpoints"""
    base_url = "http://localhost:5000"
    
    print("\nTesting API endpoints...")
    
    # Test status endpoint
    try:
        response = requests.get(f"{base_url}/status")
        if response.status_code == 200:
            print("✅ Status endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Status endpoint failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask app. Make sure it's running on port 5000")
        return False
    
    # Test start capture endpoint
    try:
        response = requests.post(f"{base_url}/start_capture")
        if response.status_code == 200:
            print("✅ Start capture endpoint working")
        else:
            print(f"❌ Start capture endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Start capture error: {e}")
    
    # Test stop capture endpoint
    try:
        response = requests.post(f"{base_url}/stop_capture")
        if response.status_code == 200:
            print("✅ Stop capture endpoint working")
        else:
            print(f"❌ Stop capture endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Stop capture error: {e}")
    
    return True

def test_camera_access():
    """Test if camera can be accessed"""
    print("\nTesting camera access...")
    
    try:
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("✅ Camera access successful")
            ret, frame = cap.read()
            if ret:
                print("✅ Camera can capture frames")
                cv2.imwrite('test_camera_frame.jpg', frame)
                print("   Test frame saved as 'test_camera_frame.jpg'")
            else:
                print("❌ Camera cannot capture frames")
            cap.release()
        else:
            print("❌ Cannot access camera")
            return False
    except Exception as e:
        print(f"❌ Camera test error: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🧪 Face Capture Test Suite")
    print("=" * 40)
    
    # Test 1: Face detection
    face_detection_ok = test_face_detection()
    
    # Test 2: Camera access
    camera_ok = test_camera_access()
    
    # Test 3: API endpoints
    api_ok = test_api_endpoints()
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    print(f"   Face Detection: {'✅ PASS' if face_detection_ok else '❌ FAIL'}")
    print(f"   Camera Access: {'✅ PASS' if camera_ok else '❌ FAIL'}")
    print(f"   API Endpoints: {'✅ PASS' if api_ok else '❌ FAIL'}")
    
    if face_detection_ok and camera_ok and api_ok:
        print("\n🎉 All tests passed! The face capture system is ready.")
    else:
        print("\n⚠️  Some tests failed. Please check the issues above.")
    
    print("\n💡 Next steps:")
    print("   1. Start the Flask app: python app.py")
    print("   2. Open http://localhost:5000 in your browser")
    print("   3. Test the face capture functionality")

if __name__ == "__main__":
    main()
