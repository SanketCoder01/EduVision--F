"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Bot, 
  Sparkles, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Lightbulb,
  BarChart3,
  Users,
  BookOpen
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AIcopilotModule({ dean }: { dean: any }) {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [processingMessage, setProcessingMessage] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAIInsights()
    generateMockInsights()
  }, [])

  const fetchAIInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      // Merge with mock insights if database is empty
      if (!data || data.length === 0) {
        setInsights(mockInsights)
      } else {
        setInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      setInsights(mockInsights)
    } finally {
      setLoading(false)
    }
  }

  const generateMockInsights = () => {
    // Generate some AI insights based on dean's department
    const newInsights = [
      {
        id: '1',
        insight_type: 'risk_alert',
        department: dean.department,
        severity: 'high',
        title: 'Declining Attendance in Data Structures',
        description: '15 students in CSE 3rd year showing attendance below 75% in Data Structures course. Immediate intervention recommended.',
        recommended_action: 'Schedule remedial classes and send personalized notifications to at-risk students',
        status: 'new',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        insight_type: 'recommendation',
        department: dean.department,
        severity: 'medium',
        title: 'Optimize Faculty Distribution',
        description: 'Analysis shows 23% improvement potential in faculty-student ratio for lab sessions',
        recommended_action: 'Consider redistributing lab batches for optimal learning outcomes',
        status: 'new',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        insight_type: 'trend_analysis',
        department: 'AI & Data Science',
        severity: 'low',
        title: 'Positive Trend in Assignment Submissions',
        description: 'Assignment submission rates improved by 34% compared to last semester',
        recommended_action: 'Continue current engagement strategies and share best practices with other departments',
        status: 'acknowledged',
        created_at: new Date().toISOString()
      }
    ]

    // Store insights in database
    newInsights.forEach(async (insight) => {
      const { id, ...insertData } = insight
      await supabase.from('ai_insights').insert([insertData])
    })
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return

    const userMessage = {
      role: 'user',
      content: chatMessage,
      timestamp: new Date()
    }

    setChatHistory([...chatHistory, userMessage])
    setChatMessage('')
    setProcessingMessage(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(chatMessage)
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }])
      setProcessingMessage(false)
    }, 1500)
  }

  const generateAIResponse = (query: string) => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('student') || lowerQuery.includes('performance')) {
      return "Based on current data, student performance across departments shows:\n\n• Computer Science & Engineering: 94% pass rate (↑3% from last semester)\n• AI & Data Science: 96% pass rate (↑5%)\n• Cyber Security: 91% pass rate (↓2%)\n• AI & Machine Learning: 93% pass rate (↑4%)\n\nKey insights: Cyber Security department needs attention. Recommend scheduling faculty review meeting to identify improvement areas."
    }
    
    if (lowerQuery.includes('attendance') || lowerQuery.includes('absent')) {
      return "Attendance analysis reveals:\n\n• Overall attendance rate: 87.3%\n• 23 students identified as at-risk (below 75%)\n• Best performing department: AI & DS (92.1%)\n• Needs improvement: Cyber Security (82.4%)\n\nRecommendation: Implement automated attendance tracking and send early warning notifications to students falling below threshold."
    }
    
    if (lowerQuery.includes('faculty') || lowerQuery.includes('teacher')) {
      return "Faculty performance metrics:\n\n• Average student feedback score: 4.2/5.0\n• Top performers: 12 faculty members with 4.8+ rating\n• 3 faculty members need improvement (< 3.5 rating)\n• Research publications this semester: 45\n\nSuggestion: Organize faculty development workshop for low-rated faculty and recognize top performers in upcoming meeting."
    }
    
    if (lowerQuery.includes('improve') || lowerQuery.includes('suggestion')) {
      return "Top improvement opportunities:\n\n1. Digital Learning: Increase use of interactive online resources (current adoption: 42%)\n2. Lab Infrastructure: Upgrade computing labs for AI/ML courses\n3. Industry Connect: Establish more guest lecture sessions (target: 2 per month)\n4. Student Support: Launch peer mentoring program for struggling students\n5. Assessment: Diversify evaluation methods beyond traditional exams\n\nPriority: Start with digital learning adoption and student support programs for immediate impact."
    }
    
    return "I'm here to help you make data-driven decisions for academic excellence. I can provide insights on:\n\n• Student performance analysis\n• Faculty effectiveness metrics\n• Attendance trends and interventions\n• Curriculum optimization suggestions\n• Resource allocation recommendations\n• Predictive analytics for at-risk students\n\nWhat specific area would you like to explore?"
  }

  const mockInsights = [
    {
      id: '1',
      insight_type: 'risk_alert',
      department: 'Computer Science & Engineering',
      severity: 'high',
      title: '15 Students at Risk - Low Attendance',
      description: 'Attendance below 75% detected for CSE 3rd year students in Data Structures',
      recommended_action: 'Schedule remedial classes and personal counseling',
      status: 'new'
    },
    {
      id: '2',
      insight_type: 'recommendation',
      department: dean.department,
      severity: 'medium',
      title: 'Faculty Distribution Optimization',
      description: '23% improvement potential in lab session allocation',
      recommended_action: 'Redistribute lab batches for better learning outcomes',
      status: 'new'
    },
    {
      id: '3',
      insight_type: 'trend_analysis',
      department: 'AI & Data Science',
      severity: 'low',
      title: 'Positive Assignment Submission Trend',
      description: '34% improvement in assignment submissions vs last semester',
      recommended_action: 'Share best practices with other departments',
      status: 'acknowledged'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk_alert':
        return AlertTriangle
      case 'recommendation':
        return Lightbulb
      case 'trend_analysis':
        return TrendingUp
      default:
        return Sparkles
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Active Insights</p>
                  <p className="text-3xl font-bold">{insights.filter(i => i.status === 'new').length}</p>
                </div>
                <Sparkles className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-100">Critical Alerts</p>
                  <p className="text-3xl font-bold">
                    {insights.filter(i => i.severity === 'high' || i.severity === 'critical').length}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Recommendations</p>
                  <p className="text-3xl font-bold">
                    {insights.filter(i => i.insight_type === 'recommendation').length}
                  </p>
                </div>
                <Lightbulb className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Resolved</p>
                  <p className="text-3xl font-bold">
                    {insights.filter(i => i.status === 'resolved').length}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Chat Assistant */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="flex items-center text-purple-900">
              <Bot className="w-6 h-6 mr-2" />
              Dean AI Assistant
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Ask me anything about your institution's performance</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Hi {dean.name}! I'm your AI assistant</p>
                  <p className="text-sm text-gray-500">Ask me about student performance, faculty analytics, or any insights</p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              {processingMessage && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Ask me anything..."
                  className="resize-none"
                  rows={2}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || processingMessage}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights & Alerts */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="flex items-center text-orange-900">
              <Sparkles className="w-6 h-6 mr-2" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-96 overflow-y-auto space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing data...</p>
                </div>
              ) : (
                insights.map((insight, idx) => {
                  const Icon = getInsightIcon(insight.insight_type)
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className={`p-4 rounded-lg border-2 ${getSeverityColor(insight.severity)}`}>
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{insight.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {insight.insight_type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{insight.description}</p>
                            {insight.recommended_action && (
                              <div className="bg-white/50 rounded p-2 text-xs">
                                <span className="font-medium">💡 Recommended:</span> {insight.recommended_action}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              {insight.status === 'new' ? (
                                <>
                                  <Button size="sm" className="text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Acknowledge
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Dismiss
                                  </Button>
                                </>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  {insight.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Users className="w-5 h-5 mr-2" />
              Student Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pass Rate</span>
                <span className="font-bold text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendance</span>
                <span className="font-bold text-blue-600">87.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">At-Risk Students</span>
                <span className="font-bold text-red-600">23</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-900">
              <BarChart3 className="w-5 h-5 mr-2" />
              Faculty Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Rating</span>
                <span className="font-bold text-yellow-600">4.2/5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Publications</span>
                <span className="font-bold text-purple-600">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Workshops</span>
                <span className="font-bold text-indigo-600">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <BookOpen className="w-5 h-5 mr-2" />
              Academic Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. CGPA</span>
                <span className="font-bold text-green-600">8.2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Assignments</span>
                <span className="font-bold text-blue-600">94% completed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projects</span>
                <span className="font-bold text-purple-600">87% submitted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
