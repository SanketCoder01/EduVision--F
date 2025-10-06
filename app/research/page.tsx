"use client"

import { motion } from "framer-motion";
import { FlaskConical, FileText, Users, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/images/SU_2.jpg" alt="Logo" width={40} height={40} className="bg-white rounded-lg p-1" />
            <span className="text-lg font-bold">SANJIVANI UNIVERSITY</span>
          </Link>
          <Link href="/"><span className="text-sm hover:underline">← Back to Home</span></Link>
        </div>
      </header>

      <section className="relative h-[250px] bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/IMG-20251004-WA0052.jpg" alt="Research" fill className="object-cover" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Research & Innovation</h1>
            <p className="text-lg">Advancing knowledge and technology</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Research Focus Areas</h2>
              <ul className="space-y-3">
                {[
                  "Artificial Intelligence & Machine Learning",
                  "IoT and Embedded Systems",
                  "Renewable Energy Solutions",
                  "Pharmaceutical Research",
                  "Civil Engineering Innovations",
                  "Mechanical System Design"
                ].map((area, i) => (
                  <li key={i} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[350px]">
              <Image src="/images/IMG-20251004-WA0053.jpg" alt="Lab" fill className="object-cover rounded-xl" />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <FileText className="w-8 h-8" />, title: "500+", desc: "Publications", color: "from-blue-500 to-blue-600" },
              { icon: <FlaskConical className="w-8 h-8" />, title: "50+", desc: "Research Projects", color: "from-purple-500 to-purple-600" },
              { icon: <Users className="w-8 h-8" />, title: "30+", desc: "Ph.D Scholars", color: "from-green-500 to-green-600" },
              { icon: <Award className="w-8 h-8" />, title: "20+", desc: "Patents Filed", color: "from-orange-500 to-orange-600" }
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-to-br ${item.color} text-white p-6 rounded-xl text-center`}>
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

