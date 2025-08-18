'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle, Mail, User, GraduationCap, XCircle, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface RealtimeChannel {}

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata: { [key: string]: any };
}

export default function PendingApprovalPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [pendingReg, setPendingReg] = useState<any>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [showApprovalSuccess, setShowApprovalSuccess] = useState(false);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualCheckCount, setManualCheckCount] = useState(0);
  const [forceDashboard, setForceDashboard] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error);
          setError('Authentication error');
          setIsLoading(false);
          return;
        }
        setUser(supabaseUser);
        
        if (!supabaseUser) {
          router.push('/login');
          return;
        }
      } catch (err) {
        console.error('Error in fetchUser:', err);
        setError('Failed to load user data');
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [supabase.auth, router]);

  const checkStatus = async () => {
    if (!user || !user.email) return;
    
    setIsChecking(true);
    console.log('Checking status for user:', user.email);

    try {
      const { data: pendingData, error } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No pending registration found for:', user.email);
          setError('No pending registration found. You may already be registered.');
          setIsLoading(false);
          return;
        } else {
          console.error('Error fetching pending registration:', error);
          setError('Failed to check registration status');
          setIsLoading(false);
          return;
        }
      }

      if (pendingData) {
        console.log('Found pending registration:', pendingData);
        setPendingReg(pendingData);
        setIsLoading(false);
        
        // Immediately check status and update UI
        if (pendingData.status === 'approved') {
          console.log('Registration is approved - showing success');
          setIsApproved(true);
          setShowApprovalSuccess(true);
          return;
        } else if (pendingData.status === 'rejected') {
          console.log('Registration is rejected - showing rejection');
          setRejectionReason(pendingData.rejection_reason);
          setIsRejected(true);
          setShowRejectionMessage(true);
          return;
        } else if (pendingData.status === 'pending_approval') {
          console.log('Registration still pending approval');
        }
      }
    } catch (error) {
      console.error('Error in checkStatus:', error);
      setError('Failed to check registration status');
      setIsLoading(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!user || !user.email) return;

    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    let channel: RealtimeChannel | null = null;

    const cleanup = () => {
      if (!isMounted) return;
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (channel) {
        supabase.removeChannel(channel).catch((err: any) => console.error('Error removing channel:', err));
      }
    };

    // Initial check
    checkStatus();

    // Set up real-time subscription
    channel = supabase
      .channel('pending_registration_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pending_registrations',
          filter: `email=eq.${user.email}`
        },
        (payload: any) => {
          console.log('Real-time update received:', payload);
          if (payload.new.status === 'approved') {
            console.log('Real-time approval received - showing success and auto-redirecting');
            setPendingReg(payload.new);
            setIsApproved(true);
            setShowApprovalSuccess(true);
            // Automatically redirect to dashboard after approval
            setTimeout(() => {
              if (payload.new.user_type === 'student') {
                router.push('/dashboard');
              } else if (payload.new.user_type === 'faculty') {
                router.push('/dashboard');
              } else {
                router.push('/dashboard'); // Default
              }
            }, 3000); // Redirect after 3 seconds
          } else if (payload.new.status === 'rejected') {
            console.log('Real-time rejection received - showing rejection message');
            setRejectionReason(payload.new.rejection_reason);
            setIsRejected(true);
            setShowRejectionMessage(true);
            setPendingReg(payload.new);
            // Don't cleanup here, let the user see the rejection message
          }
        }
      )
      .subscribe((status: any) => {
        console.log('Real-time subscription status:', status);
      });

    console.log('Real-time subscription established for:', user.email);

    // Faster polling for immediate updates
    intervalId = setInterval(() => {
      if (isMounted && !isChecking) {
        checkStatus();
      }
    }, 5000); // Check every 5 seconds to reduce load

    return cleanup;
  }, [user, supabase, router]);

  const handleProceedToDashboard = () => {
    router.push('/dashboard');
  };

  const handleForceDashboard = () => {
    // Force redirect regardless of status
    router.push('/dashboard');
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    window.location.reload();
  };

  const handleManualCheck = () => {
    setManualCheckCount(prev => prev + 1);
    checkStatus();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading registration status...</p>
            {isChecking && (
              <p className="text-sm text-gray-600 mt-2">Checking for updates...</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button onClick={handleForceDashboard} variant="outline" className="w-full">
                Go to Dashboard Anyway
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  // Show rejection message
  if (showRejectionMessage && isRejected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="w-full border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900">
                Registration Rejected
              </CardTitle>
              <CardDescription className="text-red-700">
                Your registration has been reviewed and rejected by the admin.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.user_metadata?.full_name || user.email}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>

                {pendingReg && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>
                      {pendingReg.user_type === 'student' ? 'Student' : 'Faculty'} - {pendingReg.department}
                      {pendingReg.user_type === 'student' && pendingReg.year && ` (${pendingReg.year} Year)`}
                    </span>
                  </div>
                )}
              </div>

              {rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    </div>
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Rejection Reason:</p>
                      <p className="mt-1">{rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  </div>
                  <div className="text-sm text-red-800">
                    <p className="font-medium">What you can do:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Review the rejection reason above</li>
                      <li>• Contact admin for clarification if needed</li>
                      <li>• You can try registering again with corrected information</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleGoToLogin}
                  className="w-full bg-red-600 hover:bg-red-700 shadow-md transition-all"
                >
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="text-center text-xs text-gray-500">
                  <p>You can contact admin or try registering again</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show approval success message
  if (showApprovalSuccess && isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="w-full border-green-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-900">
                Registration Approved!
              </CardTitle>
              <CardDescription className="text-green-700">
                Congratulations! Your registration has been approved by the admin.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.user_metadata?.full_name || user.email}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>

                {pendingReg && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4" />
                    <span>
                      {pendingReg.user_type === 'student' ? 'Student' : 'Faculty'} - {pendingReg.department}
                      {pendingReg.user_type === 'student' && pendingReg.year && ` (${pendingReg.year} Year)`}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  </div>
                  <div className="text-sm text-green-800">
                    <p className="font-medium">What's next?</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Your account has been created successfully</li>
                      <li>• You can now access your dashboard</li>
                      <li>• Check your email for login credentials</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleProceedToDashboard}
                  className="w-full bg-green-600 hover:bg-green-700 shadow-md transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="text-center text-xs text-gray-500">
                  <p>Redirecting automatically in 3 seconds...</p>
                  <p className="mt-1">Or click the button above to go now</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Registration Pending
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your registration is currently under review
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.user_metadata?.full_name || user.email}</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>

              {pendingReg && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>
                    {pendingReg.user_type === 'student' ? 'Student' : 'Faculty'} - {pendingReg.department}
                    {pendingReg.user_type === 'student' && pendingReg.year && ` (${pendingReg.year} Year)`}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">What happens next?</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Admin will review your registration</li>
                    <li>• You'll receive an email notification</li>
                    <li>• You'll see a success or rejection message here</li>
                  </ul>
                </div>
              </div>
            </div>

            {isChecking && (
              <div className="text-center text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Checking status...
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleManualCheck}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Status Now ({manualCheckCount})
              </Button>
              
              <Button
                onClick={handleForceDashboard}
                variant="outline"
                className="w-full bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              >
                Go to Dashboard Anyway
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>This page will show you when your registration is approved or rejected</p>
              <p className="mt-1">Manual checks: {manualCheckCount}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
