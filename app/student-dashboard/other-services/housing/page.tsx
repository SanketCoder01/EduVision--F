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
  Building, 
  Calendar, 
  Clock, 
  FileText, 
  Home, 
  Info, 
  MapPin, 
  MessageSquare,
  Phone,
  Search,
  Users
} from "lucide-react"

const housingOptions = [
  {
    id: 1,
    name: "University Residence Hall",
    type: "On-Campus",
    image: "/placeholder.svg",
    location: "North Campus",
    distance: "On Campus",
    roomTypes: ["Single", "Double", "Suite"],
    amenities: ["Wi-Fi", "Laundry", "Study Rooms", "Dining Hall"],
    priceRange: "$3,500 - $5,000 per semester",
    availability: "Limited",
    description: "Traditional residence halls located on the north side of campus, close to academic buildings and dining facilities.",
  },
  {
    id: 2,
    name: "Campus Apartments",
    type: "On-Campus",
    image: "/placeholder.svg",
    location: "East Campus",
    distance: "On Campus",
    roomTypes: ["Studio", "1 Bedroom", "2 Bedroom"],
    amenities: ["Wi-Fi", "Laundry", "Fitness Center", "Parking"],
    priceRange: "$4,500 - $6,500 per semester",
    availability: "Available",
    description: "Modern apartment-style living on campus with private kitchens and bathrooms. Perfect for upperclassmen and graduate students.",
  },
  {
    id: 3,
    name: "The Lofts",
    type: "Off-Campus",
    image: "/placeholder.svg",
    location: "University District",
    distance: "0.5 miles from campus",
    roomTypes: ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"],
    amenities: ["Wi-Fi", "Laundry", "Gym", "Pool", "Study Lounge"],
    priceRange: "$700 - $1,200 per month",
    availability: "Available",
    description: "Modern off-campus apartments with a variety of floor plans and amenities. Located in the heart of the University District.",
  },
  {
    id: 4,
    name: "College View Townhomes",
    type: "Off-Campus",
    image: "/placeholder.svg",
    location: "College View",
    distance: "1 mile from campus",
    roomTypes: ["2 Bedroom", "3 Bedroom", "4 Bedroom"],
    amenities: ["Wi-Fi", "Laundry", "Parking", "Backyard"],
    priceRange: "$650 - $900 per month",
    availability: "Limited",
    description: "Spacious townhomes ideal for groups of students looking to share housing costs. Quiet neighborhood with easy access to campus shuttle.",
  },
]

const roommates = [
  {
    id: 1,
    name: "Alex Johnson",
    image: "/placeholder.svg",
    year: "Junior",
    major: "Computer Science",
    preferences: ["Non-smoker", "Early riser", "Quiet study environment"],
    location: "Looking for off-campus apartment",
    budget: "$600 - $800 per month",
    bio: "Hi! I'm a CS major looking for a roommate for next semester. I'm clean, quiet, and respectful of shared spaces. I enjoy gaming and hiking on weekends.",
  },
  {
    id: 2,
    name: "Jamie Smith",
    image: "/placeholder.svg",
    year: "Sophomore",
    major: "Business Administration",
    preferences: ["Non-smoker", "Social", "Pet-friendly"],
    location: "Interested in The Lofts or similar",
    budget: "$700 - $900 per month",
    bio: "Looking for a roommate who is social but also respects study time. I have a small, well-behaved cat. I enjoy cooking and watching movies.",
  },
  {
    id: 3,
    name: "Taylor Williams",
    image: "/placeholder.svg",
    year: "Senior",
    major: "Psychology",
    preferences: ["Clean", "Quiet after 10pm", "LGBTQ+ friendly"],
    location: "Anywhere close to campus",
    budget: "$500 - $700 per month",
    bio: "Senior year! Looking for a drama-free living situation. I'm tidy, respectful, and pretty quiet. I work part-time at the campus bookstore.",
  },
]

const housingResources = [
  {
    id: 1,
    title: "Housing Guide",
    description: "Comprehensive guide to on and off-campus housing options, including costs, amenities, and application processes.",
    icon: FileText,
  },
  {
    id: 2,
    title: "Roommate Agreement Template",
    description: "Download a template to establish clear expectations with your roommates about shared spaces, guests, quiet hours, and more.",
    icon: Users,
  },
  {
    id: 3,
    title: "Tenant Rights Information",
    description: "Learn about your rights as a tenant, including lease agreements, security deposits, and maintenance responsibilities.",
    icon: Info,
  },
  {
    id: 4,
    title: "Campus Map & Housing Locations",
    description: "Interactive map showing the locations of all on-campus housing and popular off-campus housing areas.",
    icon: MapPin,
  },
]

export default function HousingAccommodationPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredHousing = housingOptions.filter(
    (option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Home className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Housing & Accommodation</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">On-campus housing, off-campus options, and roommate matching</p>
          </div>
        </div>

        <Tabs defaultValue="housing" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="housing">Housing Options</TabsTrigger>
            <TabsTrigger value="roommates">Find Roommates</TabsTrigger>
            <TabsTrigger value="resources">Housing Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="housing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Housing</CardTitle>
                <CardDescription>Browse on-campus and off-campus housing options</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, type, or location..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredHousing.length > 0 ? (
                    filteredHousing.map((housing) => (
                      <motion.div
                        key={housing.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-1/4 mb-4 md:mb-0">
                            <div className="rounded-lg overflow-hidden bg-gray-100 h-48">
                              <img 
                                src={housing.image} 
                                alt={housing.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">{housing.name}</h3>
                              <Badge
                                variant="outline"
                                className={`${housing.type === "On-Campus" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"} border-0 mt-1 sm:mt-0`}
                              >
                                {housing.type}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              {housing.location} • {housing.distance}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{housing.description}</p>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500">ROOM TYPES</p>
                                <p className="text-sm">{housing.roomTypes.join(", ")}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">PRICE RANGE</p>
                                <p className="text-sm">{housing.priceRange}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">AMENITIES</p>
                                <p className="text-sm">{housing.amenities.join(", ")}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">AVAILABILITY</p>
                                <p className="text-sm">{housing.availability}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <Button variant="outline" size="sm" className="text-xs mr-2">
                                View Details
                              </Button>
                              <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">
                                Apply Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No housing options found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roommates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Roommates</CardTitle>
                <CardDescription>Connect with potential roommates for on or off-campus housing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roommates.map((roommate) => (
                    <motion.div
                      key={roommate.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/6">
                          <Avatar className="h-20 w-20 rounded-full">
                            <AvatarImage src={roommate.image} alt={roommate.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {roommate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{roommate.name}</h3>
                            <div className="flex items-center mt-1 sm:mt-0">
                              <Badge className="bg-gray-100 text-gray-700 border-0 mr-2">
                                {roommate.year}
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-700 border-0">
                                {roommate.major}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-2">{roommate.bio}</p>
                          
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500">PREFERENCES</p>
                              <p className="text-sm">{roommate.preferences.join(", ")}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">LOCATION</p>
                              <p className="text-sm">{roommate.location}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">BUDGET</p>
                              <p className="text-sm">{roommate.budget}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button variant="outline" size="sm" className="text-xs mr-2">
                              View Profile
                            </Button>
                            <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="mt-6 flex justify-center">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Your Roommate Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Housing Resources</CardTitle>
                <CardDescription>Helpful guides and information for your housing search</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {housingResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                          <resource.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{resource.description}</p>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs">
                          View Resource
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Housing Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Need assistance with housing applications, roommate conflicts, or lease questions? Contact the Housing Support Office for help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Housing Support
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call (555) 123-4567
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
