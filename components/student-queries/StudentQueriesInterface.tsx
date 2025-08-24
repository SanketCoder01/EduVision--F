"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { MessageCircle, Send, Clock, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Query {
  id: string
  query_text: string
  reply_text?: string
  status: 'pending' | 'replied' | 'closed'
  category: string
  priority: string
  created_at: string
  replied_at?: string
  student?: {
    name: string
    email: string
    department: string
    year: string
  }
}

export default function StudentQueriesInterface() {
  const { toast } = useToast()
  const [queries, setQueries] = useState<Query[]>([])
  const [newQuery, setNewQuery] = useState("")
  const [category, setCategory] = useState("general")
  const [priority, setPriority] = useState("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadQueries()
    
    // Real-time subscription for new queries and replies
    const subscription = supabase
      .channel('student_queries_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'student_queries' },
        (payload) => {
          loadQueries()
          if (payload.eventType === 'UPDATE' && payload.new.reply_text) {
            toast({
              title: "New Reply",
              description: "You have received a reply to your query",
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadQueries = async () => {
    try {
      const response = await fetch('/api/student-queries')
      const result = await response.json()
      
      if (result.success) {
        setQueries(result.data || [])
      }
    } catch (error) {
      console.error('Error loading queries:', error)
    }
  }

  const submitQuery = async () => {
    if (!newQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter your query",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/student-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_text: newQuery,
          category,
          priority
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setNewQuery("")
        setCategory("general")
        setPriority("medium")
        loadQueries()
        toast({
          title: "Query Submitted",
          description: "Your query has been sent to faculty"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit query",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitReply = async (queryId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/student-queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_id: queryId,
          reply_text: replyText
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setReplyText("")
        setSelectedQuery(null)
        loadQueries()
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the student"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'replied': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Submit New Query */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Submit a Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="event">Event Related</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Your Query</Label>
            <Textarea
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="Describe your question or concern..."
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={submitQuery} 
            disabled={isSubmitting || !newQuery.trim()}
            className="w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Query"}
          </Button>
        </CardContent>
      </Card>

      {/* Queries List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Queries</h3>
        {queries.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No queries yet. Submit your first query above!</p>
            </CardContent>
          </Card>
        ) : (
          queries.map((query) => (
            <Card key={query.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getStatusColor(query.status)}>
                        {query.status}
                      </Badge>
                      <Badge className={getPriorityColor(query.priority)}>
                        {query.priority}
                      </Badge>
                      <Badge variant="outline">
                        {query.category}
                      </Badge>
                    </div>
                    {query.student && (
                      <div className="text-sm text-gray-600 mb-2">
                        {query.student.name} • {query.student.department} • {query.student.year}
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(query.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Query:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {query.query_text}
                    </p>
                  </div>
                  
                  {query.reply_text ? (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Faculty Reply:
                      </h4>
                      <p className="text-gray-700 bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                        {query.reply_text}
                      </p>
                      {query.replied_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Replied on {new Date(query.replied_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Waiting for faculty response...
                      </p>
                    </div>
                  )}
                  
                  {/* Faculty Reply Interface */}
                  {query.status === 'pending' && selectedQuery === query.id && (
                    <div className="space-y-3 border-t pt-4">
                      <Label>Your Reply</Label>
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => submitReply(query.id)}
                          disabled={!replyText.trim()}
                          size="sm"
                        >
                          Send Reply
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedQuery(null)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {query.status === 'pending' && selectedQuery !== query.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedQuery(query.id)}
                      className="mt-2"
                    >
                      Reply to Query
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
