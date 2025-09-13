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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Calendar,
  Clock, 
  Code,
  ExternalLink,
  Globe,
  Laptop,
  MapPin,
  Search,
  Trophy,
  Users,
  Zap
} from "lucide-react"
import Link from "next/link"

// Mock data for hackathons
const hackathons = [
  {
    id: "HACK-2024-001",
    title: "EduTech Innovation Challenge",
    status: "Upcoming",
    startDate: "2024-02-15",
    endDate: "2024-02-17",
    registrationDeadline: "2024-02-10",
    location: "Virtual",
    description: "A 48-hour hackathon focused on developing innovative solutions for educational technology challenges. Open to all students and faculty members.",
    theme: "Educational Technology",
    prizes: ["₹50,000", "₹30,000", "₹20,000"],
    maxTeamSize: 4,
    registrationFee: "Free",
    organizer: "Computer Science Department",
    technologies: ["React", "Node.js", "Python", "AI/ML", "Blockchain"],
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    registered: false,
    totalRegistrations: 156
  },
  {
    id: "HACK-2024-002", 
    title: "Smart Campus Solutions",
    status: "Registration Open",
    startDate: "2024-03-01",
    endDate: "2024-03-03",
    registrationDeadline: "2024-02-25",
    location: "Main Campus Auditorium",
    description: "Build innovative solutions to make our campus smarter and more efficient. Focus on IoT, automation, and sustainability.",
    theme: "Smart Campus & IoT",
    prizes: ["₹75,000", "₹45,000", "₹25,000"],
    maxTeamSize: 5,
    registrationFee: "₹500 per team",
    organizer: "Electronics & Telecommunication Department",
    technologies: ["IoT", "Arduino", "Raspberry Pi", "Mobile Apps", "Cloud"],
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    registered: true,
    totalRegistrations: 89
  },
  {
    id: "HACK-2024-003",
    title: "FinTech Revolution",
    status: "Completed",
    startDate: "2024-01-10",
    endDate: "2024-01-12",
    registrationDeadline: "2024-01-05",
    location: "Virtual",
    description: "Develop next-generation financial technology solutions. Focus on digital payments, blockchain, and financial inclusion.",
    theme: "Financial Technology",
    prizes: ["₹1,00,000", "₹60,000", "₹40,000"],
    maxTeamSize: 4,
    registrationFee: "Free",
    organizer: "Information Technology Department",
    technologies: ["Blockchain", "React", "Node.js", "Python", "APIs"],
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    registered: false,
    totalRegistrations: 234,
    winner: "Team CodeCrafters - Digital Wallet with AI Fraud Detection"
  },
  {
    id: "HACK-2024-004",
    title: "Healthcare Innovation Hub",
    status: "Registration Closed",
    startDate: "2024-02-20",
    endDate: "2024-02-22",
    registrationDeadline: "2024-02-15",
    location: "Medical College Campus",
    description: "Create innovative healthcare solutions using technology. Focus on telemedicine, health monitoring, and medical AI.",
    theme: "Healthcare Technology",
    prizes: ["₹80,000", "₹50,000", "₹30,000"],
    maxTeamSize: 6,
    registrationFee: "₹300 per team",
    organizer: "Biomedical Engineering Department",
    technologies: ["AI/ML", "Mobile Apps", "IoT", "Data Analytics", "Cloud"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    registered: false,
    totalRegistrations: 145
  }
]

export default function StudentHackathonPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null)

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = 
      hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.organizer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || hackathon.status.toLowerCase().replace(/\s+/g, '') === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleRegister = async (hackathonId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Registration Successful!",
        description: "You have been registered for the hackathon. Check your email for details.",
      })
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error registering for the hackathon. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming": return "bg-blue-100 text-blue-700"
      case "Registration Open": return "bg-green-100 text-green-700"
      case "Registration Closed": return "bg-yellow-100 text-yellow-700"
      case "Completed": return "bg-gray-100 text-gray-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Link href="/student-dashboard/other-services">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
                <Code className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Hackathons</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Participate in coding competitions and innovation challenges</p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="browse">Browse Hackathons</TabsTrigger>
            <TabsTrigger value="registered">My Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Hackathons</CardTitle>
                <CardDescription>Discover and register for upcoming hackathons</CardDescription>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search hackathons by title, theme, or organizer..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "upcoming" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("upcoming")}
                    >
                      Upcoming
                    </Button>
                    <Button
                      variant={statusFilter === "registrationopen" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("registrationopen")}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredHackathons.map((hackathon) => (
                    <motion.div
                      key={hackathon.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
                        <div className="relative">
                          <img
                            src={hackathon.image}
                            alt={hackathon.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className={getStatusColor(hackathon.status)}>
                              {hackathon.status}
                            </Badge>
                          </div>
                          {hackathon.registered && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-green-600 text-white">
                                Registered
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                          <CardDescription>{hackathon.theme}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {hackathon.startDate} - {hackathon.endDate}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {hackathon.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {hackathon.totalRegistrations} registered • Max team: {hackathon.maxTeamSize}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Trophy className="h-4 w-4 mr-2" />
                            Prizes: {hackathon.prizes.join(", ")}
                          </div>
                          
                          <p className="text-sm text-gray-700 line-clamp-2">{hackathon.description}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {hackathon.technologies.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {hackathon.technologies.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{hackathon.technologies.length - 3} more
                              </Badge>
                            )}
                          </div>

                          {hackathon.winner && (
                            <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center text-sm text-yellow-800">
                                <Trophy className="h-4 w-4 mr-2" />
                                Winner: {hackathon.winner}
                              </div>
                            </div>
                          )}

                          <Separator className="my-3" />
                          
                          <div className="flex justify-between items-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedHackathon(hackathon)}
                                >
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{selectedHackathon?.title}</DialogTitle>
                                  <DialogDescription>
                                    {selectedHackathon?.theme}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedHackathon && (
                                  <div className="space-y-4">
                                    <img
                                      src={selectedHackathon.image}
                                      alt={selectedHackathon.title}
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                                        <p className="text-sm text-gray-900">{selectedHackathon.startDate}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">End Date</label>
                                        <p className="text-sm text-gray-900">{selectedHackathon.endDate}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Registration Deadline</label>
                                        <p className="text-sm text-gray-900">{selectedHackathon.registrationDeadline}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Location</label>
                                        <p className="text-sm text-gray-900">{selectedHackathon.location}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Max Team Size</label>
                                        <p className="text-sm text-gray-900">{selectedHackathon.maxTeamSize} members</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Registration Fee</label>
                                        <p className="text-sm text-gray-900">{selectedHackathon.registrationFee}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Description</label>
                                      <p className="text-sm text-gray-900 mt-1">{selectedHackathon.description}</p>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Organizer</label>
                                      <p className="text-sm text-gray-900 mt-1">{selectedHackathon.organizer}</p>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Prize Pool</label>
                                      <div className="flex gap-2 mt-1">
                                        {selectedHackathon.prizes.map((prize: string, index: number) => (
                                          <Badge key={index} className="bg-yellow-100 text-yellow-800">
                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {prize}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Technologies</label>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedHackathon.technologies.map((tech: string) => (
                                          <Badge key={tech} variant="outline" className="text-xs">
                                            {tech}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {hackathon.status === "Registration Open" && !hackathon.registered && (
                              <Button
                                size="sm"
                                className="bg-violet-600 hover:bg-violet-700"
                                onClick={() => handleRegister(hackathon.id)}
                              >
                                Register Now
                              </Button>
                            )}
                            
                            {hackathon.registered && (
                              <Button size="sm" variant="outline" className="text-green-600 border-green-200">
                                Registered ✓
                              </Button>
                            )}

                            {hackathon.status === "Upcoming" && (
                              <Button size="sm" variant="outline" disabled>
                                <Clock className="h-4 w-4 mr-1" />
                                Coming Soon
                              </Button>
                            )}

                            {hackathon.status === "Registration Closed" && (
                              <Button size="sm" variant="outline" disabled>
                                Registration Closed
                              </Button>
                            )}

                            {hackathon.status === "Completed" && (
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Results
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {filteredHackathons.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No hackathons found matching your criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registered" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Registrations</CardTitle>
                <CardDescription>Track your registered hackathons and submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hackathons.filter(h => h.registered).map((hackathon) => (
                    <div key={hackathon.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{hackathon.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{hackathon.theme}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {hackathon.startDate} - {hackathon.endDate}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {hackathon.location}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(hackathon.status)}>
                          {hackathon.status}
                        </Badge>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Submit Project
                        </Button>
                        <Button variant="outline" size="sm">
                          Team Management
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {hackathons.filter(h => h.registered).length === 0 && (
                    <div className="py-8 text-center">
                      <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">You haven't registered for any hackathons yet.</p>
                      <Button className="mt-4" onClick={() => (document.querySelector('[value="browse"]') as HTMLElement)?.click()}>
                        Browse Hackathons
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
