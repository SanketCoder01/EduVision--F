"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronRight, 
  Users, 
  BookOpen, 
  Award, 
  Globe, 
  ArrowRight,
  GraduationCap,
  Building2,
  Star,
  Shield,
  Brain,
  Database,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Target,
  Rocket,
  CheckCircle,
  Play,
  Bell,
  TrendingUp,
  Users2,
  BookMarked,
  Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Global education platform images
const platformImages = [
  {
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    title: "AI-Powered Learning",
    description: "Revolutionary educational technology for the digital age"
  },
  {
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    title: "Global University Network",
    description: "Connecting institutions worldwide through technology"
  },
  {
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    title: "Student Success Stories",
    description: "Empowering the next generation of innovators"
  },
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    title: "Digital Campus Experience",
    description: "Modern learning environments for tomorrow's leaders"
  }
]

// Sliding notifications for announcements
const notifications = [
  "🚀 New AI-powered assignment assistance now available for all students!",
  "🎓 Over 10,000+ students successfully using EduVision platform globally",
  "📚 Enhanced study materials and digital library access launched",
  "🔬 Advanced research collaboration tools now integrated",
  "🌟 Real-time plagiarism detection helping maintain academic integrity"
]

// Global impact statistics
const globalStats = [
  {
    number: "50,000+",
    label: "Active Students",
    icon: <Users2 className="h-8 w-8" />,
    description: "Students worldwide using our platform"
  },
  {
    number: "500+",
    label: "Partner Universities",
    icon: <Building2 className="h-8 w-8" />,
    description: "Educational institutions globally"
  },
  {
    number: "95%",
    label: "Success Rate",
    icon: <TrendingUp className="h-8 w-8" />,
    description: "Student satisfaction and achievement"
  },
  {
    number: "24/7",
    label: "AI Support",
    icon: <Brain className="h-8 w-8" />,
    description: "Round-the-clock intelligent assistance"
  }
]

// Core platform features for global universities
const coreFeatures = [
  {
    id: "ai-assistance",
    name: "AI-Powered Learning Assistant",
    shortName: "AI Assistant",
    icon: <Brain className="h-8 w-8" />,
    color: "from-blue-500 to-blue-600",
    description: "Advanced AI technology that provides personalized learning experiences, instant doubt resolution, and intelligent study recommendations.",
    features: ["Personalized Learning", "Instant Doubt Resolution", "Smart Recommendations", "24/7 Availability"]
  },
  {
    id: "digital-campus",
    name: "Complete Digital Campus",
    shortName: "Digital Campus", 
    icon: <Globe className="h-8 w-8" />,
    color: "from-green-500 to-green-600",
    description: "Comprehensive digital infrastructure covering all university operations from admissions to graduation.",
    features: ["Virtual Classrooms", "Digital Library", "Online Assessments", "Campus Services"]
  },
  {
    id: "analytics",
    name: "Advanced Analytics & Insights",
    shortName: "Analytics",
    icon: <TrendingUp className="h-8 w-8" />,
    color: "from-purple-500 to-purple-600", 
    description: "Data-driven insights for students, faculty, and administrators to optimize learning outcomes and institutional performance.",
    features: ["Performance Analytics", "Predictive Insights", "Custom Reports", "Real-time Dashboards"]
  },
  {
    id: "collaboration",
    name: "Global Collaboration Tools",
    shortName: "Collaboration",
    icon: <Users2 className="h-8 w-8" />,
    color: "from-orange-500 to-orange-600",
    description: "Connect students and faculty worldwide through advanced collaboration tools and international exchange programs.",
    features: ["Global Networking", "Research Collaboration", "Virtual Exchange", "Cross-Cultural Learning"]
  }
]

// Platform advantages for universities
const platformAdvantages = [
  {
    title: "AI-Powered Education",
    description: "Revolutionary artificial intelligence that personalizes learning, provides instant feedback, and enhances academic outcomes for every student.",
    icon: <Brain className="h-6 w-6" />,
    color: "bg-blue-100 text-blue-700"
  },
  {
    title: "Complete Digital Ecosystem", 
    description: "End-to-end university management system covering academics, administration, student services, and campus operations.",
    icon: <Globe className="h-6 w-6" />,
    color: "bg-green-100 text-green-700"
  },
  {
    title: "Real-time Analytics",
    description: "Advanced data analytics providing actionable insights for improved decision-making and enhanced educational outcomes.",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "bg-purple-100 text-purple-700"
  },
  {
    title: "Global Connectivity",
    description: "Connect with universities worldwide, enabling international collaboration, research partnerships, and student exchange programs.",
    icon: <Users2 className="h-6 w-6" />,
    color: "bg-orange-100 text-orange-700"
  },
  {
    title: "Security & Compliance",
    description: "Enterprise-grade security with comprehensive data protection, privacy compliance, and secure authentication systems.",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-red-100 text-red-700"
  },
  {
    title: "24/7 Support System",
    description: "Round-the-clock technical support, AI-powered help desk, and comprehensive training resources for seamless operations.",
    icon: <Zap className="h-6 w-6" />,
    color: "bg-yellow-100 text-yellow-700"
  }
]

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0)

  // Auto-slide platform images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % platformImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Auto-slide notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotificationIndex((prev) => (prev + 1) % notifications.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Sliding Notifications Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            key={currentNotificationIndex}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5 }}
            className="text-center text-sm font-medium"
          >
            {notifications[currentNotificationIndex]}
          </motion.div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EduVision</h1>
                <p className="text-sm text-gray-600">Global University Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Student Login */}
              <Link href="/login?type=student">
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Users className="h-4 w-4 mr-2" />
                  Student Login
                </Button>
              </Link>
              
              {/* Faculty Login */}
              <Link href="/login?type=faculty">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Faculty Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Sliding Images */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                🚀 Transforming Global Education
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                EduVision
                <span className="block text-blue-200 text-4xl lg:text-5xl">Global University Platform</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                Revolutionizing higher education worldwide with AI-powered learning, 
                comprehensive digital infrastructure, and seamless university management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-white/5">
                  Learn More
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
            
            {/* Sliding Platform Images */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={platformImages[currentImageIndex].url}
                    alt={platformImages[currentImageIndex].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                    <div className="text-white p-8">
                      <h3 className="text-3xl font-bold mb-3">{platformImages[currentImageIndex].title}</h3>
                      <p className="text-blue-100 text-lg">{platformImages[currentImageIndex].description}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Image indicators */}
              <div className="absolute bottom-6 right-6 flex space-x-3">
                {platformImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Impact Statistics */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Global Impact
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Transforming Education Worldwide
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of universities and millions of students already experiencing the future of education
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {globalStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader className="pb-2">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white/20 to-white/30 flex items-center justify-center text-white">
                      {stat.icon}
                    </div>
                    <CardTitle className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.number}</CardTitle>
                    <Badge variant="outline" className="text-sm border-white/30 text-white">{stat.label}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-100 text-sm">{stat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700">
              Platform Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Digital University Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Everything your university needs in one powerful, integrated platform
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg leading-tight">{feature.name}</CardTitle>
                    <Badge variant="outline">{feature.shortName}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                    <div className="space-y-2">
                      {feature.features.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full group-hover:bg-blue-50 hover:bg-blue-100 transition-colors"
                        onClick={() => {
                          // Enable functionality for Learn More buttons
                          alert(`Learn more about ${feature.name}: ${feature.description}`)
                        }}
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Advantages Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700">
              Why Choose EduVision
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Your Gateway to <span className="text-blue-600">Educational Excellence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Experience the future of education with our comprehensive, AI-powered digital platform
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformAdvantages.map((advantage, index) => (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl ${advantage.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {advantage.icon}
                    </div>
                    <CardTitle className="text-xl mb-2">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 mb-6">
              🎯 Transform Your Institution Today
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
              Ready to Revolutionize Education?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Join 500+ universities and 50,000+ students worldwide already experiencing the future of digital education
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Link href="/login?type=student">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl px-8 py-4 text-lg"
                >
                  <Rocket className="mr-3 h-6 w-6" />
                  Start Your Journey
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 bg-white/5 px-8 py-4 text-lg"
              >
                <Lightbulb className="mr-3 h-6 w-6" />
                Learn More
              </Button>
            </div>
            <div className="pt-8 flex items-center justify-center space-x-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Free Trial Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>No Setup Fees</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold">EduVision</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transforming global education through innovative AI-powered technology and comprehensive digital solutions.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />AI Learning Assistant</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Digital Campus</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Analytics Dashboard</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Global Collaboration</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Solutions</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />University Management</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Student Services</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Faculty Tools</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Research Platform</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Support & Purchase</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Buy EduVision</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Pricing Plans</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Contact Support</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors flex items-center"><ChevronRight className="h-3 w-3 mr-2" />Training Resources</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400">&copy; 2024 EduVision Global Platform. All rights reserved.</p>
              <div className="flex space-x-6 text-gray-400 text-sm">
                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-white transition-colors">Security</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
