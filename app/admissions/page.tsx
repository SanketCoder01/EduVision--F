"use client"

import { motion } from "framer-motion";
import { FileText, Calendar, CheckCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

          <div className="grid md:grid-cols-4 gap-6">
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
        </div>
      </section>
    </div>
  );
}
