"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Code,
  Plus,
  Eye,
  Terminal,
  Cpu,
  Zap,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Edit,
  Monitor,
  Calendar,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

export default function CompilerDashboard() {
  const router = useRouter()
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [stats, setStats] = useState({
    activeAssignments: 12,
    activeExams: 3,
    totalSubmissions: 156,
    studentsOnline: 24
  })

  useEffect(() => {
    // Load stats from localStorage or API
    const savedStats = localStorage.getItem('compilerStats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [])

  const modules = [
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'Complete coding assignments',
      icon: Code,
      color: 'from-blue-500 to-blue-600',
      count: stats.activeAssignments,
      countLabel: 'Available',
      subModules: [
        { id: 'create-assignment', title: 'Create Assignment', icon: Plus, path: '/dashboard/compiler/create' },
        { id: 'view-assignment', title: 'View Assignment', icon: Eye, path: '/dashboard/assignments/view' },
        { id: 'records', title: 'Records', icon: FileText, path: '/dashboard/assignments/records' }
      ]
    },
    {
      id: 'exams',
      title: 'Exams',
      description: 'Take proctored exams',
      icon: Terminal,
      color: 'from-red-500 to-red-600',
      count: stats.activeExams,
      countLabel: 'Available',
      subModules: [
        { id: 'create-exam', title: 'Create Exam', icon: Plus, path: '/dashboard/compiler/exam' },
        { id: 'view-exam', title: 'View Exam Details', icon: Eye, path: '/dashboard/compiler/view-exams' },
        { id: 'monitor', title: 'Monitor', icon: Monitor, path: '/dashboard/compiler/monitor-exams' },
        { id: 'submissions', title: 'Submission of Students', icon: Users, path: '/dashboard/compiler/submissions' }
      ]
    }
  ]

  const handleModuleSelect = (moduleId: string) => {
    if (moduleId === 'assignments') {
      router.push('/dashboard/compiler/assignment-options')
    } else if (moduleId === 'exams') {
      router.push('/dashboard/compiler/exam-options')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Code Compiler
          </h1>
          <p className="text-gray-600 text-lg">
            Choose your coding environment
          </p>
        </motion.div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer h-full hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
                onClick={() => handleModuleSelect(module.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                <CardHeader className="text-center pb-3">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${module.color} flex items-center justify-center mb-4`}
                  >
                    <module.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {module.count}
                  </div>
                  <div className="text-sm text-gray-600">{module.countLabel}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
