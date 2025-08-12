'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle, AlertCircle, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { registerFaceWithPython } from '@/app/actions/python-attendance-actions';

interface FirstTimeSetupProps {
  readonly user_id: string;
  readonly user_type: 'student' | 'faculty';
  readonly user_name: string;
  readonly onComplete: () => void;
}

export function FirstTimeSetup({ user_id, user_type, user_name, onComplete }: FirstTimeSetupProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'camera' | 'capturing' | 'processing' | 'success'>('intro');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480, 
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
        setCurrentStep('camera');
      }
    } catch (error) {
      toast.error('Failed to access camera. Please check permissions and try again.');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleCapture = () => {
    const imageData = captureImage();
    if (imageData) {
      setCapturedImage(imageData);
      setCurrentStep('capturing');
    } else {
      toast.error('Failed to capture image. Please try again.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCurrentStep('camera');
  };

  const handleSubmit = async () => {
    if (!capturedImage) {
      toast.error('No image captured');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      const response = await registerFaceWithPython(user_id, user_type, capturedImage);
      
      if (response.success) {
        setCurrentStep('success');
        toast.success('Face registered successfully!');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        toast.error(response.message || 'Failed to register face');
        setCurrentStep('capturing');
      }
    } catch (error) {
      console.error('Error registering face:', error);
      toast.error('Failed to register face. Please try again.');
      setCurrentStep('capturing');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const renderIntro = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <User className="w-10 h-10 text-blue-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user_name || 'User'}!</h2>
        <p className="text-gray-600 mt-2">Let's set up your face recognition for attendance</p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-left">
            <h4 className="font-medium text-blue-800">Important Setup Information</h4>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Ensure good lighting for clear face capture</li>
              <li>• Remove glasses if they cause glare</li>
              <li>• Look directly at the camera</li>
              <li>• This setup is required only once</li>
            </ul>
          </div>
        </div>
      </div>

      <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
        <Camera className="w-4 h-4 mr-2" />
        Start Face Setup
      </Button>
    </div>
  );

  const renderCamera = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Camera Setup</h3>
        <p className="text-gray-600">Position your face in the camera view</p>
      </div>
      
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
          className="hidden"
        />
        
        {/* Face guide overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-2 border-blue-500 rounded-full opacity-50"></div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={handleCapture} className="bg-green-600 hover:bg-green-700">
          <Camera className="w-4 h-4 mr-2" />
          Capture Image
        </Button>
        <Button onClick={() => setCurrentStep('intro')} variant="outline">
          Back
        </Button>
      </div>
    </div>
  );

  const renderCapturing = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Review Your Image</h3>
        <p className="text-gray-600">Check if the image is clear and proceed</p>
      </div>
      
      <div className="relative">
        <img
          src={capturedImage || ''}
          alt="Captured face"
          className="w-full h-64 object-cover rounded-lg border"
        />
        
        {/* Quality indicators */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Captured
          </Badge>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={handleSubmit} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Register Face
            </>
          )}
        </Button>
        <Button onClick={handleRetake} variant="outline">
          Retake
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h3 className="text-lg font-semibold">Processing Your Face Data</h3>
      <p className="text-gray-600">Please wait while we register your face...</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-green-800">Setup Complete!</h3>
      <p className="text-gray-600">Your face has been registered successfully.</p>
      <p className="text-sm text-gray-500">You can now mark attendance using face recognition.</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              First-Time Setup
            </CardTitle>
            <CardDescription>
              {user_type === 'student' ? 'Student' : 'Faculty'} Face Registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 'intro' && renderIntro()}
            {currentStep === 'camera' && renderCamera()}
            {currentStep === 'capturing' && renderCapturing()}
            {currentStep === 'processing' && renderProcessing()}
            {currentStep === 'success' && renderSuccess()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 