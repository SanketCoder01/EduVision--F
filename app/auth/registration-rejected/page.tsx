'use client'

import { motion } from 'framer-motion'
import { XCircle, Mail, User, GraduationCap, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata: { [key: string]: any };
}

export default function RegistrationRejectedPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      setUser(supabaseUser);
      
      if (supabaseUser?.email) {
        // Get rejection reason from pending_registrations
        const { data: pendingReg } = await supabase
          .from('pending_registrations')
          .select('rejection_reason, user_type')
          .eq('email', supabaseUser.email)
          .single();
        
        if (pendingReg) {
          setRejectionReason(pendingReg.rejection_reason);
          setUserType(pendingReg.user_type);
        }
      }
    };
    fetchUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleRegisterAgain = () => {
    const registrationPath = userType === 'faculty' ? '/faculty-registration' : '/student-registration';
    router.push(registrationPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 rounded-full p-3 w-fit mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Registration Rejected
            </CardTitle>
            <CardDescription className="text-md text-gray-600">
              We're sorry, but your registration could not be approved at this time.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {user && (
              <div>
                <div className="bg-gray-50 border rounded-lg p-4 space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-800">{user.email}</span>
                  </div>
                  {userType === 'student' ? (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">
                        <span className="font-medium">Student Registration</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">
                        <span className="font-medium">Faculty Registration</span>
                      </span>
                    </div>
                  )}
                </div>

                {rejectionReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <h4 className="font-semibold text-red-900 mb-1">Admin Feedback:</h4>
                    <p className="text-sm text-red-800">{rejectionReason}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <ArrowLeft className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">What can you do?</h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside mt-1">
                        <li>Review the feedback provided above</li>
                        <li>Make necessary corrections to your information</li>
                        <li>Submit a new registration with updated details</li>
                        <li>Contact support if you need assistance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center pt-4 space-y-3">
              <Button 
                onClick={handleRegisterAgain}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Register Again
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
