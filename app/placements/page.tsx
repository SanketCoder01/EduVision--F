"use client"

import { motion } from "framer-motion";
import { Briefcase, TrendingUp, Users, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PlacementsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/SU_2.jpg" alt="Logo" width={40} height={40} className="rounded-lg border p-0.5" />
              <span className="font-bold text-gray-900 text-base">SANJIVANI UNIVERSITY</span>
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-orange-600">← Back</Link>
          </div>
        </div>
      </header>

      <section className="relative h-[200px] bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="absolute inset-0 opacity-20"><Image src="/images/IMG-20251004-WA0051.jpg" alt="Placements" fill className="object-cover" /></div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Placements</h1>
            <p className="text-base">Building careers, shaping futures</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Placement Record</h2>
              <p className="text-gray-600 mb-4">Sanjivani has consistently maintained an excellent placement record with students being recruited by top companies across various sectors.</p>
              <ul className="space-y-3">
                {["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Tech Mahindra"].map((company, i) => (
                  <li key={i} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">{company}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[350px]">
              <Image src="/images/IMG-20251004-WA0052.jpg" alt="Placement" fill className="object-cover rounded-xl" />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <TrendingUp className="w-8 h-8" />, title: "95%+", desc: "Placement Rate", color: "from-blue-500 to-blue-600" },
              { icon: <Briefcase className="w-8 h-8" />, title: "100+", desc: "Companies", color: "from-green-500 to-green-600" },
              { icon: <Users className="w-8 h-8" />, title: "500+", desc: "Students Placed", color: "from-purple-500 to-purple-600" },
              { icon: <Award className="w-8 h-8" />, title: "12 LPA", desc: "Highest Package", color: "from-orange-500 to-orange-600" }
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

