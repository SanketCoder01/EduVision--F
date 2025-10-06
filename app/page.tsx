"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Award, BookOpen, GraduationCap, MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function SanjivaniLandingPage() {
  const [showIntro, setShowIntro] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowIntro(true);
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('hasSeenIntro', 'true');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!showIntro) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === campusImages.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showIntro]);

  const campusImages = [
    { src: "/images/IMG-20251004-WA0047.jpg", title: "Modern Classrooms" },
    { src: "/images/IMG-20251004-WA0048.jpg", title: "University Auditorium" },
    { src: "/images/IMG-20251004-WA0049.jpg", title: "Sanjivani University Main Gate" },
    { src: "/images/IMG-20251004-WA0050.jpg", title: "Students at Campus" },
    { src: "/images/IMG-20251004-WA0051.jpg", title: "Campus Cafeteria" },
    { src: "/images/IMG-20251004-WA0052.jpg", title: "Sports & Recreation Facilities" },
    { src: "/images/IMG-20251004-WA0053.jpg", title: "Diploma Building" },
    { src: "/images/IMG-20251004-WA0054.jpg", title: "Administrative Building" }
  ];

  const [achievementScroll, setAchievementScroll] = useState(0);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setAchievementScroll((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(scrollInterval);
  }, []);

  const achievements = [
    { 
      icon: <Award className="w-10 h-10" />, 
      title: "NAAC A+ Accredited", 
      value: "A+", 
      description: "Highest Grade Accreditation by NAAC", 
      image: "/images/IMG-20251004-WA0056.jpg",
      stats: "Excellence in Education Quality"
    },
    { 
      icon: <GraduationCap className="w-10 h-10" />, 
      title: "Alumni Network", 
      value: "10,000+", 
      description: "Successful Alumni Worldwide", 
      image: "/images/IMG-20251004-WA0057.jpg",
      stats: "Placed in Top MNCs"
    },
    { 
      icon: <BookOpen className="w-10 h-10" />, 
      title: "Expert Faculty", 
      value: "100+", 
      description: "Highly Qualified Professors", 
      image: "/images/IMG-20251004-WA0058.jpg",
      stats: "PhD & Industry Experience"
    },
    { 
      icon: <Award className="w-10 h-10" />, 
      title: "Research Papers", 
      value: "500+", 
      description: "Published in Reputed Journals", 
      image: "/images/IMG-20251004-WA0059.jpg",
      stats: "International Recognition"
    }
  ];

  const LogoIntro = () => (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
      <motion.div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(139, 69, 19, 0.1), rgba(220, 38, 38, 0.1), rgba(255, 255, 255, 1))" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-30" />
      </motion.div>
      <div className="text-center relative z-10 px-4">
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 100 }} className="mb-8">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <motion.div className="absolute inset-0 rounded-full border-4 border-dashed border-orange-300" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute inset-4 rounded-full overflow-hidden shadow-2xl bg-white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, duration: 1, type: "spring" }}>
              <Image src="/images/SU_2.jpg" alt="Sanjivani University Logo" width={200} height={200} className="w-full h-full object-contain p-2" priority />
            </motion.div>
            <motion.div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-20" animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }}>
          <motion.h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ background: "linear-gradient(135deg, #8B4513, #DC2626, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Welcome to</motion.h1>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 0.8 }} className="text-3xl md:text-5xl font-bold mb-6" style={{ color: "#8B4513" }}>SANJIVANI UNIVERSITY</motion.h2>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 3.5, duration: 0.8 }} className="text-2xl md:text-3xl font-semibold" style={{ background: "linear-gradient(135deg, #DC2626, #F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EduVision Portal</motion.div>
        <motion.div initial={{ width: 0 }} animate={{ width: "300px" }} transition={{ delay: 4.5, duration: 1 }} className="h-1 mx-auto mt-8" style={{ background: "linear-gradient(to right, #8B4513, #DC2626, #F97316)" }} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.5, duration: 0.8 }} className="mt-8 text-lg text-gray-600 font-medium">गति कर्मणि कौशलम्</motion.p>
      </div>
    </motion.div>
  );

  if (showIntro) {
    return <AnimatePresence><LogoIntro /></AnimatePresence>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white text-gray-900 shadow-md sticky top-0 z-50 border-b">
        <div className="bg-gray-100 py-2 border-b">
          <div className="max-w-full px-6 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center text-gray-600"><Phone className="w-3 h-3 mr-1" /> +91-2423-224004</span>
              <span className="flex items-center text-gray-600"><Mail className="w-3 h-3 mr-1" /> info@sanjivani.org.in</span>
            </div>
            <div className="flex items-center space-x-3 pr-4">
              <Button variant="outline" size="sm" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white transition-all font-semibold text-xs h-8 px-3" onClick={() => window.location.href = '/login?type=student'}>Student Login</Button>
              <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-semibold text-xs h-8 px-3" onClick={() => window.location.href = '/login?type=faculty'}>Faculty Login</Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-xs h-8 px-3" onClick={() => window.location.href = '/deanlogin'}>Dean Portal</Button>
            </div>
          </div>
        </div>

        <div className="py-2">
          <div className="max-w-full px-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                  <Image src="/images/SU_2.jpg" alt="Sanjivani" width={48} height={48} className="w-full h-full object-contain p-1" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">SANJIVANI UNIVERSITY</h1>
                  <p className="text-xs text-gray-600">Excellence in Education</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-6 pr-4">
                <Link href="/"><span className="text-sm hover:text-orange-600 transition-colors font-medium cursor-pointer">Home</span></Link>
                <Link href="/about"><span className="text-sm hover:text-orange-600 transition-colors cursor-pointer">About</span></Link>
                <Link href="/academics"><span className="text-sm hover:text-orange-600 transition-colors cursor-pointer">Academics</span></Link>
                <Link href="/admissions"><span className="text-sm hover:text-orange-600 transition-colors cursor-pointer">Admissions</span></Link>
                <Link href="/research"><span className="text-sm hover:text-orange-600 transition-colors cursor-pointer">Research</span></Link>
                <Link href="/placements"><span className="text-sm hover:text-orange-600 transition-colors cursor-pointer">Placements</span></Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Live Updates */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white py-2 overflow-hidden">
        <motion.div className="whitespace-nowrap flex" animate={{ x: [1200, -2000] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <span className="inline-flex items-center px-8 text-sm"><span className="bg-red-500 px-2 py-1 rounded-full mr-3 font-bold text-xs">LIVE</span>🔔 Admissions Open 2025-26</span>
          <span className="inline-flex items-center px-8 text-sm"><span className="bg-green-500 px-2 py-1 rounded-full mr-3 font-bold text-xs">NEW</span>📢 IoT Course Registration Open</span>
          <span className="inline-flex items-center px-8 text-sm"><span className="bg-yellow-500 px-2 py-1 rounded-full mr-3 font-bold text-xs">HOT</span>🎓 NAAC A+ Accredited</span>
        </motion.div>
      </div>

      {/* Hero - Increased Size */}
      <section className="relative h-[600px] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0">
            <div className="absolute inset-0">
              <Image src={campusImages[currentSlide].src} alt={campusImages[currentSlide].title} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
            </div>
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-white max-w-3xl">
                  <motion.div className="inline-block bg-orange-600 px-4 py-2 rounded-full mb-4" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}><span className="font-semibold text-sm">Featured Campus</span></motion.div>
                  <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{campusImages[currentSlide].title}</h2>
                  <p className="text-xl mb-8 text-gray-200">Experience world-class infrastructure and vibrant campus life. Join us in shaping future leaders.</p>
                  <div className="flex space-x-4">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg shadow-lg font-semibold text-base">Explore Campus</Button>
                    <Button variant="outline" className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-lg font-semibold text-base">Virtual Tour</Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <button onClick={() => setCurrentSlide(currentSlide === 0 ? campusImages.length - 1 : currentSlide - 1)} className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-full p-4 text-white hover:bg-white/40 z-20"><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={() => setCurrentSlide(currentSlide === campusImages.length - 1 ? 0 : currentSlide + 1)} className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md rounded-full p-4 text-white hover:bg-white/40 z-20"><ChevronRight className="w-6 h-6" /></button>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {campusImages.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`transition-all ${index === currentSlide ? 'w-10 h-3 bg-orange-600 rounded-full' : 'w-3 h-3 bg-white/50 rounded-full'}`} />
          ))}
        </div>
      </section>

      {/* About - Increased Padding */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-orange-100 inline-block px-4 py-2 rounded-full text-orange-700 font-semibold mb-4">ABOUT SANJIVANI</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Sanjivani Group of Institutes</h2>
              <p className="text-gray-600 leading-relaxed mb-4">Sanjivani Group of Institutes is located in Kopargaon, Maharashtra. Established with a vision to provide quality technical education.</p>
              <p className="text-gray-600 leading-relaxed mb-6">With NAAC A+ accreditation, we maintain the highest standards of academic excellence.</p>
              <Link href="/about"><Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg">Learn More →</Button></Link>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <Image src="/images/IMG-20251004-WA0055.jpg" alt="Campus" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Achievements - Professional Scrolling Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Institutional Excellence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Recognized for outstanding academic achievements and continuous commitment to educational excellence</p>
          </div>
          
          {/* Scrolling Achievements Carousel */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900" />
            <div className="relative z-10 p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left Side - Current Achievement */}
                <motion.div 
                  key={achievementScroll}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.8 }}
                  className="text-white"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-6">
                      {achievements[achievementScroll].icon}
                    </div>
                    <div>
                      <div className="text-6xl font-bold mb-2 text-orange-400">
                        {achievements[achievementScroll].value}
                      </div>
                      <h3 className="text-2xl font-bold">{achievements[achievementScroll].title}</h3>
                    </div>
                  </div>
                  <p className="text-xl text-gray-200 mb-4">{achievements[achievementScroll].description}</p>
                  <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full border border-orange-400/30">
                    <span className="text-orange-300 font-medium">{achievements[achievementScroll].stats}</span>
                  </div>
                </motion.div>

                {/* Right Side - Achievement Image */}
                <motion.div 
                  key={`img-${achievementScroll}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative h-80 rounded-2xl overflow-hidden"
                >
                  <Image 
                    src={achievements[achievementScroll].image} 
                    alt={achievements[achievementScroll].title} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </motion.div>
              </div>
            </div>
            
            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
              {achievements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setAchievementScroll(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === achievementScroll 
                      ? 'bg-orange-500 scale-125' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                    {achievement.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{achievement.value}</div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.stats}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map - Increased Size */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4">Visit Our Campus</h2>
            <p className="text-gray-600 text-lg">Kopargaon, Maharashtra</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.5896595524245!2d74.47562831490035!3d19.88426798657857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdcf71c4c456789%3A0x6e7c8b9a0b1c2d3e!2sSanjivani%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1635789012345!5m2!1sen!2sin" width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden"><Image src="/images/SU_2.jpg" alt="Logo" width={48} height={48} className="w-full h-full object-contain p-1" /></div>
                <div><h3 className="text-lg font-bold">SANJIVANI</h3><p className="text-xs text-gray-400">UNIVERSITY</p></div>
              </div>
              <p className="text-gray-400 text-sm">Excellence since 1983</p>
            </div>
            <div><h4 className="font-semibold mb-3">Institutes</h4><ul className="space-y-2 text-gray-400 text-sm"><li>Engineering</li><li>Pharmacy</li><li>Polytechnic</li></ul></div>
            <div><h4 className="font-semibold mb-3">Quick Links</h4><ul className="space-y-2 text-gray-400 text-sm"><li><Link href="/admissions">Admissions</Link></li><li><Link href="/placements">Placements</Link></li></ul></div>
            <div><h4 className="font-semibold mb-3">Contact</h4><div className="space-y-2 text-gray-400 text-sm"><p className="flex items-center"><Phone className="w-3 h-3 mr-2" /> +91-2423-224004</p><p className="flex items-center"><Mail className="w-3 h-3 mr-2" /> info@sanjivani.org.in</p></div></div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-sm"><p>&copy; 2025 Sanjivani University | Powered by <span className="text-orange-500 font-semibold">EduVision</span></p></div>
        </div>
      </footer>
    </div>
  );
}
