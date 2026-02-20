"use client"

import { motion } from "framer-motion";
import { Briefcase, TrendingUp, Users, Award, MapPin, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Company logos data
const companies = [
  { name: "TCS", logo: "https://logo.clearbit.com/tcs.com" },
  { name: "Infosys", logo: "https://logo.clearbit.com/infosys.com" },
  { name: "Wipro", logo: "https://logo.clearbit.com/wipro.com" },
  { name: "Accenture", logo: "https://logo.clearbit.com/accenture.com" },
  { name: "Cognizant", logo: "https://logo.clearbit.com/cognizant.com" },
  { name: "Tech Mahindra", logo: "https://logo.clearbit.com/techmahindra.com" },
  { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com" },
  { name: "Google", logo: "https://logo.clearbit.com/google.com" },
  { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com" },
  { name: "IBM", logo: "https://logo.clearbit.com/ibm.com" },
];

// Duplicate for seamless loop
const duplicatedCompanies = [...companies, ...companies];

// Student placement data
const placedStudents = [
  {
    image: "https://i.pravatar.cc/300?img=8",
    title: "Rahul Sharma",
    subtitle: "Software Engineer",
    handle: "TCS",
    location: "Pune",
    package: "6.5 LPA",
    borderColor: "#4F46E5",
    gradient: "linear-gradient(145deg, #4F46E5, #1e1b4b)",
  },
  {
    image: "https://i.pravatar.cc/300?img=11",
    title: "Priya Deshmukh",
    subtitle: "Full Stack Developer",
    handle: "Infosys",
    location: "Bangalore",
    package: "7.2 LPA",
    borderColor: "#10B981",
    gradient: "linear-gradient(210deg, #10B981, #064e3b)",
  },
  {
    image: "https://i.pravatar.cc/300?img=3",
    title: "Amit Patel",
    subtitle: "DevOps Engineer",
    handle: "Wipro",
    location: "Mumbai",
    package: "8.0 LPA",
    borderColor: "#F59E0B",
    gradient: "linear-gradient(165deg, #F59E0B, #78350f)",
  },
  {
    image: "https://i.pravatar.cc/300?img=16",
    title: "Sneha Kulkarni",
    subtitle: "Data Analyst",
    handle: "Accenture",
    location: "Hyderabad",
    package: "6.8 LPA",
    borderColor: "#EF4444",
    gradient: "linear-gradient(195deg, #EF4444, #7f1d1d)",
  },
  {
    image: "https://i.pravatar.cc/300?img=25",
    title: "Vikram Singh",
    subtitle: "Cloud Engineer",
    handle: "Tech Mahindra",
    location: "Delhi",
    package: "7.5 LPA",
    borderColor: "#8B5CF6",
    gradient: "linear-gradient(225deg, #8B5CF6, #4c1d95)",
  },
  {
    image: "https://i.pravatar.cc/300?img=60",
    title: "Anjali Reddy",
    subtitle: "Frontend Developer",
    handle: "Cognizant",
    location: "Chennai",
    package: "6.0 LPA",
    borderColor: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4, #164e63)",
  },
];

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
          {/* Floating Company Logos */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Recruiting Partners</h2>
            <div className="relative overflow-hidden py-8">
              <div className="flex animate-scroll-rtl">
                {duplicatedCompanies.map((company, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 mx-4 w-[200px] h-[100px] bg-white rounded-lg border-2 border-black shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center p-4"
                  >
                    <div className="w-16 h-16 relative mb-2">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${company.name}&size=64&background=random`;
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">{company.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Placed Students Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Success Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
              {placedStudents.map((student, i) => (
                <article
                  key={i}
                  className="relative flex flex-col w-full h-auto rounded-2xl overflow-hidden border-2 shadow-lg"
                  style={{
                    borderColor: student.borderColor,
                    background: student.gradient,
                  }}
                >
                  <div className="relative z-10 flex-1 p-3">
                    <img
                      src={student.image}
                      alt={student.title}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>
                  <footer className="relative z-10 p-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{student.title}</h3>
                    <p className="text-sm text-gray-200 mb-2">{student.subtitle}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-semibold">{student.handle}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{student.location}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <span className="text-lg font-bold">{student.package}</span>
                      <span className="text-sm text-gray-200 ml-1">Package</span>
                    </div>
                  </footer>
                </article>
              ))}
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

      <style jsx>{`
        @keyframes scroll-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-rtl {
          animation: scroll-rtl 30s linear infinite;
        }
        .animate-scroll-rtl:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

