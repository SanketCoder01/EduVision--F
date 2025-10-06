"use client"

import { motion } from "framer-motion";
import { Award, Users, BookOpen, Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - White with Black Text */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/SU_2.jpg" alt="Logo" width={40} height={40} className="rounded-lg border p-0.5" />
              <span className="font-bold text-gray-900">SANJIVANI UNIVERSITY</span>
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-orange-600">← Back to Home</Link>
          </div>
        </div>
      </header>

      {/* Hero - No bright colors */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-16 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">About Sanjivani</h1>
            <p className="text-xl text-gray-600">30+ Years of Academic Excellence</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Legacy</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Sanjivani Group of Institutes, established in 1983, is a premier educational institution in Kopargaon, Maharashtra. 
                With over 30 years of excellence, we have consistently produced industry-ready professionals.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Our institutes include College of Engineering, Pharmacy College, and Polytechnic, offering diverse programs 
                accredited by NAAC A+ and NBA.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We are committed to providing world-class education, fostering innovation, and developing leaders who can make a difference in society.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
              <Image src="/images/IMG-20251004-WA0055.jpg" alt="Campus" fill className="object-cover" />
            </motion.div>
          </div>

          {/* Stats - Professional Look */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <Award className="w-10 h-10" />, title: "NAAC A+", desc: "Accredited" },
              { icon: <Users className="w-10 h-10" />, title: "10000+", desc: "Alumni Network" },
              { icon: <BookOpen className="w-10 h-10" />, title: "100+", desc: "Expert Faculty" },
              { icon: <Building className="w-10 h-10" />, title: "3", desc: "Institutes" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                className="bg-white border-2 border-gray-200 p-8 rounded-xl text-center"
              >
                <div className="flex justify-center mb-4 text-orange-600">{item.icon}</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="bg-white p-8 rounded-xl shadow-md border-l-4 border-orange-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide quality technical education that empowers students with knowledge, skills, and values necessary to excel in their chosen fields and contribute meaningfully to society.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }} className="bg-white p-8 rounded-xl shadow-md border-l-4 border-blue-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be a leading center of excellence in technical education, research, and innovation, recognized globally for producing competent professionals and entrepreneurs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
