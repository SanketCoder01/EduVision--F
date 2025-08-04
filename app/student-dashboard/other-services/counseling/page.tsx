"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertCircle,
  Brain,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Eye,
  Filter,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  User
} from "lucide-react"
import { format } from "date-fns"

const counselors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Mental Health Counselor",
    specialization: "Anxiety, Depression, Stress Management",
    availability: "Mon, Wed, Fri",
    image: "/placeholder-user.jpg"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Academic Counselor",
    specialization: "Academic Performance, Career Guidance",
    availability: "Tue, Thu",
    image: "/placeholder-user.jpg"
  },
  {
    id: 3,
    name: "Prof. Anita Patel",
    role: "Faculty Mentor",
    specialization: "Engineering Studies, Research Guidance",
    availability: "Mon, Thu",
    image: "/placeholder-user.jpg"
  },
  {
    id: 4,
    name: "Dr. Robert Williams",
    role: "Clinical Psychologist",
    specialization: "Behavioral Issues, Relationship Counseling",
    availability: "Wed, Fri",
    image: "/placeholder-user.jpg"
  }
]

const pastSessions = [
  {
    id: "CS-2023-001",
    counselor: "Dr. Sarah Johnson",
    date: "May 10, 2023",
    time: "2:30 PM",
    type: "Mental Health",
    status: "Completed",
    notes: "Follow-up scheduled for next month"
  },
  {
    id: "CS-2023-008",
    counselor: "Dr. Michael Chen",
    date: "May 18, 2023",
    time: "11:00 AM",
    type: "Academic",
    status: "Completed",
    notes: "Discussed study strategies for upcoming exams"
  },
  {
    id: "CS-2023-012",
    counselor: "Prof. Anita Patel",
    date: "May 25, 2023",
    time: "3:00 PM",
    type: "Career",
    status: "Scheduled",
    notes: ""
  }
]

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM"
]

const counselingTypes = [
  "Mental Health",
  "Academic Performance",
  "Career Guidance",
  "Personal Issues",
  "Stress Management",
  "Other"
]

export default function CounselingRequestPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCounselor, setSelectedCounselor] = useState<number | null>(null)
  
  const filteredSessions = pastSessions.filter(
    (session) => {
      return (
        session.counselor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <Brain className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Counseling Services</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Schedule confidential counseling sessions for mental health or academic support</p>
          </div>
        </div>

        <Tabs defaultValue="schedule" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="schedule">Schedule Session</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Counseling Session</CardTitle>
                <CardDescription>Select a counselor, date, and time for your session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Available Counselors</h3>
                    <div className="space-y-4">
                      {counselors.map((counselor) => (
                        <div 
                          key={counselor.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedCounselor === counselor.id 
                              ? "border-purple-500 bg-purple-50" 
                              : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                          }`}
                          onClick={() => setSelectedCounselor(counselor.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={counselor.image} alt={counselor.name} />
                              <AvatarFallback>{counselor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-900">{counselor.name}</h4>
                              <p className="text-sm text-gray-600">{counselor.role}</p>
                              <p className="text-xs text-gray-500 mt-1">Specialization: {counselor.specialization}</p>
                              <p className="text-xs text-gray-500">Available: {counselor.availability}</p>
                            </div>
                            {selectedCounselor === counselor.id && (
                              <div className="ml-auto">
                                <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-purple-700" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Session Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Counseling Type</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type of counseling" />
                          </SelectTrigger>
                          <SelectContent>
                            {counselingTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
                        <Textarea 
                          placeholder="Briefly describe what you'd like to discuss..."
                          className="resize-none"
                          rows={4}
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Lock className="h-3 w-3 mr-1" />
                          This information is confidential and only visible to your counselor
                        </p>
                      </div>

                      <div className="flex items-start space-x-2 pt-2">
                        <Checkbox id="urgent" />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="urgent"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            This is urgent (within 24-48 hours)
                          </label>
                          <p className="text-xs text-gray-500">
                            Check this only for emergency situations requiring immediate attention
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Schedule Session
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Past & Upcoming Sessions</CardTitle>
                <CardDescription>View your counseling history and upcoming appointments</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by counselor, type, or ID..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            session.status === "Completed" ? "bg-green-100 text-green-700" :
                            session.status === "Scheduled" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {
                              session.status === "Completed" ? <Check className="h-6 w-6" /> :
                              session.status === "Scheduled" ? <Clock className="h-6 w-6" /> :
                              <AlertCircle className="h-6 w-6" />
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-semibold text-gray-900">{session.counselor}</h3>
                                  <span className="ml-2 text-xs text-gray-500">{session.id}</span>
                                </div>
                                <p className="text-sm text-gray-600">Type: {session.type}</p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${
                                  session.status === "Completed" ? "bg-green-100 text-green-700" :
                                  session.status === "Scheduled" ? "bg-blue-100 text-blue-700" :
                                  "bg-yellow-100 text-yellow-700"
                                } border-0 mt-2 sm:mt-0`}
                              >
                                {session.status}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 mt-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                Date: {session.date}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Time: {session.time}
                              </div>
                            </div>
                            
                            {session.notes && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                <p className="font-medium mb-1">Session Notes:</p>
                                <p>{session.notes}</p>
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-end gap-2">
                              {session.status === "Scheduled" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs">
                                  Reschedule
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No sessions found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Session
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Mental Health Resources</CardTitle>
                  <CardDescription>Helpful resources for managing stress, anxiety, and other mental health concerns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Self-Help Resources</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">Stress Management Techniques</h4>
                          <p className="text-sm text-gray-600 mb-2">Learn effective strategies to manage academic stress</p>
                          <Button variant="link" className="h-auto p-0 text-purple-600">
                            View Resource
                          </Button>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">Mindfulness Practices</h4>
                          <p className="text-sm text-gray-600 mb-2">Simple mindfulness exercises for daily well-being</p>
                          <Button variant="link" className="h-auto p-0 text-purple-600">
                            View Resource
                          </Button>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">Sleep Improvement Guide</h4>
                          <p className="text-sm text-gray-600 mb-2">Tips for better sleep quality and habits</p>
                          <Button variant="link" className="h-auto p-0 text-purple-600">
                            View Resource
                          </Button>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">Anxiety Management</h4>
                          <p className="text-sm text-gray-600 mb-2">Techniques to reduce anxiety and panic symptoms</p>
                          <Button variant="link" className="h-auto p-0 text-purple-600">
                            View Resource
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Upcoming Workshops</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">Stress Management Workshop</h4>
                            <p className="text-sm text-gray-600">May 28, 2023 | 2:00 PM - 4:00 PM | Student Center</p>
                            <Button variant="link" className="h-auto p-0 text-purple-600 text-sm">
                              Register
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">Exam Anxiety Support Group</h4>
                            <p className="text-sm text-gray-600">June 5, 2023 | 3:00 PM - 4:30 PM | Online</p>
                            <Button variant="link" className="h-auto p-0 text-purple-600 text-sm">
                              Register
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contacts</CardTitle>
                    <CardDescription>24/7 support for urgent situations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <h4 className="font-medium text-red-800 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Campus Emergency: 555-123-4567
                        </h4>
                        <p className="text-sm text-red-700 mt-1">Available 24/7 for urgent situations</p>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <h4 className="font-medium text-blue-800 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Mental Health Helpline: 800-555-1234
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">National 24/7 crisis support</p>
                      </div>
                      <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <h4 className="font-medium text-purple-800 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Crisis Text Line: Text HOME to 741741
                        </h4>
                        <p className="text-sm text-purple-700 mt-1">24/7 text-based support</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Confidentiality Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                        <p className="text-sm text-gray-600">
                          All counseling sessions are strictly confidential. Information shared will not be disclosed without your written consent.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
                        <p className="text-sm text-gray-600">
                          Exceptions to confidentiality include risk of harm to self or others, as required by law.
                        </p>
                      </div>
                      <Button variant="link" className="h-auto p-0 text-purple-600 text-sm">
                        View Full Policy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
