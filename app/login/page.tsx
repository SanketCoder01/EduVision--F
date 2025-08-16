"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EnhancedAuthSystem from '@/components/EnhancedAuthSystem';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';



// --- Main Login Page ---
export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialType = (searchParams.get('type') ?? searchParams.get('role') ?? 'student') as 'student' | 'faculty';
  const [userType, setUserType] = useState<'student' | 'faculty'>(initialType);

  // Keep tab in sync if query changes (e.g., from landing buttons)
  React.useEffect(() => {
    const nextType = (searchParams.get('type') ?? searchParams.get('role') ?? 'student') as 'student' | 'faculty';
    if (nextType !== userType) setUserType(nextType);
  }, [searchParams]);

  const onTabChange = (v: string) => {
    const t = (v as 'student' | 'faculty');
    setUserType(t);
    // Replace to avoid polluting history on tab switches
    router.replace(`${pathname}?type=${t}`);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-gray-800"
          >
            Welcome to <span className="text-purple-600">EduVision</span>
          </motion.h1>
          <motion.p 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-2 text-gray-500"
          >
            Your unified platform for academic excellence.
          </motion.p>
        </div>

        <Tabs value={userType} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-gray-200/80 p-1">
            <TabsTrigger value="student" className="h-full rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md">Student</TabsTrigger>
            <TabsTrigger value="faculty" className="h-full rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md">Faculty</TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={userType}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              <TabsContent value="student">
                 <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Student Portal</CardTitle>
                      <CardDescription>Sign in to your account to continue.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <EnhancedAuthSystem userType="student" />
                    </CardContent>
                  </Card>
              </TabsContent>
              <TabsContent value="faculty">
                 <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Faculty Portal</CardTitle>
                      <CardDescription>Sign in to your account to manage your courses.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <EnhancedAuthSystem userType="faculty" />
                    </CardContent>
                  </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
