"use client"

import { Button } from '@/components/ui/button'
import { GraduationCap, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { ImageWithFallback } from '@/components/figma/ImageWithFallback'

import { useRouter } from "next/navigation";

export default function App() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };



  const LandingPage = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-white"
    >
      {/* Minimal background */}
      <div className="absolute inset-0 bg-white" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top university branding */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full pt-4 flex flex-col items-center gap-2"
        >
          <div className="h-8 sm:h-10">
            <ImageWithFallback src="/images/logo.png" alt="Sanjivani University" className="h-8 sm:h-10 w-auto object-contain" />
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground">Sanjivani University</span>
        </motion.div>

        {/* Center block */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-5 max-w-md w-full">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <GraduationCap className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            >
              EduVision
            </motion.h1>

            {/* Welcome subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl text-muted-foreground"
            >
              Welcome to EduVision
            </motion.p>
          </div>
        </div>
      </div>

      {/* Sticky bottom Login CTA */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
        className="fixed inset-x-0 bottom-0 z-20 p-4 pb-[calc(env(safe-area-inset-bottom)+12px)] bg-white/95 border-t"
      >
        <Button
          onClick={handleGetStarted}
          className="w-full h-14 text-base sm:text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
          size="lg"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>

    </motion.div>
  );

  return <LandingPage />;
}
