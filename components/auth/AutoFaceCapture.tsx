"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface AutoFaceCaptureProps {
  onCapture: (imageData: string, filename: string) => void;
  onComplete: () => void;
}

const FLASK_API_URL = 'http://localhost:5000/auto_detect_and_capture';

export function AutoFaceCapture({ onCapture, onComplete }: AutoFaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);

  const captureFrame = useCallback(async () => {
    if (webcamRef.current && !capturedImage) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const response = await fetch(FLASK_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageSrc }),
          });

          if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          setFeedback(data.feedback || []);
          if(data.overlay_image) {
            setOverlayImage(data.overlay_image);
          }

          if (data.should_capture && data.captured_image) {
            setCapturedImage(data.captured_image);
            onCapture(data.captured_image, data.filename);
            setIsCapturing(false);
          }
        } catch (err: any) {
          setError(`Capture failed: ${err.message}`);
          setIsCapturing(false);
        }
      }
    }
  }, [webcamRef, capturedImage, onCapture]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isCapturing) {
      intervalId = setInterval(captureFrame, 500); // Send frame every 500ms
    }
    return () => clearInterval(intervalId);
  }, [isCapturing, captureFrame]);

  const handleStartCapture = () => {
    setError(null);
    setCapturedImage(null);
    setFeedback([]);
    setIsCapturing(true);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setOverlayImage(null);
    setFeedback([]);
    setError(null);
    setIsCapturing(true);
  };

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Face Capture</CardTitle>
        <CardDescription>Position your face in the center of the frame. The system will automatically capture your photo.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
              mirrored
            />
          )}
          {overlayImage && !capturedImage && (
             <img src={overlayImage} alt="Face overlay" className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" />
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!capturedImage && (
          <div className="text-center">
            {feedback.map((msg, i) => (
              <p key={i} className="text-sm text-muted-foreground">{msg}</p>
            ))}
          </div>
        )}

        <div className="flex w-full gap-4">
          {!isCapturing && !capturedImage && (
            <Button onClick={handleStartCapture} className="w-full" disabled={isLoading}>
              <Camera className="mr-2 h-4 w-4" /> Start Capture
            </Button>
          )}

          {isCapturing && (
            <Button className="w-full" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Capturing...
            </Button>
          )}

          {capturedImage && (
            <>
              <Button onClick={handleRetake} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Retake
              </Button>
              <Button onClick={onComplete} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" /> Confirm & Continue
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
