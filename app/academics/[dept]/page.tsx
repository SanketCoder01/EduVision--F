"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { User, Award, BookOpen, TrendingUp, History } from "lucide-react";

const departmentData: any = {
  cse: {
    name: "Computer Science and Engineering",
    dept: "SET",
    hod: {
      name: "Dr. Mahendra Gawali",
      post: "Professor & HOD",
      degree: "Ph.D in Computer Science",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
    },
    faculty: [
      { name: "Prof. Anil Sharma", post: "Associate Professor", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" },
      { name: "Dr. Priya Gupta", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop" },
      { name: "Prof. Rajesh Kumar", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop" },
      { name: "Dr. Sneha Patil", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" }
    ]
  },
  cyber: {
    name: "Cyber Security",
    dept: "SET",
    hod: {
      name: "Dr. Rajesh Singh",
      post: "Professor & HOD",
      degree: "Ph.D in Cyber Security",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
    },
    faculty: [
      { name: "Prof. Neha Desai", post: "Associate Professor", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop" },
      { name: "Dr. Karan Mehta", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" },
      { name: "Prof. Anita Shah", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop" }
    ]
  },
  aids: {
    name: "Artificial Intelligence and Data Science",
    dept: "SET",
    hod: {
      name: "Dr. Kavita Patel",
      post: "Professor & HOD",
      degree: "Ph.D in Data Science",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop"
    },
    faculty: [
      { name: "Prof. Rahul Verma", post: "Associate Professor", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" },
      { name: "Dr. Sneha Joshi", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop" },
      { name: "Prof. Amit Kumar", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" }
    ]
  },
  aiml: {
    name: "AIML",
    dept: "SET",
    hod: {
      name: "Dr. Amit Kumar",
      post: "Professor & HOD",
      degree: "Ph.D in Machine Learning",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
    },
    faculty: [
      { name: "Prof. Deepika Singh", post: "Associate Professor", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop" },
      { name: "Dr. Rohit Sharma", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" }
    ]
  },
  mba: {
    name: "MBA",
    dept: "SCM",
    hod: {
      name: "Dr. Suresh Kulkarni",
      post: "Professor & HOD",
      degree: "Ph.D in Management",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
    },
    faculty: [
      { name: "Prof. Pooja Deshmukh", post: "Associate Professor", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop" },
      { name: "Dr. Vikas Patil", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" }
    ]
  },
  bba: {
    name: "BBA",
    dept: "SCM",
    hod: {
      name: "Dr. Anjali Shinde",
      post: "Professor & HOD",
      degree: "Ph.D in Business Administration",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop"
    },
    faculty: [
      { name: "Prof. Ramesh Jadhav", post: "Associate Professor", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop" },
      { name: "Dr. Priyanka More", post: "Assistant Professor", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" }
    ]
  }
};

export default function DepartmentPage({ params }: { params: { dept: string } }) {
  const data = departmentData[params.dept];
  if (!data) return <div>Department not found</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/SU_2.jpg" alt="Logo" width={40} height={40} className="rounded-lg border p-0.5" />
              <span className="font-bold text-gray-900">SANJIVANI UNIVERSITY</span>
            </Link>
            <Link href="/academics" className="text-sm text-gray-600 hover:text-orange-600">← Back to Academics</Link>
          </div>
        </div>
      </header>

      {/* Department Header */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block bg-orange-100 px-4 py-1 rounded-full text-orange-700 font-semibold mb-3 text-sm">{data.dept}</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.name}</h1>
            <p className="text-gray-600">Sanjivani Group of Institutes</p>
          </motion.div>
        </div>
      </section>

      {/* HOD Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Head of Department</h2>
            <div className="flex justify-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.4, type: "spring" }} className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-orange-500 shadow-xl">
                  <Image src={data.hod.image} alt={data.hod.name} width={160} height={160} className="object-cover" />
                </div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{data.hod.name}</h3>
              <p className="text-orange-600 font-semibold mb-1">{data.hod.post}</p>
              <p className="text-gray-600">{data.hod.degree}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Faculty Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Faculty Members</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {data.faculty.map((member: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md p-6 text-center border-2 border-gray-100 hover:border-orange-500 transition-all"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 mx-auto mb-4">
                  <Image src={member.image} alt={member.name} width={128} height={128} className="object-cover" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.post}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              {[
                { icon: <BookOpen className="w-5 h-5" />, label: "Syllabus" },
                { icon: <Award className="w-5 h-5" />, label: "Achievements" },
                { icon: <TrendingUp className="w-5 h-5" />, label: "Placements" },
                { icon: <History className="w-5 h-5" />, label: "History" }
              ].map((tab, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all text-gray-700 hover:text-orange-600 font-medium"
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Syllabus */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-orange-600" />
                Syllabus Overview
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-bold text-lg mb-3">Core Subjects</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Data Structures & Algorithms</li>
                    <li>• Database Management Systems</li>
                    <li>• Operating Systems</li>
                    <li>• Computer Networks</li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-bold text-lg mb-3">Elective Subjects</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Machine Learning</li>
                    <li>• Cloud Computing</li>
                    <li>• Big Data Analytics</li>
                    <li>• IoT Applications</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-orange-600" />
                Department Achievements
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Research Papers", value: "50+", desc: "Published in reputed journals" },
                  { title: "Patents", value: "10+", desc: "Filed and granted" },
                  { title: "Awards", value: "25+", desc: "National & International" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg text-center shadow-md">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{item.value}</div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Placements */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-orange-600" />
                Placement Statistics
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { label: "Placement Rate", value: "95%" },
                  { label: "Highest Package", value: "12 LPA" },
                  { label: "Average Package", value: "6 LPA" },
                  { label: "Companies Visited", value: "50+" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg text-center shadow-md">
                    <div className="text-2xl font-bold text-green-600 mb-2">{stat.value}</div>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* History */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <History className="w-6 h-6 mr-3 text-orange-600" />
                Department History
              </h3>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-gray-600 leading-relaxed mb-4">
                  The {data.name} department was established with a vision to provide quality technical education and produce industry-ready professionals.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Over the years, the department has grown significantly, with state-of-the-art laboratories, experienced faculty, and strong industry connections.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our students have consistently excelled in academics, research, and placements, making the department one of the most sought-after in the region.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

