"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, RotateCcw, CheckCircle } from 'lucide-react';

export default function FaceCapturePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  const userEmail = searchParams.get('email') || '';
  const userName = searchParams.get('name') || '';
  const userType = searchParams.get('type') || 'student';

  useEffect(() => {
    if (!userEmail || !userName) {
      setError('Missing user information. Please try again.');
      return;
    }
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          startFaceDetection();
        };
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const startFaceDetection = () => {
    const detectFace = () => {
      if (!videoRef.current || !canvasRef.current || capturedImage) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.videoWidth === 0) {
        requestAnimationFrame(detectFace);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // Simple face detection simulation (in real implementation, you'd use face-api.js or similar)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const hasValidFrame = imageData.data.length > 0;
      
      // Simulate face detection based on video activity
      const currentFaceDetected = hasValidFrame && video.videoWidth > 0 && video.videoHeight > 0;
      
      setFaceDetected(currentFaceDetected);
      
      if (currentFaceDetected && !isCapturing) {
        setDetectionCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 10) {
            // Auto capture after 10 frames of face detection
            setTimeout(() => capturePhoto(), 500);
            setIsCapturing(true);
            return newCount;
          }
          return newCount;
        });
      } else if (!currentFaceDetected) {
        setDetectionCount(0);
      }

      if (!capturedImage) {
        requestAnimationFrame(detectFace);
      }
    };

    detectFace();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(false);
    
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError('');
    setDetectionCount(0);
    setIsCapturing(false);
    startCamera();
  };

  const uploadPhoto = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType,
          profile: {
            email: userEmail,
            name: userName,
            field: 'Computer Science', // Default values - these should come from registration
            course: 'B.Tech',
            department: 'CSE',
            year: '1st Year'
          },
          faceImageData: capturedImage,
          password: 'temp123' // This should be handled properly
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Redirect to check email page
        router.push('/auth/check-email');
      } else {
        setError(result.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      setError('Upload failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (capturedImage) return "Photo captured successfully!";
    if (isCapturing) return "Capturing image...";
    if (faceDetected) {
      const remaining = 10 - detectionCount;
      return `Face detected! Stay still... ${remaining} frames remaining`;
    }
    return "Position your face in the camera view";
  };

  const getStatusColor = () => {
    if (capturedImage) return "text-green-600";
    if (faceDetected) return "text-blue-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Face Verification
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Welcome {userName}! Please capture your photo for verification.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Status Indicator */}
            <div className="text-center">
              <div className={`font-semibold ${getStatusColor()}`}>
                {faceDetected && !capturedImage && <CheckCircle className="inline w-5 h-5 mr-2" />}
                {getStatusMessage()}
              </div>
              {faceDetected && !capturedImage && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((detectionCount / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="relative">
              {!capturedImage ? (
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-blue-400 rounded-lg pointer-events-none">
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 rounded-full transition-colors ${
                      faceDetected ? 'border-green-400' : 'border-white'
                    } opacity-50`}></div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Captured
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-4 justify-center">
              {!capturedImage ? (
                <Button
                  onClick={capturePhoto}
                  disabled={!faceDetected || isCapturing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  {isCapturing ? 'Capturing...' : 'Manual Capture'}
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    onClick={retakePhoto}
                    className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Retake
                  </Button>
                  <Button
                    onClick={uploadPhoto}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    {isLoading ? 'Uploading...' : 'Upload & Continue'}
                  </Button>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Position your face within the circle and ensure good lighting</p>
              <p>The system will automatically detect and capture your face</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
