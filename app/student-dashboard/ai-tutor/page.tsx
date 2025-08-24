"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Code, 
  Database, 
  Network, 
  Calculator,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const subjects = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Arrays, Trees, Graphs, Sorting, Searching, Dynamic Programming',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    description: 'SQL, Normalization, Transactions, Indexing, Query Optimization',
    icon: Database,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    description: 'OSI Model, TCP/IP, Routing, Network Security, Protocols',
    icon: Network,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    id: 'os',
    name: 'Operating Systems',
    description: 'Process Management, Memory, File Systems, Synchronization',
    icon: Brain,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  {
    id: 'math',
    name: 'Mathematics & Statistics',
    description: 'Calculus, Linear Algebra, Probability, Discrete Mathematics',
    icon: Calculator,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700'
  }
];

export default function AITutorPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const router = useRouter();

  const handleSubjectSelect = (subjectId: string) => {
    router.push(`/student-dashboard/ai-tutor/chat?subject=${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Tutor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant help with your studies! Choose a subject and ask any question - from theory to problem solving.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-500">Powered by Advanced AI • OCR Support • 24/7 Available</span>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
        </motion.div>

        {/* Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full cursor-pointer group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${subject.color}`} />
                <CardHeader className={`${subject.bgColor} transition-colors duration-300`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <subject.icon className={`h-6 w-6 ${subject.textColor}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${subject.textColor} group-hover:text-opacity-80 transition-colors`}>
                        {subject.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                    {subject.description}
                  </CardDescription>
                  <Button 
                    onClick={() => handleSubjectSelect(subject.id)}
                    className={`w-full bg-gradient-to-r ${subject.color} hover:opacity-90 transition-all duration-300 group-hover:shadow-lg`}
                  >
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-8">What makes our AI Tutor special?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Simple Explanations</h3>
              <p className="text-gray-600 text-sm">Complex concepts explained in easy-to-understand language</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Image Recognition</h3>
              <p className="text-gray-600 text-sm">Upload photos of problems and get instant solutions</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">24/7 Available</h3>
              <p className="text-gray-600 text-sm">Get help anytime, anywhere with instant responses</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
