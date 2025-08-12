'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Eye, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import {
  detectFace,
  detectLiveness,
  generateFaceEncoding,
  getCurrentLocation,
  getDeviceInfo,
  validateAttendanceRequirements
} from '@/lib/face-recognition';
import {
  verifyGeoFencing,
  getFaceData,
  saveStudentFace
} from '@/app/actions/attendance-actions';

interface FaceAttendanceModalProps {
  session: any;
  onClose: () => void;
  onComplete: (data: any) => void;
}

type AttendanceStep = 'initializing' | 'face-detection' | 'liveness-detection' | 'location-verification' | 'completing' | 'success' | 'error';

export function FaceAttendanceModal({ session, onClose, onComplete }: FaceAttendanceModalProps) {
  const [currentStep, setCurrentStep] = useState<AttendanceStep>('initializing');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [livenessDetected, setLivenessDetected] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [livenessScore, setLivenessScore] = useState(0);
  const [locationData, setLocationData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeAttendance();
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeAttendance = async () => {
    try {
      setCurrentStep('initializing');
      setProgress(10);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });

      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setProgress(30);
      setCurrentStep('face-detection');
      
      // Start face detection
      await performFaceDetection();
    } catch (error) {
      setError('Failed to access camera. Please check permissions.');
      setCurrentStep('error');
    }
  };

  const performFaceDetection = async () => {
    try {
      setProgress(40);
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = resolve;
        }
      });

      // Detect face
      const faceResult = await detectFace(videoRef.current);
      
      if (faceResult.success && faceResult.faceDetected) {
        setFaceDetected(true);
        setFaceConfidence(faceResult.confidence || 0);
        setProgress(60);

        // Generate face encoding
        const faceEncoding = await generateFaceEncoding(videoRef.current);
        
        // Save face data (in real app, this would be done during registration)
        // await saveStudentFace(studentId, faceEncoding);

        // Move to liveness detection
        if (session.require_liveness_detection) {
          setCurrentStep('liveness-detection');
          await performLivenessDetection();
        } else {
          setCurrentStep('location-verification');
          await performLocationVerification();
        }
      } else {
        throw new Error('Face not detected. Please look directly at the camera.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Face detection failed');
      setCurrentStep('error');
    }
  };

  const performLivenessDetection = async () => {
    try {
      setProgress(70);
      
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Perform liveness detection
      const livenessResult = await detectLiveness(videoRef.current, 3000);
      
      if (livenessResult.success && livenessResult.isLive) {
        setLivenessDetected(true);
        setLivenessScore(livenessResult.livenessScore);
        setProgress(80);

        // Move to location verification
        setCurrentStep('location-verification');
        await performLocationVerification();
      } else {
        throw new Error('Liveness detection failed. Please ensure you are a live person.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Liveness detection failed');
      setCurrentStep('error');
    }
  };

  const performLocationVerification = async () => {
    try {
      setProgress(90);
      
      if (!session.require_geo_fencing) {
        // Skip location verification if not required
        await completeAttendance();
        return;
      }

      // Get current location
      const location = await getCurrentLocation();
      setLocationData(location);

      // Verify geo-fencing
      const geoResult = await verifyGeoFencing(session.id, location.latitude, location.longitude);
      
      if (geoResult.verified) {
        setLocationVerified(true);
        setProgress(95);
        await completeAttendance();
      } else {
        throw new Error(`Location verification failed. You must be within ${session.geo_fence_radius}m of the campus.`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Location verification failed');
      setCurrentStep('error');
    }
  };

  const completeAttendance = async () => {
    try {
      setCurrentStep('completing');
      setProgress(100);

      // Validate all requirements
      const validation = await validateAttendanceRequirements(
        session,
        faceDetected,
        locationVerified,
        livenessDetected
      );

      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Determine attendance status
      const now = new Date();
      const sessionStart = new Date(`${session.session_date}T${session.start_time}`);
      const sessionEnd = new Date(`${session.session_date}T${session.end_time}`);
      
      let attendanceStatus = 'present';
      if (now < sessionStart) {
        attendanceStatus = 'late';
      } else if (now > sessionEnd) {
        attendanceStatus = 'late';
      }

      // Get device info
      const deviceInfo = getDeviceInfo();

      const attendanceData = {
        status: attendanceStatus,
        faceVerified: faceDetected,
        geoVerified: locationVerified,
        livenessVerified: livenessDetected,
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        distanceFromCenter: locationData ? Math.round(locationData.distance) : null,
        faceConfidence,
        livenessScore,
        deviceInfo,
        ipAddress: 'mock-ip' // In real app, get from request
      };

      setCurrentStep('success');
      
      // Call completion handler
      onComplete(attendanceData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete attendance');
      setCurrentStep('error');
    }
  };

  const retryAttendance = () => {
    setCurrentStep('initializing');
    setProgress(0);
    setError('');
    setFaceDetected(false);
    setLivenessDetected(false);
    setLocationVerified(false);
    initializeAttendance();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'initializing':
        return 'Initializing Attendance System';
      case 'face-detection':
        return 'Face Detection';
      case 'liveness-detection':
        return 'Liveness Detection';
      case 'location-verification':
        return 'Location Verification';
      case 'completing':
        return 'Completing Attendance';
      case 'success':
        return 'Attendance Marked Successfully';
      case 'error':
        return 'Attendance Failed';
      default:
        return 'Processing...';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'initializing':
        return 'Setting up camera and verification systems...';
      case 'face-detection':
        return 'Please look directly at the camera for face recognition';
      case 'liveness-detection':
        return 'Follow the prompts to prove you are a live person';
      case 'location-verification':
        return 'Verifying your location within campus boundaries';
      case 'completing':
        return 'Finalizing your attendance record...';
      case 'success':
        return 'Your attendance has been successfully recorded';
      case 'error':
        return error;
      default:
        return 'Processing your attendance...';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Video Feed */}
          {currentStep !== 'success' && currentStep !== 'error' && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg border"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-64 object-cover rounded-lg"
                style={{ display: 'none' }}
              />
              
              {/* Overlay for current step */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                  {currentStep === 'face-detection' && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      <span>Face Detection</span>
                    </div>
                  )}
                  {currentStep === 'liveness-detection' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Liveness Detection</span>
                    </div>
                  )}
                  {currentStep === 'location-verification' && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>Location Verification</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg border ${
              faceDetected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2">
                <Eye className={`w-4 h-4 ${faceDetected ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Face Recognition</span>
              </div>
              {faceDetected && (
                <div className="text-xs text-green-600 mt-1">
                  Confidence: {Math.round(faceConfidence * 100)}%
                </div>
              )}
            </div>

            <div className={`p-3 rounded-lg border ${
              livenessDetected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${livenessDetected ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Liveness</span>
              </div>
              {livenessDetected && (
                <div className="text-xs text-green-600 mt-1">
                  Score: {Math.round(livenessScore * 100)}%
                </div>
              )}
            </div>

            <div className={`p-3 rounded-lg border ${
              locationVerified ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${locationVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Location</span>
              </div>
              {locationVerified && (
                <div className="text-xs text-green-600 mt-1">
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {currentStep === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Attendance Failed</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {currentStep === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Attendance Marked Successfully</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your attendance has been recorded with all verifications completed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {currentStep === 'error' && (
              <Button onClick={retryAttendance} variant="outline">
                Retry
              </Button>
            )}
            <Button 
              onClick={onClose}
              variant={currentStep === 'success' ? 'default' : 'outline'}
            >
              {currentStep === 'success' ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 