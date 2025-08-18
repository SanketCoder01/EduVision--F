'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaceCaptureProps {
  onCapture: (imageData: string, faceData: any) => void;
  onSkip?: () => void;
  isCapturing?: boolean;
}

export default function FaceCapture({ onCapture, onSkip, isCapturing = false }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCaptured(true);

    // Simulate face detection (in real implementation, this would call your Python backend)
    const faceData = {
      encoding: 'simulated_face_encoding_data',
      confidence: 0.95,
      landmarks: []
    };

    onCapture(imageData, faceData);
  }, [onCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setIsCaptured(false);
    setFaceDetected(false);
    setCaptureCountdown(null);
  }, []);

  // Auto-capture when face is detected
  useEffect(() => {
    if (!isCameraActive || isCaptured) return;

    const interval = setInterval(() => {
      // Simulate face detection (replace with actual face detection logic)
      const hasFace = Math.random() > 0.7; // Simulate 30% chance of face detection
      
      if (hasFace && !faceDetected) {
        setFaceDetected(true);
        setCaptureCountdown(3);
      } else if (!hasFace && faceDetected) {
        setFaceDetected(false);
        setCaptureCountdown(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCameraActive, isCaptured, faceDetected]);

  // Countdown for auto-capture
  useEffect(() => {
    if (captureCountdown === null) return;

    if (captureCountdown > 0) {
      const timer = setTimeout(() => {
        setCaptureCountdown(captureCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (captureCountdown === 0) {
      captureImage();
    }
  }, [captureCountdown, captureImage]);

  useEffect(() => {
    if (isCapturing) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCapturing, startCamera, stopCamera]);

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button onClick={startCamera} variant="outline" className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Retry Camera
            </Button>
            {onSkip && (
              <Button onClick={onSkip} variant="ghost" className="flex-1">
                Skip
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Face Registration</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          {/* Video Preview */}
          <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {!isCaptured ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Face Detection Overlay */}
                <AnimatePresence>
                  {faceDetected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="relative">
                        {/* Circular face detection indicator */}
                        <div className="w-48 h-48 border-4 border-green-400 rounded-full flex items-center justify-center">
                          <div className="w-40 h-40 border-2 border-green-300 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                          </div>
                        </div>
                        
                        {/* Countdown */}
                        {captureCountdown !== null && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="text-4xl font-bold text-white bg-black/50 rounded-full w-16 h-16 flex items-center justify-center">
                              {captureCountdown}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Face detection status */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 text-white px-3 py-2 rounded-lg text-center">
                    {faceDetected ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Face detected! Capturing in {captureCountdown}...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span>Position your face in the center</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={capturedImage!}
                  alt="Captured face"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            {!isCaptured ? (
              <>
                <Button
                  onClick={captureImage}
                  disabled={!isCameraActive}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Manually
                </Button>
                {onSkip && (
                  <Button onClick={onSkip} variant="ghost" className="flex-1">
                    Skip
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button onClick={retakePhoto} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button className="flex-1" disabled>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Captured
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

