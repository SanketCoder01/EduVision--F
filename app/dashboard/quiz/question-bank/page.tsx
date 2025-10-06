"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Brain,
  Tag,
  BookOpen,
  Clock,
  Target,
  Copy,
  Star
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface Question {
  id: string
  type: 'mcq' | 'true_false' | 'fill_blank' | 'descriptive'
  question: string
  options?: string[]
  correctAnswer?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  subject: string
  topic: string
  tags: string[]
  createdAt: string
  usageCount: number
  isPublic: boolean
}

const QuestionBank = () => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'mcq',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: '1',
      points: 2,
      difficulty: 'medium',
      subject: 'Data Structures',
      topic: 'Searching Algorithms',
      tags: ['binary-search', 'complexity', 'algorithms'],
      createdAt: '2024-01-15',
      usageCount: 15,
      isPublic: true
    },
    {
      id: '2',
      type: 'true_false',
      question: 'A stack follows LIFO (Last In First Out) principle.',
      correctAnswer: 'true',
      points: 1,
      difficulty: 'easy',
      subject: 'Data Structures',
      topic: 'Stack',
      tags: ['stack', 'lifo', 'data-structure'],
      createdAt: '2024-01-14',
      usageCount: 8,
      isPublic: false
    },
    {
      id: '3',
      type: 'fill_blank',
      question: 'The worst-case time complexity of quicksort is _____.',
      correctAnswer: 'O(n²)',
      points: 2,
      difficulty: 'hard',
      subject: 'Algorithms',
      topic: 'Sorting',
      tags: ['quicksort', 'complexity', 'sorting'],
      createdAt: '2024-01-13',
      usageCount: 12,
      isPublic: true
    },
    {
      id: '4',
      type: 'descriptive',
      question: 'Explain the difference between BFS and DFS traversal algorithms.',
      correctAnswer: 'BFS explores nodes level by level while DFS explores as far as possible along each branch before backtracking.',
      points: 5,
      difficulty: 'medium',
      subject: 'Algorithms',
      topic: 'Graph Traversal',
      tags: ['bfs', 'dfs', 'graph', 'traversal'],
      createdAt: '2024-01-12',
      usageCount: 6,
      isPublic: true
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const subjects = ['Data Structures', 'Algorithms', 'Database Systems', 'Computer Networks', 'Operating Systems']
  const difficulties = ['easy', 'medium', 'hard']
  const questionTypes = ['mcq', 'true_false', 'fill_blank', 'descriptive']

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = filterSubject === 'all' || question.subject === filterSubject
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty
    const matchesType = filterType === 'all' || question.type === filterType
    
    return matchesSearch && matchesSubject && matchesDifficulty && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return '🔘'
      case 'true_false': return '✓'
      case 'fill_blank': return '___'
      case 'descriptive': return '📝'
      default: return '❓'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const bulkActions = [
    { label: 'Export Selected', icon: Download, action: () => console.log('Export', selectedQuestions) },
    { label: 'Delete Selected', icon: Trash2, action: () => console.log('Delete', selectedQuestions) },
    { label: 'Make Public', icon: Eye, action: () => console.log('Make Public', selectedQuestions) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Question Bank
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your question library with tags and categories
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{questions.filter(q => q.isPublic).length}</div>
              <div className="text-sm text-gray-600">Public</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{subjects.length}</div>
              <div className="text-sm text-gray-600">Subjects</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{questions.reduce((sum, q) => sum + q.usageCount, 0)}</div>
              <div className="text-sm text-gray-600">Total Usage</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-blue-600" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Search Questions</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by question or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={filterSubject} onValueChange={setFilterSubject}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All difficulties</SelectItem>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Question Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {questionTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('')
                    setFilterSubject('')
                    setFilterDifficulty('')
                    setFilterType('')
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Questions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>
                    Questions ({filteredQuestions.length})
                  </CardTitle>
                  
                  {selectedQuestions.length > 0 && (
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      {bulkActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={action.action}
                        >
                          <action.icon className="w-4 h-4 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredQuestions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                        selectedQuestions.includes(question.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => toggleQuestionSelection(question.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{getTypeIcon(question.type)}</span>
                            <Badge variant="outline">{question.type.replace('_', ' ').toUpperCase()}</Badge>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="secondary">{question.points} pts</Badge>
                            {question.isPublic && (
                              <Badge className="bg-green-100 text-green-800">
                                <Eye className="w-3 h-3 mr-1" />
                                Public
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-medium text-gray-900 mb-2">{question.question}</h3>
                          
                          {question.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-2">
                              {question.options.map((option, optIndex) => (
                                <div 
                                  key={optIndex} 
                                  className={`text-sm px-2 py-1 rounded ${
                                    question.correctAnswer === optIndex.toString() 
                                      ? 'bg-green-100 text-green-800 font-medium' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {question.subject}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Target className="w-4 h-4 mr-1" />
                              {question.topic}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {question.createdAt}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="w-4 h-4 mr-1" />
                              Used {question.usageCount} times
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {question.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-12">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default QuestionBank
