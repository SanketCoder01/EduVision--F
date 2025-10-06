"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Plus, BarChart3 } from "lucide-react"

export default function FacultyAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Faculty Analytics & Performance</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">156</div>
            <div className="text-sm text-gray-600">Active Faculty</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">92%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">45</div>
            <div className="text-sm text-gray-600">Publications</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Top Performing Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Dr. Amruta Pankade", dept: "CSE", rating: 4.9, students: 120 },
                { name: "Prof. Rajesh Kumar", dept: "ECE", rating: 4.8, students: 98 },
                { name: "Dr. Priya Sharma", dept: "ME", rating: 4.7, students: 85 },
                { name: "Prof. Vikram Singh", dept: "CE", rating: 4.6, students: 76 }
              ].map((faculty, index) => (
                <div key={faculty.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{faculty.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{faculty.name}</h4>
                      <p className="text-sm text-gray-600">{faculty.dept} • {faculty.students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{faculty.rating}</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { dept: "Computer Science", faculty: 45, avgRating: 4.8, courses: 32 },
                { dept: "Electronics", faculty: 38, avgRating: 4.6, courses: 28 },
                { dept: "Mechanical", faculty: 42, avgRating: 4.5, courses: 35 },
                { dept: "Civil", faculty: 31, avgRating: 4.7, courses: 24 }
              ].map((dept, index) => (
                <div key={dept.dept} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{dept.dept}</span>
                    <span className="text-sm text-gray-600">{dept.faculty} faculty</span>
                  </div>
                  <Progress value={dept.avgRating * 20} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Avg Rating: {dept.avgRating}</span>
                    <span>{dept.courses} courses</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
