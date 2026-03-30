"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ChefHat, Eye, EyeOff, LogIn, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CafeteriaLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: "Please enter email and password", variant: "destructive" })
      return
    }

    if (!email.trim().toLowerCase().endsWith('@cafe.in')) {
      toast({ 
        title: "Access Denied", 
        description: "Only @cafe.in email addresses are authorized for this portal.", 
        variant: "destructive" 
      })
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Check if the user is a cafeteria owner
      const { data: owner, error: ownerErr } = await supabase
        .from('cafeteria_owners')
        .select('id')
        .eq('auth_id', data.user.id)
        .maybeSingle()

      if (ownerErr) throw ownerErr

      if (!owner) {
        // First time - they're new, go to dashboard to register
        toast({ title: "Welcome!", description: "Please complete your cafeteria registration." })
      } else {
        toast({ title: "Welcome back!", description: "Loading your cafeteria dashboard..." })
      }
      router.push('/cafeteria-dashboard')
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message || "Invalid credentials", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to home */}
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Cafeteria Owner Portal</h1>
            <p className="text-orange-100 text-sm mt-1">Login to manage your cafeteria</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2.5 rounded-xl"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-xs text-orange-700 font-medium">🍽️ New Cafeteria Owner?</p>
              <p className="text-xs text-orange-600 mt-1">Contact the campus administration to get your login credentials. Once you have your email & password, login here and complete your cafeteria registration.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
