"use client"

import { useState } from "react"
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
    title: "Student Leave Application",
    description: "Submit leave applications through ERP with advance notice requirement",
    icon: ClipboardCheck,
    color: "bg-green-100 text-green-700",
    badge: "ERP Only",
    badgeColor: "bg-green-100 text-green-700",
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
    id: 11,
    title: "Recommendation Letters",
    description: "Request letters of recommendation from faculty members",
    icon: Award,
    color: "bg-pink-100 text-pink-700",
    href: "/student-dashboard/other-services/recommendation"
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
    id: 15,
    title: "Nearby Cafeteria",
    description: "View menus, timings and locations of campus cafeterias",
    icon: Coffee,
    color: "bg-amber-100 text-amber-700",
    href: "/student-dashboard/other-services/cafeteria"
  },
]

export default function OtherServicesPage() {
  const [activeTab, setActiveTab] = useState("all")

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
            <p className="text-gray-500 mt-1">Access additional campus services and resources</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="featured" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
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
