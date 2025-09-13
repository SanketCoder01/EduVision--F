"use client"

import React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Plus,
  Eye,
  FileText
} from "lucide-react"

export default function AssignmentOptions() {
  const router = useRouter()

  const options = [
    {
      id: 'create',
      title: 'Create Assignment',
      description: 'Create coding assignments with AI',
      icon: Plus,
      color: 'from-blue-500 to-blue-600',
      path: '/dashboard/compiler/create-assignment'
    },
    {
      id: 'view',
      title: 'View Assignment',
      description: 'View and manage assignments',
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
      path: '/dashboard/compiler/view-assignments'
    },
    {
      id: 'records',
      title: 'Records',
      description: 'Assignment records and history',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      path: '/dashboard/assignments/records'
    }
  ]

  const handleOptionSelect = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Compiler
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Assignment Options
            </h1>
            <p className="text-gray-600 text-lg">
              Choose your assignment management option
            </p>
          </div>
        </motion.div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer h-full hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
                onClick={() => handleOptionSelect(option.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${option.color}`} />
                <CardHeader className="text-center pb-3">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}
                  >
                    <option.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <CardDescription className="text-sm">{option.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
