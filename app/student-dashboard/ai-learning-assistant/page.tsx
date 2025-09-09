"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  BookOpen,
  Brain,
  Target,
  Clock,
  TrendingUp,
  FileText,
  Video,
  Headphones,
  Download,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Settings,
  Bookmark,
  Share,
  Star,
  Calendar,
  User,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LearningPath {
  id: string
  title: string
  description: string
  subject: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  progress: number
  modules: Module[]
}

interface Module {
  id: string
  title: string
  type: "video" | "reading" | "quiz" | "practice"
  duration: string
  completed: boolean
}

export default function AILearningAssistantPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedPath, setSelectedPath] = useState<string>("")
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const studentSession = localStorage.getItem("studentSession")
    const currentUserData = localStorage.getItem("currentUser")

    if (studentSession) {
      try {
        const user = JSON.parse(studentSession)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing student session:", error)
      }
    } else if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing current user data:", error)
      }
    }
  }, [])

  const learningPaths: LearningPath[] = [
    {
      id: "1",
      title: "Data Structures Mastery",
      description: "Complete guide to understanding and implementing data structures",
      subject: "Computer Science",
      difficulty: "Intermediate",
      duration: "8 weeks",
      progress: 65,
      modules: [
        { id: "1", title: "Introduction to Arrays", type: "video", duration: "15 min", completed: true },
        { id: "2", title: "Linked Lists Deep Dive", type: "video", duration: "25 min", completed: true },
        { id: "3", title: "Stack Operations", type: "reading", duration: "20 min", completed: true },
        { id: "4", title: "Queue Implementation", type: "practice", duration: "30 min", completed: false },
        { id: "5", title: "Trees and Traversal", type: "video", duration: "35 min", completed: false },
        { id: "6", title: "Graph Algorithms", type: "quiz", duration: "15 min", completed: false },
      ]
    },
    {
      id: "2", 
      title: "Machine Learning Fundamentals",
      description: "Build a strong foundation in machine learning concepts and applications",
      subject: "Artificial Intelligence",
      difficulty: "Beginner",
      duration: "12 weeks",
      progress: 30,
      modules: [
        { id: "1", title: "What is Machine Learning?", type: "video", duration: "20 min", completed: true },
        { id: "2", title: "Types of Learning", type: "reading", duration: "25 min", completed: true },
        { id: "3", title: "Linear Regression", type: "video", duration: "40 min", completed: false },
        { id: "4", title: "Classification Basics", type: "practice", duration: "45 min", completed: false },
        { id: "5", title: "Model Evaluation", type: "quiz", duration: "20 min", completed: false },
      ]
    },
    {
      id: "3",
      title: "Database Design Principles", 
      description: "Learn to design efficient and scalable database systems",
      subject: "Database Management",
      difficulty: "Intermediate",
      duration: "6 weeks",
      progress: 80,
      modules: [
        { id: "1", title: "Database Fundamentals", type: "video", duration: "18 min", completed: true },
        { id: "2", title: "ER Modeling", type: "reading", duration: "30 min", completed: true },
        { id: "3", title: "Normalization", type: "video", duration: "35 min", completed: true },
        { id: "4", title: "SQL Queries", type: "practice", duration: "40 min", completed: true },
        { id: "5", title: "Advanced Topics", type: "quiz", duration: "25 min", completed: false },
      ]
    }
  ]

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />
      case "reading": return <FileText className="h-4 w-4" />
      case "quiz": return <Brain className="h-4 w-4" />
      case "practice": return <Target className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800"
      case "Intermediate": return "bg-yellow-100 text-yellow-800"
      case "Advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const currentPath = learningPaths.find(path => path.id === selectedPath)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              AI Learning Assistant
            </h1>
            <p className="text-indigo-100">
              Personalized learning paths powered by AI for {currentUser?.department || "your studies"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-2">
              {learningPaths.length}
            </div>
            <p className="text-sm text-gray-600">Learning Paths</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Math.round(learningPaths.reduce((acc, path) => acc + path.progress, 0) / learningPaths.length)}%
            </div>
            <p className="text-sm text-gray-600">Avg Progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {learningPaths.reduce((acc, path) => acc + path.modules.filter(m => m.completed).length, 0)}
            </div>
            <p className="text-sm text-gray-600">Completed Modules</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              24h
            </div>
            <p className="text-sm text-gray-600">Study Time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Paths */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Paths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningPaths.map((path) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedPath === path.id ? "border-indigo-500 bg-indigo-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPath(path.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{path.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{path.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{path.subject}</Badge>
                        <Badge className={getDifficultyColor(path.difficulty)}>
                          {path.difficulty}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {path.duration}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Current Path Details */}
        <div>
          {currentPath ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {currentPath.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {currentPath.modules.map((module, index) => (
                    <div
                      key={module.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        module.completed 
                          ? "bg-green-50 border-green-200" 
                          : activeModule?.id === module.id
                          ? "bg-indigo-50 border-indigo-200"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveModule(module)}
                    >
                      <div className={`p-2 rounded-lg ${
                        module.completed 
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {getModuleIcon(module.type)}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium">{module.title}</h5>
                        <p className="text-xs text-gray-500">{module.duration}</p>
                      </div>
                      {module.completed && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button className="w-full">
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select a learning path to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Active Module Player */}
      {activeModule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getModuleIcon(activeModule.type)}
              {activeModule.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium mb-1">{activeModule.title}</h4>
                  <p className="text-sm text-gray-300">{activeModule.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {activeModule.type === "video" && (
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg h-48 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">Video Content</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <Progress value={35} className="h-1" />
                    </div>
                    <Button variant="ghost" size="sm">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {activeModule.type === "reading" && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-400">Reading Material</p>
                    <Button className="mt-4" variant="secondary">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}
              
              {activeModule.type === "quiz" && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-400">Interactive Quiz</p>
                    <Button className="mt-4" variant="secondary">
                      Start Quiz
                    </Button>
                  </div>
                </div>
              )}
              
              {activeModule.type === "practice" && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-400">Practice Exercise</p>
                    <Button className="mt-4" variant="secondary">
                      Start Practice
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
