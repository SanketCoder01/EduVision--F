"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ChevronRight } from "lucide-react";

export default function AcademicsPage() {
  const programs = [
    { id: "cse", name: "Computer Science and Engineering", dept: "SET", image: "/images/IMG-20251004-WA0053.jpg" },
    { id: "cyber", name: "Cyber Security", dept: "SET", image: "/images/IMG-20251004-WA0054.jpg" },
    { id: "aids", name: "Artificial Intelligence and Data Science", dept: "SET", image: "/images/IMG-20251004-WA0056.jpg" },
    { id: "aiml", name: "AIML", dept: "SET", image: "/images/IMG-20251004-WA0057.jpg" },
    { id: "mba", name: "MBA", dept: "SCM", image: "/images/IMG-20251004-WA0058.jpg" },
    { id: "bba", name: "BBA", dept: "SCM", image: "/images/IMG-20251004-WA0059.jpg" }
  ];

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

      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Academic Programs</h1>
            <p className="text-gray-600 text-lg">Choose your path to excellence</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program, i) => (
              <Link key={i} href={`/academics/${program.id}`}>
                <motion.div whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }} className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border-2 border-gray-100 hover:border-orange-500 transition-all">
                  <div className="relative h-52">
                    <Image src={program.image} alt={program.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-800">{program.dept}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{program.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">Department: {program.dept}</p>
                    <div className="flex items-center text-orange-600 font-semibold">
                      <span className="text-sm">View Details</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Sanjivani?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: "Expert Faculty", desc: "100+ qualified professors" },
              { title: "Modern Labs", desc: "State-of-the-art facilities" },
              { title: "Industry Tie-ups", desc: "50+ partner companies" },
              { title: "NAAC A+", desc: "Top accreditation" }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-xl text-center border-2 border-gray-100">
                <div className="flex justify-center mb-4"><GraduationCap className="w-12 h-12 text-orange-600" /></div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
