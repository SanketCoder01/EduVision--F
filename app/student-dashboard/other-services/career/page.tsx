"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Briefcase, 
  Building, 
  Calendar, 
  Clock, 
  FileText, 
  GraduationCap, 
  MapPin, 
  Search,
  Users,
  ExternalLink,
  FileCheck
} from "lucide-react"

const jobListings = [
  {
    id: 1,
    title: "Software Engineer Intern",
    company: "TechCorp",
    logo: "/placeholder.svg",
    location: "Remote",
    type: "Internship",
    posted: "2 days ago",
    deadline: "May 30, 2023",
    description: "Looking for a talented software engineering intern to join our dynamic team for the summer.",
  },
  {
    id: 2,
    title: "Data Scientist",
    company: "Analytics Pro",
    logo: "/placeholder.svg",
    location: "New York, NY",
    type: "Full-time",
    posted: "1 week ago",
    deadline: "June 15, 2023",
    description: "Join our data science team to work on cutting-edge machine learning projects.",
  },
  {
    id: 3,
    title: "UX/UI Designer",
    company: "Creative Solutions",
    logo: "/placeholder.svg",
    location: "San Francisco, CA",
    type: "Full-time",
    posted: "3 days ago",
    deadline: "June 10, 2023",
    description: "Design intuitive and engaging user experiences for our clients' digital products.",
  },
  {
    id: 4,
    title: "Marketing Assistant",
    company: "Global Brands",
    logo: "/placeholder.svg",
    location: "Chicago, IL",
    type: "Part-time",
    posted: "5 days ago",
    deadline: "May 25, 2023",
    description: "Assist our marketing team with campaigns, social media, and content creation.",
  },
  {
    id: 5,
    title: "Research Assistant",
    company: "University Research Lab",
    logo: "/placeholder.svg",
    location: "On Campus",
    type: "Part-time",
    posted: "1 day ago",
    deadline: "May 20, 2023",
    description: "Assist professors with ongoing research projects in computer science and data analysis.",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Tech Career Fair",
    date: "May 15, 2023",
    time: "10:00 AM - 4:00 PM",
    location: "University Main Hall",
    description: "Meet recruiters from top tech companies and explore internship and job opportunities.",
  },
  {
    id: 2,
    title: "Resume Workshop",
    date: "May 18, 2023",
    time: "2:00 PM - 4:00 PM",
    location: "Career Center, Room 202",
    description: "Learn how to craft a compelling resume that stands out to employers.",
  },
  {
    id: 3,
    title: "Interview Skills Seminar",
    date: "May 22, 2023",
    time: "1:00 PM - 3:00 PM",
    location: "Online (Zoom)",
    description: "Practice interview techniques and learn how to answer common interview questions.",
  },
]

const resources = [
  {
    id: 1,
    title: "Resume Templates",
    description: "Download professionally designed resume templates for various industries.",
    icon: FileText,
  },
  {
    id: 2,
    title: "Cover Letter Guide",
    description: "Learn how to write effective cover letters that complement your resume.",
    icon: FileCheck,
  },
  {
    id: 3,
    title: "Interview Preparation",
    description: "Access resources to help you prepare for different types of interviews.",
    icon: Users,
  },
  {
    id: 4,
    title: "Career Assessment Tools",
    description: "Discover your strengths, interests, and potential career paths.",
    icon: GraduationCap,
  },
]

export default function CareerServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredJobs = jobListings.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="p-2 rounded-lg bg-green-100 text-green-700">
                <Briefcase className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Career Services</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Job postings, resume building, and career counseling</p>
          </div>
        </div>

        <Tabs defaultValue="jobs" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
            <TabsTrigger value="resources">Career Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Job & Internship Listings</CardTitle>
                <CardDescription>Browse available opportunities for students and recent graduates</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, company, or keywords..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 rounded-md">
                            <AvatarImage src={job.logo} alt={job.company} />
                            <AvatarFallback className="rounded-md bg-green-100 text-green-700">
                              <Building className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{job.title}</h3>
                              <Badge
                                variant="outline"
                                className={`${job.type === "Internship" ? "bg-blue-100 text-blue-700" : job.type === "Part-time" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"} border-0 mt-1 sm:mt-0`}
                              >
                                {job.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{job.company}</p>
                            <p className="text-sm text-gray-500 mt-2">{job.description}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {job.location}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Posted {job.posted}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                Deadline: {job.deadline}
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Button variant="outline" size="sm" className="text-xs mr-2">
                                Save
                              </Button>
                              <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No job listings found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Career Events</CardTitle>
                <CardDescription>Workshops, career fairs, and networking opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-green-100 text-green-700">
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
                            <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">
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
                <CardTitle>Career Resources</CardTitle>
                <CardDescription>Tools and guides to help you in your career journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-700">
                          <resource.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{resource.description}</p>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Access Resource
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Need Career Counseling?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Schedule a one-on-one session with a career counselor to discuss your career goals, review your resume, or practice for interviews.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Book an Appointment
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
