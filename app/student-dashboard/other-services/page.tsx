"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  FileText,
  ScrollText,
  ClipboardCheck,
  AlertTriangle,
  Search,
  HelpCircle,
  MessageSquare,
  Calendar,
  FileOutput,
  UserCheck,
  Award,
  Wrench,
  Building2,
  FileQuestion,
  Ticket,
  BadgeAlert,
  Code,
  FileEdit,
  Coffee,
  Library
} from "lucide-react"

// Get user's own service requests from localStorage
const getUserRequests = () => {
  const studentSession = localStorage.getItem("student_session")
  if (studentSession) {
    const session = JSON.parse(studentSession)
    return JSON.parse(localStorage.getItem(`service_requests_${session.email}`) || "[]")
  }
  return []
}

const services = [
  {
    id: 1,
    title: "Certificate Request",
    description: "Request bonafide, transfer certificates, and internship letters",
    icon: ScrollText,
    color: "bg-blue-100 text-blue-700",
    badge: "Popular",
    badgeColor: "bg-blue-100 text-blue-700",
    href: "/student-dashboard/other-services/certificate"
  },
  {
    id: 2,
    title: "Leave Request",
    description: "Apply for leave with supporting documents and track approval",
    icon: ClipboardCheck,
    color: "bg-green-100 text-green-700",
    href: "/student-dashboard/other-services/leave"
  },
  {
    id: 3,
    title: "Maintenance Complaints",
    description: "Report hostel, classroom, lab, or mess issues for resolution",
    icon: Wrench,
    color: "bg-purple-100 text-purple-700",
    href: "/student-dashboard/other-services/maintenance"
  },
  {
    id: 4,
    title: "Grievance Portal",
    description: "Submit sensitive complaints with anonymous mode support",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700",
    href: "/student-dashboard/other-services/grievance"
  },
  {
    id: 5,
    title: "Application Tracker",
    description: "Track real-time status of all your service requests",
    icon: Search,
    color: "bg-yellow-100 text-yellow-700",
    href: "/student-dashboard/other-services/tracker"
  },
  {
    id: 6,
    title: "Lost & Found",
    description: "Post lost items or report found items for matching",
    icon: HelpCircle,
    color: "bg-indigo-100 text-indigo-700",
    href: "/student-dashboard/other-services/lost-found"
  },
  {
    id: 7,
    title: "Suggestion Box",
    description: "Provide anonymous feedback and suggestions for improvement",
    icon: MessageSquare,
    color: "bg-teal-100 text-teal-700",
    href: "/student-dashboard/other-services/suggestion"
  },
  {
    id: 8,
    title: "Event Help Desk",
    description: "Apply for permission to host events and request resources",
    icon: Calendar,
    color: "bg-amber-100 text-amber-700",
    badge: "Important",
    badgeColor: "bg-amber-100 text-amber-700",
    href: "/student-dashboard/other-services/event-desk"
  },
  {
    id: 9,
    title: "Document Reissue",
    description: "Request duplicate fee receipts, marksheets, ID cards, etc.",
    icon: FileOutput,
    color: "bg-cyan-100 text-cyan-700",
    href: "/student-dashboard/other-services/document-reissue"
  },
  {
    id: 10,
    title: "Background Verification",
    description: "Submit verification requests for alumni records",
    icon: UserCheck,
    color: "bg-orange-100 text-orange-700",
    href: "/student-dashboard/other-services/background-verification"
  },
  {
    id: 11,
    title: "Recommendation Letters",
    description: "Request letters of recommendation from faculty members",
    icon: Award,
    color: "bg-pink-100 text-pink-700",
    href: "/student-dashboard/other-services/recommendation"
  },
  {
    id: 12,
    title: "Health Services",
    description: "Book appointments with campus health center and view resources",
    icon: FileQuestion,
    color: "bg-gray-100 text-gray-700",
    href: "/student-dashboard/other-services/health"
  },
  {
    id: 13,
    title: "Hackathon",
    description: "Register for upcoming hackathons and view past events",
    icon: Code,
    color: "bg-violet-100 text-violet-700",
    badge: "New",
    badgeColor: "bg-violet-100 text-violet-700",
    href: "/student-dashboard/other-services/hackathon"
  },
  {
    id: 14,
    title: "Resume Building",
    description: "Create and update your professional resume with templates",
    icon: FileEdit,
    color: "bg-emerald-100 text-emerald-700",
    href: "/student-dashboard/other-services/resume-building"
  },
  {
    id: 15,
    title: "Nearby Mess",
    description: "View mess menus, timings, and locations near campus",
    icon: Coffee,
    color: "bg-amber-100 text-amber-700",
    href: "/student-dashboard/other-services/mess"
  },
  {
    id: 16,
    title: "Library Room Booking",
    description: "Reserve study rooms and spaces across campus libraries",
    icon: Library,
    color: "bg-blue-100 text-blue-700",
    badge: "New",
    badgeColor: "bg-blue-100 text-blue-700",
    href: "/student-dashboard/other-services/library-booking"
  },
]

export default function OtherServicesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [userRequests, setUserRequests] = useState<any[]>([])

  useEffect(() => {
    // Load user's own requests
    setUserRequests(getUserRequests())
  }, [])

  const filteredServices = activeTab === "all" ? services : services.filter(service => service.badge)

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Other Services</h1>
            <p className="text-gray-500 mt-1">Access additional campus services and track your requests</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[500px] grid-cols-3">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="requests">My Requests ({userRequests.length})</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="requests" className="mt-6">
            {userRequests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">No Requests Yet</h3>
                      <p className="text-gray-500 mt-1">
                        You haven't submitted any service requests yet.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Use the services above to submit your first request.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {userRequests.map((request, index) => (
                  <RequestCard key={index} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="featured" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.filter(service => service.badge).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

function ServiceCard({ service }: { service: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-lg ${service.color}`}>
              <service.icon className="h-6 w-6" />
            </div>
            {service.badge && (
              <Badge variant="outline" className={`${service.badgeColor} border-0`}>
                {service.badge}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl mt-4">{service.title}</CardTitle>
          <CardDescription>{service.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <Separator className="my-2" />
          <div className="flex justify-between items-center mt-2">
            <Button variant="ghost" size="sm" className="text-sm">
              Learn More
            </Button>
            <Link href={service.href || '#'}>
              <Button variant="outline" size="sm" className="text-sm">
                Access
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RequestCard({ request }: { request: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const downloadPDF = (requestId: string) => {
    // Mock PDF download functionality
    const link = document.createElement('a')
    link.href = `/api/download-certificate/${requestId}`
    link.download = `${request.type}_${requestId}.pdf`
    link.click()
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Submitted on {new Date(request.submittedDate).toLocaleDateString()}
            </p>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-3">{request.description}</p>
        {request.status === 'approved' && request.documentUrl && (
          <Button 
            size="sm" 
            onClick={() => downloadPDF(request.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        )}
        {request.feedback && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Feedback:</p>
            <p className="text-sm text-gray-600 mt-1">{request.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
