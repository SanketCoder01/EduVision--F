'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, User, Briefcase } from 'lucide-react';

export default function NewLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'student' | 'faculty'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred.');
      }

      router.push(`/verify-email?email=${encodeURIComponent(email)}&userType=${userType}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to EduVision</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">I am a...</Label>
            <RadioGroup
              defaultValue="student"
              className="grid grid-cols-2 gap-4 mt-2"
              onValueChange={(value: 'student' | 'faculty') => setUserType(value)}
            >
              <div>
                <RadioGroupItem value="student" id="student" className="peer sr-only" />
                <Label
                  htmlFor="student"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <User className="mb-2 h-6 w-6" />
                  Student
                </Label>
              </div>
              <div>
                <RadioGroupItem value="faculty" id="faculty" className="peer sr-only" />
                <Label
                  htmlFor="faculty"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Briefcase className="mb-2 h-6 w-6" />
                  Faculty
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">College Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder={userType === 'student' ? 'your-id@sanjivani.org.in' : 'your-id@set.edu.in'}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue with Email'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
