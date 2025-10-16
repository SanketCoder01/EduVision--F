"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, BookOpen, Award } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function DepartmentAnalyticsModule({ dean }: { dean: any }) {
  const [analytics, setAnalytics] = useState({
    departments: [
      { name: "Computer Science & Engineering", students: 456, faculty: 12, courses: 8, avgGPA: 8.7, passRate: 96 },
      { name: "AI & Data Science", students: 312, faculty: 8, courses: 6, avgGPA: 8.9, passRate: 95 },
      { name: "AI & Machine Learning", students: 245, faculty: 6, courses: 5, avgGPA: 8.6, passRate: 94 },
      { name: "Cyber Security", students: 234, faculty: 7, courses: 6, avgGPA: 8.4, passRate: 93 }
    ]
  })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Department & Subject Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.departments.map((dept, index) => (
          <Card key={dept.name} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">{dept.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Students</span>
                  <span className="font-bold">{dept.students}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Faculty</span>
                  <span className="font-bold">{dept.faculty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg GPA</span>
                  <span className="font-bold">{dept.avgGPA}</span>
                </div>
                <Progress value={dept.passRate} className="h-2" />
                <div className="text-center text-sm text-gray-600">{dept.passRate}% Pass Rate</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
