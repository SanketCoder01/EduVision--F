"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Users,
  Sparkles
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function CurriculumOptimizationModule({ dean }: { dean: any }) {
  const [curriculums, setCurriculums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    department: dean.department,
    year: 'third',
    subject: '',
    current_syllabus: '',
    proposed_changes: '',
    industry_requirements: '',
    effective_from: ''
  })

  useEffect(() => {
    fetchCurriculums()
  }, [])

  const fetchCurriculums = async () => {
    try {
      const { data, error } = await supabase
        .from('curriculum_optimization')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCurriculums(data || [])
    } catch (error) {
      console.error('Error fetching curriculums:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('curriculum_optimization')
        .insert([{
          ...formData,
          created_by: dean.id,
          student_feedback_score: 0,
          implementation_status: 'proposed'
        }])

      if (error) throw error

      toast({
        title: "Curriculum proposal created",
        description: "Your curriculum optimization proposal has been submitted",
      })

      setShowCreateForm(false)
      setFormData({
        department: dean.department,
        year: 'third',
        subject: '',
        current_syllabus: '',
        proposed_changes: '',
        industry_requirements: '',
        effective_from: ''
      })
      fetchCurriculums()
    } catch (error) {
      console.error('Error creating curriculum:', error)
      toast({
        title: "Error",
        description: "Failed to create curriculum proposal",
        variant: "destructive"
      })
    }
  }

  const departments = [
    'Computer Science & Engineering',
    'Cyber Security',
    'AI & Data Science',
    'AI & Machine Learning'
  ]

  const years = [
    { value: 'first', label: '1st Year' },
    { value: 'second', label: '2nd Year' },
    { value: 'third', label: '3rd Year' },
    { value: 'fourth', label: '4th Year' }
  ]

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Total Proposals</p>
                  <p className="text-3xl font-bold">{curriculums.length}</p>
                </div>
                <GraduationCap className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100">Implemented</p>
                  <p className="text-3xl font-bold">
                    {curriculums.filter(c => c.implementation_status === 'implemented').length}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100">Pending Review</p>
                  <p className="text-3xl font-bold">
                    {curriculums.filter(c => c.implementation_status === 'proposed').length}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Approved</p>
                  <p className="text-3xl font-bold">
                    {curriculums.filter(c => c.implementation_status === 'approved').length}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Curriculum Optimization</h2>
          <p className="text-gray-600">Manage and optimize academic curriculum</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? 'Cancel' : 'New Proposal'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center text-blue-900">
                <Sparkles className="w-5 h-5 mr-2" />
                Create Curriculum Optimization Proposal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {years.map(year => (
                        <option key={year.value} value={year.value}>{year.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Data Structures"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Syllabus
                  </label>
                  <Textarea
                    value={formData.current_syllabus}
                    onChange={(e) => setFormData({ ...formData, current_syllabus: e.target.value })}
                    placeholder="Describe the current syllabus content..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Changes <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.proposed_changes}
                    onChange={(e) => setFormData({ ...formData, proposed_changes: e.target.value })}
                    placeholder="Describe the proposed changes and improvements..."
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry Requirements
                  </label>
                  <Textarea
                    value={formData.industry_requirements}
                    onChange={(e) => setFormData({ ...formData, industry_requirements: e.target.value })}
                    placeholder="What are the current industry requirements and trends..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective From Date
                  </label>
                  <Input
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Submit Proposal
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Proposals List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading proposals...</p>
            </CardContent>
          </Card>
        ) : curriculums.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-600 mb-4">Create your first curriculum optimization proposal</p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Proposal
              </Button>
            </CardContent>
          </Card>
        ) : (
          curriculums.map((curriculum, index) => (
            <motion.div
              key={curriculum.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{curriculum.subject}</h3>
                        <Badge 
                          variant={
                            curriculum.implementation_status === 'implemented' ? 'default' :
                            curriculum.implementation_status === 'approved' ? 'secondary' : 'outline'
                          }
                          className={
                            curriculum.implementation_status === 'implemented' ? 'bg-green-100 text-green-800' :
                            curriculum.implementation_status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                            'bg-orange-100 text-orange-800'
                          }
                        >
                          {curriculum.implementation_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {curriculum.department}
                        </span>
                        <span>{curriculum.year} Year</span>
                        {curriculum.effective_from && (
                          <span>Effective from: {new Date(curriculum.effective_from).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {curriculum.proposed_changes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Proposed Changes:</h4>
                        <p className="text-gray-700 text-sm">{curriculum.proposed_changes}</p>
                      </div>
                    )}

                    {curriculum.industry_requirements && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Industry Requirements:</h4>
                        <p className="text-gray-700 text-sm">{curriculum.industry_requirements}</p>
                      </div>
                    )}

                    {curriculum.student_feedback_score > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Student Feedback:</span>
                        <Badge variant="secondary">{curriculum.student_feedback_score}/5.0</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
