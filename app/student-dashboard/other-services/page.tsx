"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Library,
  X
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
    href: "/student-dashboard/other-services/certificate",
    learnPoints: [
      "Request bonafide certificates for bank accounts, visa applications",
      "Apply for transfer certificates when leaving the institution",
      "Get internship letters for company requirements",
      "Track certificate status in real-time",
      "Typical processing time: 3-5 working days"
    ]
  },
  {
    id: 2,
    title: "Student Leave Application",
    description: "Submit leave applications through ERP with advance notice requirement",
    icon: ClipboardCheck,
    color: "bg-green-100 text-green-700",
    badge: "ERP Only",
    badgeColor: "bg-green-100 text-green-700",
    href: "/student-dashboard/other-services/leave",
    learnPoints: [
      "Submit leave applications at least 3 days in advance",
      "Medical leaves require doctor's certificate",
      "Emergency leaves need parent/guardian notification",
      "Track approval status from faculty and warden",
      "Maximum 10 leaves per semester allowed"
    ]
  },
  {
    id: 3,
    title: "Maintenance Complaints",
    description: "Report hostel, classroom, lab, or mess issues for resolution",
    icon: Wrench,
    color: "bg-purple-100 text-purple-700",
    href: "/student-dashboard/other-services/maintenance",
    learnPoints: [
      "Report electrical, plumbing, or furniture issues",
      "Upload photos as evidence for faster resolution",
      "Priority levels: Low, Medium, High, Critical",
      "Expected resolution: 24-72 hours based on priority",
      "Escalate unresolved complaints after 3 days"
    ]
  },
  {
    id: 4,
    title: "Grievance Portal",
    description: "Submit sensitive complaints with anonymous mode support",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700",
    href: "/student-dashboard/other-services/grievance",
    learnPoints: [
      "Submit academic, infrastructure, or faculty grievances",
      "Anonymous mode available for sensitive issues",
      "Track grievance status and resolution progress",
      "Assigned to concerned department within 24 hours",
      "Escalation to higher authorities if unresolved"
    ]
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
    href: "/student-dashboard/other-services/lost-found",
    learnPoints: [
      "Report lost items with description and location",
      "Upload photos for easier identification",
      "Browse found items reported by others",
      "Claim items after verification process",
      "Items unclaimed for 30 days are donated"
    ]
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
    href: "/student-dashboard/other-services/hackathon",
    learnPoints: [
      "Browse hackathons for your department and year",
      "Register teams with 2-5 members",
      "Store project files and resources in team workspace",
      "Real-time updates when new hackathons are posted",
      "Download posters and view prize details"
    ]
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
  const [learnDialogOpen, setLearnDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)

  const openLearnDialog = (service: any) => {
    setSelectedService(service)
    setLearnDialogOpen(true)
  }

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
                <ServiceCard key={service.id} service={service} onLearnMore={() => openLearnDialog(service)} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="featured" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} onLearnMore={() => openLearnDialog(service)} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Learn More Dialog */}
        <Dialog open={learnDialogOpen} onOpenChange={setLearnDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedService && (
                  <>
                    <div className={`p-2 rounded-lg ${selectedService.color}`}>
                      <selectedService.icon className="h-5 w-5" />
                    </div>
                    {selectedService.title}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>{selectedService?.description}</DialogDescription>
            </DialogHeader>
            
            {selectedService?.learnPoints && (
              <div className="mt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {selectedService.learnPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${selectedService.color.replace('bg-', 'bg-').replace('text-', 'bg-').split(' ')[0]}`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setLearnDialogOpen(false)}>Close</Button>
              <Link href={selectedService?.href || '#'}>
                <Button onClick={() => setLearnDialogOpen(false)}>Access Service</Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}

function ServiceCard({ service, onLearnMore }: { service: any; onLearnMore: () => void }) {
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
            <Button variant="ghost" size="sm" className="text-sm" onClick={onLearnMore}>
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
