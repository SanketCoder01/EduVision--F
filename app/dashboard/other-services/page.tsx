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
  Coffee,
  Library,
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
    title: "Grievance Portal",
    description: "Submit and manage faculty grievances with confidentiality",
    icon: AlertTriangle,
    color: "bg-red-500",
    href: "/dashboard/other-services/grievance",
    badge: "Important",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    id: 2,
    title: "Lost & Found",
    description: "Report lost items or submit found items for matching",
    icon: HelpCircle,
    color: "bg-indigo-500",
    href: "/dashboard/other-services/lost-found",
  },
  {
    id: 3,
    title: "Hackathon",
    description: "Organize and participate in coding competitions",
    icon: Code,
    color: "bg-violet-500",
    href: "/dashboard/other-services/hackathon",
    badge: "New",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    id: 4,
    title: "Student Leave Applications",
    description: "Review and approve student leave requests submitted through ERP",
    icon: UserCheck,
    color: "bg-green-500",
    href: "/dashboard/other-services/student-leave",
    badge: "ERP",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: 5,
    title: "Nearby Cafeteria",
    description: "View menus, timings and locations of campus cafeterias",
    icon: Coffee,
    color: "bg-amber-500",
    href: "/dashboard/other-services/cafeteria",
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
