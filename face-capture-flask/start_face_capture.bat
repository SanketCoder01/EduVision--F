@echo off
echo 🚀 Starting EduVision Face Capture System...
echo.
echo 📹 This will start the face capture Flask application
echo 🌐 The web interface will be available at: http://localhost:5000
echo.
echo ⚠️  Make sure your camera is connected and accessible
echo.
echo Press any key to start...
pause >nul

echo.
echo 🔧 Installing/updating Python dependencies...
pip install -r requirements.txt

echo.
echo 🚀 Starting Flask application...
python app.py

echo.
echo ✅ Face capture system stopped
pause
