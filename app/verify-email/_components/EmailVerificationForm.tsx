'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Loader2, MailCheck } from 'lucide-react';

function EmailVerificationFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const userType = searchParams.get('userType');

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !userType) {
      router.replace('/login');
    }
  }, [email, userType, router]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setSuccess(true);
      // Redirect to the appropriate registration page after a short delay
      setTimeout(() => {
        const nextStepUrl = userType === 'student' 
          ? `/student-registration?email=${encodeURIComponent(email!)}`
          : `/faculty-registration?email=${encodeURIComponent(email!)}`;
        router.push(nextStepUrl);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userType }),
      });
      if (!response.ok) throw new Error('Failed to resend code.');
      // Optionally, show a success message for resending
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Or a loading/error state
  }
  
  if (success) {
    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
            <MailCheck className="w-16 h-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold text-gray-800">Email Verified!</h1>
            <p className="text-gray-600">Redirecting you to the next step...</p>
        </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Check your email</h1>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit verification code to <br />
          <span className="font-semibold text-gray-900">{email}</span>
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex flex-col space-y-4">
        <Button onClick={handleVerify} disabled={isLoading || code.length < 6}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify Email'}
        </Button>
        <Button variant="link" onClick={handleResendCode} disabled={isResending}>
          {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Resend Code'}
        </Button>
      </div>
      
      <p className="text-xs text-center text-gray-500">
        Didn't receive the email? Check your spam folder or click to resend.
      </p>
    </div>
  );
}

export default function EmailVerificationForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmailVerificationFormComponent />
        </Suspense>
    )
}
