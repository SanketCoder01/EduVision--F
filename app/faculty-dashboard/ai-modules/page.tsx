"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, BookOpen, FileText, PenTool, Presentation, Video, MessageSquare, BarChart, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

export default function AIModulesPage() {
  const aiModules = [
    {
      id: "content-generator",
      title: "Content Generator",
      description: "Generate lesson plans, study materials, and presentations based on curriculum topics.",
      icon: FileText,
      status: "active",
      path: "/faculty-dashboard/ai-modules/content-generator"
    },
    {
      id: "assessment-creator",
      title: "Assessment Creator",
      description: "Create quizzes, tests, and assignments with automatic grading capabilities.",
      icon: PenTool,
      status: "active",
      path: "/faculty-dashboard/ai-modules/assessment-creator"
    },
    {
      id: "lecture-assistant",
      title: "Lecture Assistant",
      description: "Real-time assistance during lectures with relevant information and student engagement tools.",
      icon: Presentation,
      status: "active",
      path: "/faculty-dashboard/ai-modules/lecture-assistant"
    },
    {
      id: "video-lectures",
      title: "Video Lecture Creator",
      description: "Create engaging video lectures with AI-generated visuals and animations.",
      icon: Video,
      status: "active",
      path: "/faculty-dashboard/ai-modules/video-lectures"
    },
    {
      id: "student-analytics",
      title: "Student Analytics",
      description: "Analyze student performance and engagement patterns to identify areas for improvement.",
      icon: BarChart,
      status: "active",
      path: "/faculty-dashboard/ai-modules/student-analytics"
    },
    {
      id: "feedback-analyzer",
      title: "Feedback Analyzer",
      description: "Analyze student feedback and generate insights to improve teaching methods.",
      icon: MessageSquare,
      status: "active",
      path: "/faculty-dashboard/ai-modules/feedback-analyzer"
    },
    {
      id: "time-optimizer",
      title: "Time Optimizer",
      description: "Optimize your teaching schedule and task management with AI recommendations.",
      icon: Clock,
      status: "coming-soon",
      path: "/faculty-dashboard/ai-modules/time-optimizer"
    },
    {
      id: "research-assistant",
      title: "Research Assistant",
      description: "Get assistance with academic research, paper writing, and literature reviews.",
      icon: Brain,
      status: "coming-soon",
      path: "/faculty-dashboard/ai-modules/research-assistant"
    }
  ]

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Modules</h1>
          <Button variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Request New Module
          </Button>
        </div>
        
        <p className="text-gray-600">
          Access specialized AI tools designed to enhance your teaching experience and improve student outcomes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiModules.map((module) => (
            <Card key={module.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <module.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge variant={module.status === "active" ? "default" : "outline"}>
                    {module.status === "active" ? "Active" : "Coming Soon"}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                {module.status === "active" ? (
                  <Link href={module.path} className="w-full">
                    <Button className="w-full">Launch Module</Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              AI Module Training
            </CardTitle>
            <CardDescription>
              Learn how to effectively use AI modules in your teaching practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Our training sessions will help you maximize the potential of AI tools in your classroom.
              Learn best practices, implementation strategies, and how to integrate AI with your existing teaching methods.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Training Resources
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}