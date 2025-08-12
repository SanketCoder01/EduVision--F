"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <MailCheck className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">Check your inbox</CardTitle>
            <CardDescription className="mt-2">
              We've sent a verification link to your email address. Please click the link to continue the registration process.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-gray-500">
            <p>Once verified, you can close that tab and return here if needed.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
