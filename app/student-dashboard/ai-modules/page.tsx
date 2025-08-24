"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, BookOpen, Calculator, Code, PenTool, Video, MessageSquare, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

export default function StudentAIModulesPage() {
  const aiModules = [
    {
      id: "study-assistant",
      title: "Study Assistant",
      description: "Get personalized study plans, notes, and summaries based on your course materials.",
      icon: BookOpen,
      status: "active",
      path: "/student-dashboard/ai-modules/study-assistant"
    },
    {
      id: "homework-helper",
      title: "Homework Helper",
      description: "Step-by-step guidance for solving problems in math, science, and programming.",
      icon: PenTool,
      status: "active",
      path: "/student-dashboard/ai-modules/homework-helper"
    },
    {
      id: "concept-explainer",
      title: "Concept Explainer",
      description: "Interactive explanations of complex concepts with visual aids and examples.",
      icon: Brain,
      status: "active",
      path: "/student-dashboard/ai-modules/concept-explainer"
    },
    {
      id: "math-solver",
      title: "Math Solver",
      description: "Solve mathematical problems with detailed steps and explanations.",
      icon: Calculator,
      status: "active",
      path: "/student-dashboard/ai-modules/math-solver"
    },
    {
      id: "code-tutor",
      title: "Code Tutor",
      description: "Learn programming with interactive coding exercises and personalized feedback.",
      icon: Code,
      status: "active",
      path: "/student-dashboard/ai-modules/code-tutor"
    },
    {
      id: "video-summarizer",
      title: "Video Summarizer",
      description: "Get concise summaries and key points from lecture videos.",
      icon: Video,
      status: "active",
      path: "/student-dashboard/ai-modules/video-summarizer"
    },
    {
      id: "study-group-assistant",
      title: "Study Group Assistant",
      description: "Facilitate collaborative learning with AI-powered discussion prompts and resources.",
      icon: MessageSquare,
      status: "coming-soon",
      path: "/student-dashboard/ai-modules/study-group-assistant"
    },
    {
      id: "exam-prep",
      title: "Exam Preparation",
      description: "Comprehensive exam preparation with practice tests and personalized feedback.",
      icon: Clock,
      status: "coming-soon",
      path: "/student-dashboard/ai-modules/exam-prep"
    }
  ]

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Learning Modules</h1>
          <Button variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Suggest New Module
          </Button>
        </div>
        
        <p className="text-gray-600">
          Access specialized AI tools designed to enhance your learning experience and improve your academic performance.
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
              AI Learning Tips
            </CardTitle>
            <CardDescription>
              Learn how to effectively use AI modules to enhance your studies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Our guides will help you maximize the potential of AI tools in your learning journey.
              Discover strategies for using AI to improve comprehension, retention, and problem-solving skills.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Learning Resources
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}