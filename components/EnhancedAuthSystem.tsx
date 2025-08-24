"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SimpleGoogleSignup from './SimpleGoogleSignup';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase, { authenticateFaculty } from '@/lib/supabase'; // Assuming authenticateFaculty is exported from supabase lib

// --- Helper to convert base64 to a File object for uploading ---
function base64toFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid base64 string');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) { u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, { type: mime });
}

// --- Main Component: Faculty Login Form ---
interface EnhancedAuthSystemProps {
  userType: 'student' | 'faculty';
}

export default function EnhancedAuthSystem({ userType }: EnhancedAuthSystemProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [department, setDepartment] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Surface callback messages (e.g., invalid domain)
  useEffect(() => {
    const err = searchParams.get('error');
    const msg = searchParams.get('message');
    if (err) setError(err);
    else if (msg) setError(msg);
    // Do not auto-clear; allow user to see it
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    // Do NOT show animated overlay; only disable button label
    setIsLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?type=${userType}`,
      },
    });
    if (error) {
      setError(`Google Sign-In failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use the same authentication method for both student and faculty
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Redirect based on user type
        if (userType === 'faculty') {
          router.push('/dashboard');
        } else {
          router.push('/student-dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your mail"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full pl-11 pr-4 py-6 text-base border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg" 
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full pl-11 pr-12 py-6 text-base border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg" 
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
            <Label htmlFor="remember-me" className="text-sm font-medium text-gray-600 cursor-pointer">Remember me</Label>
          </div>
          <button 
            type="button"
            onClick={() => router.push(`/auth/forgot-password?type=${userType}`)}
            className="text-sm font-medium text-purple-600 hover:text-purple-500"
          >
            Forgot your password?
          </button>
        </div>

        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6 rounded-lg font-semibold shadow-md transition-transform transform hover:scale-105" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full h-12 border-2 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-all duration-200 flex items-center justify-center" disabled={isLoading}>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {isLoading ? 'Redirecting…' : 'Sign In with Google'}
        </Button>
      </form>
    </motion.div>
  );
}