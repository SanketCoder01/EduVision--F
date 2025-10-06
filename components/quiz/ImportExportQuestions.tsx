"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Upload, 
  Download, 
  FileText, 
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Plus,
  Trash2,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"

interface ImportedQuestion {
  id: string
  type: 'mcq' | 'true_false' | 'fill_blank' | 'descriptive'
  question: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  tags: string[]
  status: 'valid' | 'warning' | 'error'
  issues?: string[]
}

interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
  icon: React.ReactNode
}

const ImportExportQuestions = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [importedQuestions, setImportedQuestions] = useState<ImportedQuestion[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState('excel')
  const [exportFilters, setExportFilters] = useState({
    subject: 'all',
    difficulty: 'all',
    type: 'all',
    tags: ''
  })

  const exportFormats: ExportFormat[] = [
    {
      id: 'excel',
      name: 'Excel Spreadsheet',
      extension: '.xlsx',
      description: 'Compatible with Microsoft Excel and Google Sheets',
      icon: <FileSpreadsheet className="w-5 h-5 text-green-600" />
    },
    {
      id: 'word',
      name: 'Word Document',
      extension: '.docx',
      description: 'Formatted document with questions and answers',
      icon: <FileText className="w-5 h-5 text-blue-600" />
    },
    {
      id: 'csv',
      name: 'CSV File',
      extension: '.csv',
      description: 'Comma-separated values for data processing',
      icon: <FileText className="w-5 h-5 text-gray-600" />
    },
    {
      id: 'json',
      name: 'JSON Format',
      extension: '.json',
      description: 'Structured data format for developers',
      icon: <FileText className="w-5 h-5 text-purple-600" />
    }
  ]

  const mockImportedQuestions: ImportedQuestion[] = [
    {
      id: '1',
      type: 'mcq',
      question: 'What is the time complexity of binary search?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctAnswer: 'O(log n)',
      explanation: 'Binary search divides the search space in half with each comparison.',
      difficulty: 'medium',
      topic: 'Algorithms',
      tags: ['binary-search', 'complexity'],
      status: 'valid'
    },
    {
      id: '2',
      type: 'true_false',
      question: 'Arrays have dynamic size in most programming languages.',
      correctAnswer: 'False',
      explanation: 'Arrays typically have fixed size, dynamic arrays are separate data structures.',
      difficulty: 'easy',
      topic: 'Data Structures',
      tags: ['arrays', 'memory'],
      status: 'valid'
    },
    {
      id: '3',
      type: 'mcq',
      question: 'Which sorting algorithm has the best average case performance?',
      options: ['Bubble Sort', 'Quick Sort', 'Selection Sort'],
      correctAnswer: 'Quick Sort',
      difficulty: 'medium',
      topic: 'Sorting',
      tags: ['sorting', 'algorithms'],
      status: 'warning',
      issues: ['Missing option D', 'Explanation not provided']
    },
    {
      id: '4',
      type: 'fill_blank',
      question: 'The _____ data structure follows LIFO principle.',
      correctAnswer: 'Stack',
      explanation: 'Stack follows Last In First Out principle.',
      difficulty: 'easy',
      topic: 'Data Structures',
      tags: ['stack', 'lifo'],
      status: 'valid'
    },
    {
      id: '5',
      type: 'descriptive',
      question: '',
      correctAnswer: 'Explain the concept of recursion with an example.',
      difficulty: 'hard',
      topic: 'Programming Concepts',
      tags: ['recursion'],
      status: 'error',
      issues: ['Question text is empty', 'Answer and question seem swapped']
    }
  ]

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate file processing
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    setTimeout(() => {
      setImportedQuestions(mockImportedQuestions)
      setIsProcessing(false)
      setSelectedQuestions(mockImportedQuestions.filter(q => q.status === 'valid').map(q => q.id))
      
      const validCount = mockImportedQuestions.filter(q => q.status === 'valid').length
      const warningCount = mockImportedQuestions.filter(q => q.status === 'warning').length
      const errorCount = mockImportedQuestions.filter(q => q.status === 'error').length
      
      toast({
        title: "Import completed",
        description: `${validCount} valid, ${warningCount} warnings, ${errorCount} errors`,
      })
    }, 2000)
  }

  const handleExport = () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 15
      })
    }, 150)

    setTimeout(() => {
      setIsProcessing(false)
      const format = exportFormats.find(f => f.id === exportFormat)
      toast({
        title: "Export completed",
        description: `Questions exported as ${format?.name}`,
      })
      
      // Simulate file download
      const link = document.createElement('a')
      link.href = '#'
      link.download = `quiz-questions${format?.extension}`
      link.click()
    }, 1500)
  }

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const selectAllValid = () => {
    const validQuestions = importedQuestions.filter(q => q.status === 'valid').map(q => q.id)
    setSelectedQuestions(validQuestions)
  }

  const deselectAll = () => {
    setSelectedQuestions([])
  }

  const addSelectedQuestions = () => {
    const selected = importedQuestions.filter(q => selectedQuestions.includes(q.id))
    toast({
      title: "Questions added",
      description: `${selected.length} questions added to question bank`,
    })
    // Here you would typically add to the question bank
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <X className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import/Export Questions</h2>
            <p className="text-gray-600">Manage questions in bulk with various formats</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import Questions</TabsTrigger>
              <TabsTrigger value="export">Export Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-6">
              {/* Import Section */}
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Import Questions</h3>
                  <p className="text-gray-600 mb-4">
                    Support for Excel (.xlsx), Word (.docx), CSV (.csv), and JSON (.json) files
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.docx,.csv,.json"
                    onChange={handleFileImport}
                    className="hidden"
                    id="import-file"
                  />
                  <Label htmlFor="import-file">
                    <Button className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </Label>
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-blue-600 font-medium">Processing file...</span>
                    </div>
                    <Progress value={processingProgress} className="w-full" />
                    <div className="text-center text-sm text-gray-600">
                      {processingProgress < 30 ? 'Reading file...' :
                       processingProgress < 60 ? 'Parsing questions...' :
                       processingProgress < 90 ? 'Validating content...' :
                       'Finalizing import...'}
                    </div>
                  </div>
                )}

                {/* Imported Questions */}
                {importedQuestions.length > 0 && !isProcessing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold">Imported Questions ({importedQuestions.length})</h3>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="text-green-600">
                            {importedQuestions.filter(q => q.status === 'valid').length} Valid
                          </Badge>
                          <Badge variant="outline" className="text-yellow-600">
                            {importedQuestions.filter(q => q.status === 'warning').length} Warnings
                          </Badge>
                          <Badge variant="outline" className="text-red-600">
                            {importedQuestions.filter(q => q.status === 'error').length} Errors
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={selectAllValid}>
                          Select Valid
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAll}>
                          Deselect All
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={addSelectedQuestions}
                          disabled={selectedQuestions.length === 0}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Selected ({selectedQuestions.length})
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {importedQuestions.map((question, index) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 border-2 rounded-lg transition-all ${getStatusColor(question.status)} ${
                            selectedQuestions.includes(question.id) ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question.id)}
                              onChange={() => toggleQuestionSelection(question.id)}
                              className="mt-1"
                              disabled={question.status === 'error'}
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusIcon(question.status)}
                                <Badge variant="outline">{question.type.replace('_', ' ').toUpperCase()}</Badge>
                                <Badge variant="secondary">{question.difficulty}</Badge>
                                <Badge variant="outline">{question.topic}</Badge>
                              </div>
                              
                              <h4 className="font-medium text-gray-900 mb-2">
                                {question.question || <span className="text-red-500 italic">No question text</span>}
                              </h4>
                              
                              {question.options && (
                                <div className="grid grid-cols-2 gap-1 mb-2 text-sm">
                                  {question.options.map((option, optIndex) => (
                                    <div 
                                      key={optIndex}
                                      className={`p-1 rounded text-xs ${
                                        option === question.correctAnswer 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIndex)}. {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {question.issues && question.issues.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-sm font-medium text-red-700 mb-1">Issues:</div>
                                  <ul className="text-sm text-red-600 list-disc list-inside">
                                    {question.issues.map((issue, issueIndex) => (
                                      <li key={issueIndex}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              {/* Export Filters */}
              <Card className="bg-gray-50 border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Export Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Subject</Label>
                      <Select value={exportFilters.subject} onValueChange={(value) => setExportFilters({...exportFilters, subject: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subjects</SelectItem>
                          <SelectItem value="data-structures">Data Structures</SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="programming">Programming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Difficulty</Label>
                      <Select value={exportFilters.difficulty} onValueChange={(value) => setExportFilters({...exportFilters, difficulty: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Question Type</Label>
                      <Select value={exportFilters.type} onValueChange={(value) => setExportFilters({...exportFilters, type: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="fill_blank">Fill in Blanks</SelectItem>
                          <SelectItem value="descriptive">Descriptive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Tags</Label>
                      <Input
                        placeholder="Enter tags..."
                        value={exportFilters.tags}
                        onChange={(e) => setExportFilters({...exportFilters, tags: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Formats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose Export Format</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {exportFormats.map((format) => (
                    <div
                      key={format.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        exportFormat === format.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setExportFormat(format.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={exportFormat === format.id}
                          onChange={() => setExportFormat(format.id)}
                          className="text-blue-600"
                        />
                        {format.icon}
                        <div>
                          <h4 className="font-medium text-gray-900">{format.name}</h4>
                          <p className="text-sm text-gray-600">{format.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <div className="pt-4 border-t border-gray-200">
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className="text-blue-600 font-medium">Preparing export...</span>
                    </div>
                    <Progress value={processingProgress} className="w-full" />
                  </div>
                ) : (
                  <Button 
                    onClick={handleExport}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Export Questions
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ImportExportQuestions
