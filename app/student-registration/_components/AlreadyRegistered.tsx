'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AlreadyRegistered() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 text-center">
        <CardHeader>
          <CardTitle>Already Registered</CardTitle>
          <CardDescription>Your email is already associated with an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">It looks like you have already completed the registration. Please proceed to the login page.</p>
          <Button onClick={() => router.push('/login')} className="w-full">Go to Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}
