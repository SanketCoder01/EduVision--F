"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Calendar,
  AlertTriangle,
  Search,
  HelpCircle,
  MessageSquare,
  FileOutput,
  UserCheck,
  Award,
  FileQuestion,
  Code,
  FileEdit,
  Coffee,
  Wrench,
  Building2,
  ScrollText,
  ClipboardCheck,
} from "lucide-react"

interface Service {
  id: number
  title: string
  description: string
  icon: any
  color: string
  href: string
  badge?: string
  badgeColor?: string
}

const ServiceCard = ({ service }: { service: Service }) => {
  const Icon = service.icon

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
        {service.badge && (
          <Badge className={`mb-2 ${service.badgeColor}`}>{service.badge}</Badge>
        )}
        <p className="text-gray-500 text-sm mb-4">{service.description}</p>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`#${service.title.toLowerCase().replace(/\s+/g, '-')}`}>Learn More</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={service.href}>Access</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

const services: Service[] = [
  {
    id: 1,
    title: "Bonafide/Document Requests",
    description: "Review and approve student certificate and document requests",
    icon: ScrollText,
    color: "bg-blue-500",
    href: "/university/other-services/document-requests",
    badge: "Important",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    title: "Maintenance Complaints",
    description: "Manage and resolve campus maintenance issues reported by students",
    icon: Wrench,
    color: "bg-purple-500",
    href: "/university/other-services/maintenance",
  },
  {
    id: 3,
    title: "Grievance Portal",
    description: "Address student grievances and manage anti-ragging committee",
    icon: AlertTriangle,
    color: "bg-red-500",
    href: "/university/other-services/grievance",
  },
  {
    id: 4,
    title: "Application Tracker",
    description: "Monitor all student applications and their current status",
    icon: Search,
    color: "bg-yellow-500",
    href: "/university/other-services/tracker",
  },
  {
    id: 5,
    title: "Lost & Found",
    description: "Manage lost and found items reported by students and faculty",
    icon: HelpCircle,
    color: "bg-indigo-500",
    href: "/university/other-services/lost-found",
  },
  {
    id: 6,
    title: "Suggestion Box",
    description: "Review feedback and suggestions from students and faculty",
    icon: MessageSquare,
    color: "bg-teal-500",
    href: "/university/other-services/suggestion",
  },
  {
    id: 7,
    title: "Event Help Desk",
    description: "Manage event requests and resource allocations",
    icon: Calendar,
    color: "bg-amber-500",
    href: "/university/other-services/event-desk",
  },
  {
    id: 8,
    title: "Document Reissue",
    description: "Process requests for duplicate documents and certificates",
    icon: FileOutput,
    color: "bg-cyan-500",
    href: "/university/other-services/document-reissue",
  },
  {
    id: 9,
    title: "Background Verification",
    description: "Handle verification requests for alumni and current students",
    icon: UserCheck,
    color: "bg-orange-500",
    href: "/university/other-services/background-verification",
  },
  {
    id: 10,
    title: "Recommendation Letters",
    description: "Manage recommendation letter requests from students",
    icon: Award,
    color: "bg-pink-500",
    href: "/university/other-services/recommendation",
  },
  {
    id: 11,
    title: "Health Services",
    description: "Oversee campus health center operations and appointments",
    icon: FileQuestion,
    color: "bg-gray-500",
    href: "/university/other-services/health",
  },
  {
    id: 12,
    title: "Nearby Cafeteria",
    description: "Manage campus cafeteria listings, menus, and information",
    icon: Coffee,
    color: "bg-amber-500",
    href: "/university/other-services/cafeteria",
    badge: "New",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 13,
    title: "Hackathon",
    description: "Organize and manage hackathon events and registrations",
    icon: Code,
    color: "bg-violet-500",
    href: "/university/other-services/hackathon",
    badge: "New",
    badgeColor: "bg-violet-100 text-violet-700",
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
            <p className="text-gray-500 mt-1">Manage additional campus services and resources</p>
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
