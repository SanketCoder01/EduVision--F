"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, RotateCcw, Check, ArrowLeft, Lock } from 'lucide-react';
import supabase from '@/lib/supabase';

// --- Configuration & Constants ---
const departments = [
  'Computer science and engineering',
  'Cyber security',
  'Artificial intelligence and data science',
  'Artificial intelligence and machine learning'
];
const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
const motionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// --- Interfaces ---
interface SimpleGoogleSignupProps {
  userType: 'student' | 'faculty';
  onCompleteAction: (userData: any) => void;
  onBackAction: () => void;
}

interface UserData {
  name: string;
  email: string;
  password?: string;
  department?: string;
  year?: string;
  mobile?: string;
  photo?: string;
}

// --- Main Component ---
export default function SimpleGoogleSignup({ userType, onCompleteAction, onBackAction }: SimpleGoogleSignupProps) {

  // --- Inner Components & Interfaces ---
  interface WelcomeScreenProps {
    userName: string;
    userEmail: string;
    profilePhoto: string | null;
    onContinue: () => void;
  }

  const WelcomeScreen = ({ userName, userEmail, profilePhoto, onContinue }: WelcomeScreenProps) => {
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setIsRevealed(true), 2500); // Reveal after the logo animation
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="w-full max-w-sm mx-auto p-4 relative flex items-center justify-center" style={{ height: '70vh' }}>
        {/* Circular Reveal Background */}
        <motion.div
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: isRevealed ? 3 : 0, rotate: isRevealed ? 0 : 45 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
        />

        {/* EduVision Logo Animation */}
        {!isRevealed && (
          <motion.div
            className="text-white font-bold text-5xl tracking-wider" style={{ perspective: '1000px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeInOut' }}
              className="inline-block"
            >
              Edu
            </motion.span>
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3, type: 'spring', stiffness: 150 }}
              className="inline-block text-cyan-300"
            >
              Vision
            </motion.span>
          </motion.div>
        )}

        {/* Content revealed after animation */}
        {isRevealed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative text-center z-10 w-full"
          >
            {profilePhoto && (
              <motion.img 
                src={profilePhoto}
                alt="Profile"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto mb-6 border-4 border-white shadow-2xl"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              />
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome, {userName}!</h1>
            <p className="text-blue-200 mb-8">{userEmail}</p>
            <Button 
              onClick={onContinue} 
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-lg py-6 rounded-xl border border-white/30"
            >
              Let's Get Started
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  const [step, setStep] = useState<'auth' | 'password' | 'details' | 'selfie' | 'welcome'>('auth');
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [error, setError] = useState('');
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleNextStep = (nextStep: typeof step) => {
    setError('');
    setStep(nextStep);
  }

  const handleGoogleSignIn = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?type=${userType}`,
      },
    });
    if (error) {
      setError(`Google Sign-In failed: ${error.message}`);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((userData.password?.length || 0) < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    handleNextStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.department || !userData.mobile) {
      setError('Please fill all required fields.');
      return;
    }
    if (userType === 'student' && !userData.year) {
      setError('Please select your academic year.');
      return;
    }
    handleNextStep('selfie');
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setCapturedImage(imageSrc);
  }, [webcamRef]);

    const confirmPhoto = () => {
    if (capturedImage) {
      const finalUserData = { ...userData, photo: capturedImage };
      setUserData(finalUserData);
      handleNextStep('welcome');
      // Set a flag in local storage to indicate setup is complete
      localStorage.setItem('isFirstTimeSetupComplete', 'true');
      // Trigger the completion action which will handle the redirect
      setTimeout(() => onCompleteAction(finalUserData), 3000);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'auth': return (
        <>
          <CardHeader className="text-center">
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Sign up as a {userType} with your Google account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full h-12">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign Up with Google
            </Button>
          </CardContent>
        </>
      );
            case 'password': return (
        <form onSubmit={handlePasswordSubmit}>
          <CardHeader className="text-center">
            <CardTitle>Create a Secure Password</CardTitle>
            <CardDescription>Your password must be at least 6 characters long.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="password" type="password" placeholder="Password" value={userData.password || ''} onChange={e => setUserData(d => ({...d, password: e.target.value}))} className="pl-10 h-12" />
            </div>
            <Button type="submit" className="w-full h-12">Continue</Button>
          </CardContent>
        </form>
      );
      case 'details': return (
        <form onSubmit={handleDetailsSubmit}>
          <CardHeader><CardTitle>Complete Your Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label htmlFor="name">Full Name</Label><Input id="name" value={userData.name || ''} onChange={e => setUserData(d => ({...d, name: e.target.value}))} /></div>
            <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={userData.email || ''} disabled /></div>
                        <div className="space-y-1"><Label htmlFor="department">Department</Label><Select onValueChange={val => setUserData(d => ({...d, department: val}))}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
                        {userType === 'student' && <div className="space-y-1"><Label htmlFor="year">Year</Label><Select onValueChange={val => setUserData(d => ({...d, year: val}))}><SelectTrigger><SelectValue placeholder="Select your year" /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></div>}
            <div className="space-y-1"><Label htmlFor="mobile">Mobile Number</Label><Input id="mobile" type="tel" value={userData.mobile || ''} onChange={e => setUserData(d => ({...d, mobile: e.target.value}))} /></div>
            <Button type="submit" className="w-full !mt-6">Next: Take Photo</Button>
          </CardContent>
        </form>
      );
      case 'selfie': return (
        <>
          <CardHeader><CardTitle className="text-center">Profile Photo</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-primary bg-secondary flex items-center justify-center">
              {capturedImage ? <img src={capturedImage} alt="Your selfie" className="w-full h-full object-cover" /> : <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" mirrored />}
            </div>
            <div className="flex justify-center gap-4">
              {capturedImage ? (
                <><Button variant="outline" onClick={() => setCapturedImage(null)}><RotateCcw className="w-4 h-4 mr-2" />Retake</Button><Button onClick={confirmPhoto}><Check className="w-4 h-4 mr-2" />Confirm</Button></>
              ) : <Button onClick={capturePhoto}><Camera className="w-4 h-4 mr-2" />Capture</Button>}
            </div>
          </CardContent>
        </>
      );
      case 'welcome': return (
        <WelcomeScreen 
          userName={userData.name} 
          userEmail={userData.email} 
          profilePhoto={userData.photo} 
          onContinue={() => setTimeout(() => onCompleteAction(userData), 3000)} 
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="h-10 mb-2">
          {step !== 'auth' && step !== 'welcome' && (
            <Button variant="ghost" onClick={() => setStep(step === 'password' ? 'auth' : 'password')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
        </div>
        <Card>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={motionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {error && <Alert variant="destructive" className="m-4"><AlertDescription>{error}</AlertDescription></Alert>}
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}