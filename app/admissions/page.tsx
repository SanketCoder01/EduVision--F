"use client"

import { motion } from "framer-motion";
import { FileText, Calendar, CheckCircle, Phone, MapPin, Mail, Award, Users, BookOpen, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdmissionsPage() {
  return (
    <div className="min-h-screen bg-white">
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

      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-16 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Admissions 2025-26</h1>
            <p className="text-xl text-gray-600">Start your journey with us</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Admission Process</h2>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Online Application", desc: "Fill the application form online" },
                  { step: "2", title: "Document Verification", desc: "Submit required documents" },
                  { step: "3", title: "Entrance Test", desc: "Appear for MHT-CET/JEE" },
                  { step: "4", title: "Counseling", desc: "Attend counseling session" },
                  { step: "5", title: "Fee Payment", desc: "Pay admission fees" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                    className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500"
                  >
                    <div className="bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">{item.step}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative h-[500px] rounded-xl overflow-hidden shadow-xl">
              <Image src="/images/IMG-20251004-WA0051.jpg" alt="Students" fill className="object-cover" />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: <FileText className="w-10 h-10" />, title: "Easy Application" },
              { icon: <Calendar className="w-10 h-10" />, title: "Flexible Dates" },
              { icon: <CheckCircle className="w-10 h-10" />, title: "Quick Process" },
              { icon: <Phone className="w-10 h-10" />, title: "24/7 Support" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white border-2 border-gray-200 p-6 rounded-xl text-center"
              >
                <div className="flex justify-center mb-3 text-orange-600">{item.icon}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
              </motion.div>
            ))}
          </div>

          {/* Professional Tab - Placements & Activities */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Why Choose Sanjivani University?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Placement Highlights */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-6">
                  <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Placements</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Award className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">95%+ Placement Rate</p>
                      <p className="text-sm text-gray-600">Consistent placement success across all departments</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Award className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Top Recruiters</p>
                      <p className="text-sm text-gray-600">TCS, Infosys, Wipro, Accenture, Microsoft, Google & more</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Award className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">12 LPA Highest Package</p>
                      <p className="text-sm text-gray-600">6.5 LPA average package in 2024-25</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Campus Activities */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-6">
                  <Users className="w-8 h-8 text-orange-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Activities & Programs</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <BookOpen className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Industry Workshops</p>
                      <p className="text-sm text-gray-600">Regular workshops with industry experts</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <BookOpen className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Hackathons & Competitions</p>
                      <p className="text-sm text-gray-600">National and international coding competitions</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <BookOpen className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Technical & Cultural Fests</p>
                      <p className="text-sm text-gray-600">Annual events showcasing student talents</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact & Apply Online Section */}
          <div className="bg-gray-900 text-white p-10 rounded-2xl shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <Phone className="w-6 h-6 mr-3" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-orange-400" />
                    <div>
                      <p className="font-semibold">Address</p>
                      <p className="text-gray-300 text-sm">Sanjivani University, Kopargaon, Maharashtra 423603</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-orange-400" />
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p className="text-gray-300 text-sm">+91 2423-271700 / 271800</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-orange-400" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-300 text-sm">admissions@sanjivani.edu.in</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Online */}
              <div className="flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Begin Your Journey?</h3>
                <p className="text-gray-300 mb-6">Join thousands of successful students at Sanjivani University</p>
                <Link href="/student-registration">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <FileText className="w-6 h-6 mr-2" />
                    Apply Online Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
