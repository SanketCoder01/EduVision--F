"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    const password = formData.newPassword
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }, [formData.newPassword])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login?type=student")
      return
    }
    setUser(user)
  }

  const handleUpdatePassword = async () => {
    // Validation
    if (!formData.currentPassword) {
      toast({ title: "Error", description: "Please enter your current password", variant: "destructive" })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" })
      return
    }

    const allStrengthChecks = Object.values(passwordStrength).every(v => v)
    if (!allStrengthChecks) {
      toast({ title: "Error", description: "Password does not meet all requirements", variant: "destructive" })
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      toast({ title: "Error", description: "New password must be different from current password", variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }

      toast({
        title: "Success!",
        description: "Password updated successfully. Please login with your new password.",
      })

      // Sign out and redirect to login
      await supabase.auth.signOut()
      router.push("/login?type=student")

    } catch (error) {
      console.error("Password update error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStrengthPercentage = () => {
    const checks = Object.values(passwordStrength)
    return (checks.filter(Boolean).length / checks.length) * 100
  }

  const getStrengthColor = () => {
    const percentage = getStrengthPercentage()
    if (percentage < 40) return "bg-red-500"
    if (percentage < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Update Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${getStrengthPercentage()}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {[
                        { key: "hasMinLength", label: "8+ characters" },
                        { key: "hasUppercase", label: "Uppercase" },
                        { key: "hasLowercase", label: "Lowercase" },
                        { key: "hasNumber", label: "Number" },
                        { key: "hasSpecial", label: "Special char" }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1">
                          {passwordStrength[key as keyof typeof passwordStrength] ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-gray-400" />
                          )}
                          <span className={passwordStrength[key as keyof typeof passwordStrength] ? "text-green-600" : "text-gray-500"}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Update Button */}
              <Button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                After updating, you will need to login again with your new password.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
