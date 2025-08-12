"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import supabase from "@/lib/supabase";
import EduVisionLoader from "@/components/ui/animated-loader"

function VerifyCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const userType = searchParams.get("type")
  const userName = searchParams.get("name")
  const userEmail = searchParams.get("email")

  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  if (!userEmail || !userName || !userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>
              Verification details are missing. Please try signing in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')}>Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length < 6) {
      setError("Please enter the complete 6-digit code.")
      return
    }

    setIsLoading(true);

    const { data, error: verificationError } = await supabase.auth.verifyOtp({
      email: userEmail,
      token: otp,
      type: 'email',
    });

    if (verificationError) {
      setError(verificationError.message);
      setIsLoading(false);
      return;
    }

    if (!data.session) {
        setError("Verification failed. Please try signing in again.");
        setIsLoading(false);
        return;
    }

    toast({
      title: "Email Verified!",
      description: "Please complete your registration details.",
    })

    const destination = userType === 'faculty' ? '/faculty-registration' : '/student-registration';
    router.push(`${destination}?name=${userName}&email=${userEmail}`);
  }

  if (isLoading) {
    return <EduVisionLoader />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to <strong>{userEmail}</strong>. Please enter it below to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                Verify & Continue
              </Button>
            </form>
             <div className="text-center text-sm text-gray-500 mt-4">
                Didn't receive a code? <Button variant="link" className="p-0 h-auto">Resend code</Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<EduVisionLoader />}>
      <VerifyCodeForm />
    </Suspense>
  )
}
