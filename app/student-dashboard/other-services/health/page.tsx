"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  Heart, 
  Info, 
  MapPin, 
  MessageSquare,
  Phone,
  User,
  Utensils
} from "lucide-react"

const upcomingAppointments = [
  {
    id: 1,
    type: "Counseling Session",
    provider: "Dr. Sarah Johnson",
    date: "May 15, 2023",
    time: "2:00 PM - 3:00 PM",
    location: "Health Center, Room 105",
    notes: "Initial consultation",
  },
  {
    id: 2,
    type: "Fitness Assessment",
    provider: "Alex Thompson",
    date: "May 20, 2023",
    time: "10:00 AM - 11:00 AM",
    location: "Campus Gym",
    notes: "Wear comfortable clothing and athletic shoes",
  },
]

const wellnessEvents = [
  {
    id: 1,
    title: "Stress Management Workshop",
    date: "May 18, 2023",
    time: "3:00 PM - 4:30 PM",
    location: "Student Center, Room 202",
    description: "Learn effective techniques to manage academic stress and maintain mental well-being.",
  },
  {
    id: 2,
    title: "Yoga for Beginners",
    date: "May 22, 2023",
    time: "8:00 AM - 9:00 AM",
    location: "Campus Recreation Center",
    description: "A gentle introduction to yoga poses and breathing techniques for stress relief and flexibility.",
  },
  {
    id: 3,
    title: "Nutrition Seminar: Eating for Energy",
    date: "May 25, 2023",
    time: "12:00 PM - 1:00 PM",
    location: "Online (Zoom)",
    description: "Discover how to fuel your body for optimal energy and academic performance.",
  },
]

const healthResources = [
  {
    id: 1,
    title: "Mental Health Resources",
    description: "Access guides, articles, and self-help tools for managing anxiety, depression, and stress.",
    icon: Heart,
  },
  {
    id: 2,
    title: "Nutrition Guides",
    description: "Healthy eating tips, meal planning resources, and dietary information for students.",
    icon: Utensils,
  },
  {
    id: 3,
    title: "Fitness Programs",
    description: "Workout plans, exercise videos, and fitness challenges you can do on campus or at home.",
    icon: Activity,
  },
  {
    id: 4,
    title: "Sleep Improvement",
    description: "Tips and techniques for better sleep quality to improve your academic performance.",
    icon: Clock,
  },
]

export default function HealthWellnessPage() {
  const [messageText, setMessageText] = useState("")

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
              <div className="p-2 rounded-lg bg-red-100 text-red-700">
                <Heart className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Health & Wellness</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Mental health resources, fitness programs, and wellness services</p>
          </div>
        </div>

        <Tabs defaultValue="appointments" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="events">Wellness Events</TabsTrigger>
            <TabsTrigger value="resources">Health Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Health Appointments</CardTitle>
                <CardDescription>View and manage your upcoming health and wellness appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 rounded-md">
                            <AvatarImage src="/placeholder.svg" alt={appointment.provider} />
                            <AvatarFallback className="rounded-md bg-red-100 text-red-700">
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{appointment.type}</h3>
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-700 border-0 mt-1 sm:mt-0"
                              >
                                Upcoming
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">With {appointment.provider}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {appointment.date}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {appointment.location}
                              </div>
                            </div>
                            {appointment.notes && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 flex items-start">
                                <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{appointment.notes}</span>
                              </div>
                            )}
                            <div className="mt-4 flex justify-end">
                              <Button variant="outline" size="sm" className="text-xs mr-2">
                                Reschedule
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs mr-2 border-red-200 text-red-600 hover:bg-red-50">
                                Cancel
                              </Button>
                              <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700">
                                <Phone className="h-3 w-3 mr-1" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">You have no upcoming appointments.</p>
                    </div>
                  )}

                  <div className="mt-6">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Schedule New Appointment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Wellness Events</CardTitle>
                <CardDescription>Workshops, fitness classes, and wellness activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wellnessEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-red-100 text-red-700">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {event.date}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.time}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" size="sm" className="text-xs mr-2">
                              Add to Calendar
                            </Button>
                            <Button size="sm" className="text-xs bg-red-600 hover:bg-red-700">
                              Register
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Resources</CardTitle>
                <CardDescription>Tools and guides to support your physical and mental well-being</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {healthResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-700">
                          <resource.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{resource.description}</p>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs">
                          View Resources
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Counseling Services</h3>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500 mb-4">
                      Have a question or need to speak with a counselor? Send a message and we'll get back to you within 24 hours.
                    </p>
                    <Textarea
                      placeholder="Type your message here..."
                      className="mb-4"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button className="bg-red-600 hover:bg-red-700">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Emergency Services</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If you're experiencing a mental health emergency, please call the 24/7 Crisis Hotline at <span className="font-semibold">1-800-123-4567</span> or visit the University Health Center.
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Crisis Hotline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
