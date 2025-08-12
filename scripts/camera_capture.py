#!/usr/bin/env python3
"""
Camera Capture Script for EduVision
Handles selfie capture with fun prompts and interactions
"""

import cv2
import time
import os
import sys
import json
from datetime import datetime
import base64

class SelfieCapture:
    def __init__(self):
        self.camera = None
        self.window_name = "EduVision - Selfie Capture"
        self.countdown_duration = 3
        self.cheese_duration = 2
        
    def initialize_camera(self):
        """Initialize the camera"""
        try:
            self.camera = cv2.VideoCapture(0)
            if not self.camera.isOpened():
                raise Exception("Could not open camera")
            
            # Set camera properties for better quality
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.camera.set(cv2.CAP_PROP_FPS, 30)
            
            return True
        except Exception as e:
            print(f"Error initializing camera: {e}")
            return False
    
    def show_message_overlay(self, frame, message, color=(0, 255, 0), size=2):
        """Show message overlay on frame"""
        height, width = frame.shape[:2]
        
        # Calculate text size and position
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(message, font, size, 3)[0]
        text_x = (width - text_size[0]) // 2
        text_y = (height + text_size[1]) // 2
        
        # Add background rectangle for better visibility
        cv2.rectangle(frame, 
                     (text_x - 20, text_y - text_size[1] - 20),
                     (text_x + text_size[0] + 20, text_y + 20),
                     (0, 0, 0), -1)
        
        # Add text
        cv2.putText(frame, message, (text_x, text_y), font, size, color, 3)
        return frame
    
    def draw_face_guide(self, frame):
        """Draw face guide circle"""
        height, width = frame.shape[:2]
        center_x, center_y = width // 2, height // 2
        radius = min(width, height) // 4
        
        # Draw guide circle
        cv2.circle(frame, (center_x, center_y), radius, (255, 255, 255), 3)
        cv2.circle(frame, (center_x, center_y), 5, (255, 255, 255), -1)
        
        # Add corner markers
        corner_size = 20
        corners = [
            (center_x - radius, center_y - radius),  # Top-left
            (center_x + radius, center_y - radius),  # Top-right
            (center_x - radius, center_y + radius),  # Bottom-left
            (center_x + radius, center_y + radius)   # Bottom-right
        ]
        
        for corner in corners:
            cv2.line(frame, corner, (corner[0] + corner_size, corner[1]), (255, 255, 255), 3)
            cv2.line(frame, corner, (corner[0], corner[1] + corner_size), (255, 255, 255), 3)
        
        return frame
    
    def say_cheese_sequence(self):
        """Show 'Say Cheese!' sequence"""
        cheese_messages = [
            "Get Ready! 📸",
            "Say Cheese! 🧀",
            "Smile Big! 😊",
            "Perfect! ✨"
        ]
        
        start_time = time.time()
        message_index = 0
        
        while time.time() - start_time < self.cheese_duration:
            ret, frame = self.camera.read()
            if not ret:
                continue
            
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Calculate which message to show
            elapsed = time.time() - start_time
            message_index = min(int(elapsed * len(cheese_messages) / self.cheese_duration), 
                              len(cheese_messages) - 1)
            
            # Add fun background effect
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, 0), (frame.shape[1], frame.shape[0]), 
                         (0, 255, 255), -1)  # Yellow overlay
            frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
            
            # Show message
            frame = self.show_message_overlay(frame, cheese_messages[message_index], 
                                            (255, 0, 255), 2)  # Magenta text
            
            cv2.imshow(self.window_name, frame)
            cv2.waitKey(30)
    
    def countdown_sequence(self):
        """Show countdown sequence"""
        countdown_messages = [
            "Get Ready... 3",
            "Almost There... 2", 
            "Smile! 😊 1"
        ]
        
        for i, message in enumerate(countdown_messages):
            start_time = time.time()
            
            while time.time() - start_time < 1.0:  # 1 second per count
                ret, frame = self.camera.read()
                if not ret:
                    continue
                
                # Flip frame horizontally for mirror effect
                frame = cv2.flip(frame, 1)
                
                # Add countdown effect
                overlay = frame.copy()
                cv2.rectangle(overlay, (0, 0), (frame.shape[1], frame.shape[0]), 
                             (0, 0, 255), -1)  # Red overlay
                frame = cv2.addWeighted(frame, 0.8, overlay, 0.2, 0)
                
                # Show countdown
                frame = self.show_message_overlay(frame, message, (0, 255, 255), 3)  # Cyan text
                
                cv2.imshow(self.window_name, frame)
                cv2.waitKey(30)
    
    def capture_photo(self):
        """Capture the actual photo"""
        ret, frame = self.camera.read()
        if ret:
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Add flash effect
            flash_overlay = frame.copy()
            cv2.rectangle(flash_overlay, (0, 0), (frame.shape[1], frame.shape[0]), 
                         (255, 255, 255), -1)  # White flash
            
            # Show flash
            flash_frame = cv2.addWeighted(frame, 0.3, flash_overlay, 0.7, 0)
            cv2.imshow(self.window_name, flash_frame)
            cv2.waitKey(200)  # Flash duration
            
            # Show captured frame
            cv2.imshow(self.window_name, frame)
            cv2.waitKey(1000)  # Show result for 1 second
            
            return frame
        return None
    
    def save_photo(self, frame, user_data):
        """Save the captured photo"""
        try:
            # Create photos directory if it doesn't exist
            photos_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'photos')
            os.makedirs(photos_dir, exist_ok=True)
            
            # Generate filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{user_data.get('email', 'user').replace('@', '_').replace('.', '_')}_{timestamp}.jpg"
            filepath = os.path.join(photos_dir, filename)
            
            # Save the image
            cv2.imwrite(filepath, frame)
            
            # Convert to base64 for web usage
            _, buffer = cv2.imencode('.jpg', frame)
            base64_image = base64.b64encode(buffer).decode('utf-8')
            
            return {
                'success': True,
                'filepath': filepath,
                'filename': filename,
                'base64': f"data:image/jpeg;base64,{base64_image}"
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def run_capture_session(self, user_data=None):
        """Run the complete capture session"""
        if not self.initialize_camera():
            return {'success': False, 'error': 'Failed to initialize camera'}
        
        try:
            # Create window
            cv2.namedWindow(self.window_name, cv2.WINDOW_NORMAL)
            cv2.resizeWindow(self.window_name, 800, 600)
            
            # Show initial instructions
            print("📸 EduVision Selfie Capture")
            print("Instructions:")
            print("- Position your face in the center circle")
            print("- Make sure you're well-lit")
            print("- Press SPACE to start capture or ESC to exit")
            print("- The capture will start automatically after instructions")
            
            # Preview mode
            while True:
                ret, frame = self.camera.read()
                if not ret:
                    continue
                
                # Flip frame horizontally for mirror effect
                frame = cv2.flip(frame, 1)
                
                # Draw face guide
                frame = self.draw_face_guide(frame)
                
                # Add instructions
                frame = self.show_message_overlay(frame, "Press SPACE to capture or ESC to exit", 
                                                (255, 255, 255), 0.7)
                
                cv2.imshow(self.window_name, frame)
                
                key = cv2.waitKey(30) & 0xFF
                if key == 27:  # ESC key
                    return {'success': False, 'error': 'User cancelled'}
                elif key == 32:  # SPACE key
                    break
            
            # Start capture sequence
            print("Starting capture sequence...")
            
            # Say cheese sequence
            self.say_cheese_sequence()
            
            # Countdown sequence
            self.countdown_sequence()
            
            # Capture photo
            captured_frame = self.capture_photo()
            
            if captured_frame is not None:
                # Save photo
                result = self.save_photo(captured_frame, user_data or {})
                
                if result['success']:
                    print(f"✅ Photo captured successfully!")
                    print(f"📁 Saved to: {result['filename']}")
                    
                    # Show success message
                    success_frame = captured_frame.copy()
                    success_frame = self.show_message_overlay(success_frame, 
                                                            "Perfect! Photo Saved! ✨", 
                                                            (0, 255, 0), 2)
                    cv2.imshow(self.window_name, success_frame)
                    cv2.waitKey(2000)
                    
                    return result
                else:
                    print(f"❌ Failed to save photo: {result['error']}")
                    return result
            else:
                return {'success': False, 'error': 'Failed to capture photo'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            # Cleanup
            if self.camera:
                self.camera.release()
            cv2.destroyAllWindows()

def main():
    """Main function to run the capture"""
    # Parse command line arguments
    user_data = {}
    if len(sys.argv) > 1:
        try:
            user_data = json.loads(sys.argv[1])
        except:
            pass
    
    # Run capture session
    capture = SelfieCapture()
    result = capture.run_capture_session(user_data)
    
    # Output result as JSON
    print(json.dumps(result))
    
    return 0 if result['success'] else 1

if __name__ == "__main__":
    sys.exit(main())
