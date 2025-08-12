"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Users, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

import { useRouter } from "next/navigation";

export default function App() {
  const router = useRouter();

  const handleStudentLogin = () => {
    router.push("/login?type=student");
  };

  const handleFacultyLogin = () => {
    router.push("/login?type=faculty");
  };



  const LandingPage = () => (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* Background with gradient and geometric shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Animated geometric decorations */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-xl"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute top-40 right-20 w-24 h-24 bg-blue-100 rounded-full blur-lg"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="absolute bottom-32 left-16 w-40 h-40 bg-blue-100 rounded-full blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="absolute bottom-20 right-32 w-28 h-28 bg-blue-100 rounded-full blur-xl"
        ></motion.div>
        
        {/* Grid pattern overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.4) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        ></motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md w-full">
          {/* Logo and branding section */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Icon container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <GraduationCap className="w-10 h-10 text-white" />
            </motion.div>
            
            {/* Title */}
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-5xl md:text-6xl tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"
              >
                EduVision
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-muted-foreground text-lg"
              >
                Your Gateway to Educational Excellence
              </motion.p>
            </div>
          </motion.div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="text-xl text-center text-foreground mb-6"
                  >
                    Choose Your Portal
                  </motion.h2>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <Button 
                      onClick={handleStudentLogin}
                      className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all duration-300 hover:scale-105"
                      size="lg"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Student Login
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                  >
                    <Button 
                      onClick={handleFacultyLogin}
                      variant="outline"
                      className="w-full h-14 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 transition-all duration-300 hover:scale-105"
                      size="lg"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Faculty Login
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>



          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-sm text-muted-foreground mt-8"
          >
            Empowering education through technology
          </motion.p>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none"
      ></motion.div>
    </motion.div>
  );

  return <LandingPage />;
}
