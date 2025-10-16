"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Code, Calendar, Trophy, Users, Plus, Edit, Trash2, Eye, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Hackathon {
  id: string
  title: string
  description: string
  theme: string
  department: string
  target_years: string[]
  start_date: string
  end_date: string
  registration_deadline: string
  max_teams: number
  team_size_min: number
  team_size_max: number
  prize_pool?: string
  rules?: string
  registered_teams: number
  status: string
  created_by: string
  created_at: string
}

const departments = [
  'Computer Science & Engineering',
  'Cyber Security',
  'AI & Data Science',
  'AI & Machine Learning',
  'All Departments'
]

const years = ['first', 'second', 'third', 'fourth', 'all']

const themes = [
  'AI/ML', 'Web Development', 'Mobile Apps', 'Blockchain', 
  'IoT', 'Cybersecurity', 'Cloud Computing', 'Open Innovation'
]

export default function HackathonModule({ dean }: { dean: any }) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: 'Open Innovation',
    department: 'All Departments',
    target_years: ['all'],
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_teams: 50,
    team_size_min: 2,
    team_size_max: 4,
    prize_pool: '',
    rules: ''
  })

  useEffect(() => {
    fetchHackathons()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('hackathons_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'hackathons' },
        (payload) => {
          console.log('Hackathon change:', payload)
          fetchHackathons()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchHackathons = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) throw error
      setHackathons(data || [])
    } catch (error) {
      console.error('Error fetching hackathons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      // Insert hackathon into database
      const { data: hackathonData, error: hackathonError } = await supabase
        .from('hackathons')
        .insert([{
          ...formData,
          created_by: dean.id,
          status: 'upcoming',
          registered_teams: 0
        }])
        .select()
        .single()

      if (hackathonError) throw hackathonError

      // Send real-time notifications to students
      await sendHackathonNotifications(hackathonData)

      toast({
        title: "Hackathon Created Successfully",
        description: "Students will be notified about this hackathon",
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        theme: 'Open Innovation',
        department: 'All Departments',
        target_years: ['all'],
        start_date: '',
        end_date: '',
        registration_deadline: '',
        max_teams: 50,
        team_size_min: 2,
        team_size_max: 4,
        prize_pool: '',
        rules: ''
      })
      setShowCreateForm(false)
      fetchHackathons()
    } catch (error) {
      console.error('Error creating hackathon:', error)
      toast({
        title: "Error",
        description: "Failed to create hackathon",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const sendHackathonNotifications = async (hackathon: any) => {
    try {
      // Get target students based on department and years
      let query = supabase
        .from('students')
        .select('id, name, email, department, year')
        .eq('status', 'active')

      // Filter by department
      if (hackathon.department !== 'All Departments') {
        query = query.eq('department', hackathon.department)
      }

      // Filter by years
      if (!hackathon.target_years.includes('all')) {
        query = query.in('year', hackathon.target_years)
      }

      const { data: students, error } = await query

      if (error) throw error

      // Create notifications for each student
      const notifications = students?.map(student => ({
        user_id: student.id,
        type: 'hackathon',
        title: `New Hackathon: ${hackathon.title}`,
        message: `${hackathon.theme} hackathon starting ${new Date(hackathon.start_date).toLocaleDateString()}. Prize Pool: ${hackathon.prize_pool || 'TBA'}`,
        link: `/student-dashboard/hackathons`,
        read: false,
        created_at: new Date().toISOString()
      })) || []

      if (notifications.length > 0) {
        await supabase
          .from('notifications')
          .insert(notifications)
      }

      console.log(`Sent hackathon notifications to ${notifications.length} students`)
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  const handleDeleteHackathon = async (hackathonId: string) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return

    try {
      const { error } = await supabase
        .from('hackathons')
        .delete()
        .eq('id', hackathonId)

      if (error) throw error

      toast({
        title: "Hackathon Deleted",
        description: "Hackathon has been removed successfully",
      })
      fetchHackathons()
    } catch (error) {
      console.error('Error deleting hackathon:', error)
      toast({
        title: "Error",
        description: "Failed to delete hackathon",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'registration_open': return 'bg-green-100 text-green-700'
      case 'ongoing': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading && hackathons.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hackathons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Hackathon Management</h2>
          <p className="text-gray-600 mt-1">Organize coding competitions with real-time student notifications</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Hackathon
        </Button>
      </div>

      {/* Create Hackathon Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Create New Hackathon</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHackathon} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Hackathon Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., CodeFest 2025"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme *</Label>
                    <select
                      id="theme"
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      {themes.map(theme => (
                        <option key={theme} value={theme}>{theme}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prize_pool">Prize Pool</Label>
                    <Input
                      id="prize_pool"
                      value={formData.prize_pool}
                      onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                      placeholder="e.g., ₹50,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_deadline">Registration Deadline *</Label>
                    <Input
                      id="registration_deadline"
                      type="datetime-local"
                      value={formData.registration_deadline}
                      onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_teams">Max Teams</Label>
                    <Input
                      id="max_teams"
                      type="number"
                      value={formData.max_teams}
                      onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team_size_min">Min Team Size</Label>
                    <Input
                      id="team_size_min"
                      type="number"
                      value={formData.team_size_min}
                      onChange={(e) => setFormData({ ...formData, team_size_min: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team_size_max">Max Team Size</Label>
                    <Input
                      id="team_size_max"
                      type="number"
                      value={formData.team_size_max}
                      onChange={(e) => setFormData({ ...formData, team_size_max: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Target Years</Label>
                    <div className="flex flex-wrap gap-2">
                      {years.map(year => (
                        <label key={year} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.target_years.includes(year)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  target_years: [...formData.target_years, year] 
                                })
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  target_years: formData.target_years.filter(y => y !== year) 
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">{year === 'all' ? 'All Years' : `${year} Year`}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the hackathon theme, objectives, and what participants will build"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">Rules & Guidelines</Label>
                  <Textarea
                    id="rules"
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    placeholder="Enter hackathon rules, judging criteria, submission guidelines, etc."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                    disabled={loading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Creating...' : 'Create & Notify Students'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hackathons List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hackathon, index) => (
          <motion.div
            key={hackathon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-purple-100 text-purple-700">
                    {hackathon.theme}
                  </Badge>
                  <Badge className={getStatusColor(hackathon.status)}>
                    {hackathon.status.replace('_', ' ').charAt(0).toUpperCase() + hackathon.status.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-600" />
                  {hackathon.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{hackathon.description}</p>
                
                {hackathon.prize_pool && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span>Prize: {hackathon.prize_pool}</span>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{hackathon.registered_teams} / {hackathon.max_teams} teams registered</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Team Size: {hackathon.team_size_min}-{hackathon.team_size_max} members
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">{hackathon.department}</Badge>
                  {hackathon.target_years?.map(year => (
                    <Badge key={year} variant="outline" className="text-xs capitalize">
                      {year === 'all' ? 'All Years' : year}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteHackathon(hackathon.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {hackathons.length === 0 && !showCreateForm && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hackathons Yet</h3>
            <p className="text-gray-600 mb-4">Create your first hackathon to get started</p>
            <Button 
              onClick={() => setShowCreateForm(true)} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Hackathon
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
