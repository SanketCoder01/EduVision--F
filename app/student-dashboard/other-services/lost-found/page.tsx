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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AlertCircle,
  Calendar,
  Camera,
  Check,
  Clock,
  Eye,
  Filter,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Send,
  Tag,
  Upload
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const lostItems = [
  {
    id: "LF-2023-001",
    title: "Lost Student ID Card",
    category: "ID/Cards",
    location: "Central Library",
    date: "May 15, 2023",
    description: "Lost my student ID card with ID number ST12345 near the computer section of the central library.",
    status: "Lost",
    image: "/placeholder.jpg",
    contact: "John Doe | john.doe@example.com",
    comments: [
      {
        user: "Library Staff",
        date: "May 16, 2023",
        message: "We'll check our lost and found box and get back to you."
      }
    ]
  },
  {
    id: "LF-2023-008",
    title: "Found USB Drive",
    category: "Electronics",
    location: "Computer Lab 2",
    date: "May 18, 2023",
    description: "Found a 32GB SanDisk USB drive on desk #14 in Computer Lab 2. It has a blue keychain attached.",
    status: "Found",
    image: "/placeholder.jpg",
    contact: "Admin Staff | admin@example.com",
    comments: [
      {
        user: "Sarah Johnson",
        date: "May 18, 2023",
        message: "I think this might be mine. It has my class presentations on it. How can I collect it?"
      },
      {
        user: "Admin Staff",
        date: "May 18, 2023",
        message: "Please come to the admin office with your ID to verify and collect it."
      }
    ]
  },
  {
    id: "LF-2023-012",
    title: "Lost Calculator",
    category: "Study Materials",
    location: "Engineering Block, Room E204",
    date: "May 20, 2023",
    description: "Lost my Texas Instruments TI-84 Plus graphing calculator after the Calculus exam. It has my name written on the back.",
    status: "Matched",
    image: "/placeholder.jpg",
    contact: "Michael Chen | m.chen@example.com",
    comments: [
      {
        user: "Exam Proctor",
        date: "May 20, 2023",
        message: "A calculator was turned in after the exam. Please check with the department office."
      },
      {
        user: "Department Office",
        date: "May 21, 2023",
        message: "We have a TI-84 calculator with your name on it. You can collect it during office hours."
      },
      {
        user: "Michael Chen",
        date: "May 21, 2023",
        message: "Thank you! I'll come by tomorrow morning to pick it up."
      }
    ]
  },
  {
    id: "LF-2023-015",
    title: "Found Jacket",
    category: "Clothing",
    location: "Student Center Cafeteria",
    date: "May 22, 2023",
    description: "Found a black North Face jacket left on a chair in the cafeteria around 2 PM.",
    status: "Found",
    image: "/placeholder.jpg",
    contact: "Cafeteria Staff | cafeteria@example.com"
  }
]

const categories = [
  "All Categories",
  "ID/Cards",
  "Electronics",
  "Books/Notes",
  "Study Materials",
  "Clothing",
  "Accessories",
  "Keys",
  "Other"
]

const locations = [
  "All Locations",
  "Central Library",
  "Student Center",
  "Engineering Block",
  "Science Block",
  "Cafeteria",
  "Sports Complex",
  "Hostel/Dormitory",
  "Parking Area",
  "Other"
]

const statusOptions = [
  "All",
  "Lost",
  "Found",
  "Matched",
  "Claimed"
]

export default function LostFoundPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedStatus, setSelectedStatus] = useState("All")
  
  const filteredItems = lostItems.filter(
    (item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        item.category === selectedCategory
      
      const matchesLocation = 
        selectedLocation === "All Locations" || 
        item.location.includes(selectedLocation)
      
      const matchesStatus = 
        selectedStatus === "All" || 
        item.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesLocation && matchesStatus
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
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Package className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Lost & Found Portal</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Report lost items or submit found items to help reunite them with their owners</p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="browse">Browse Items</TabsTrigger>
            <TabsTrigger value="report-lost">Report Lost Item</TabsTrigger>
            <TabsTrigger value="report-found">Report Found Item</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Lost & Found Items</CardTitle>
                <CardDescription>Search through reported lost and found items</CardDescription>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by title, description, or ID..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          <span className="truncate">Category</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">Location</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[120px]">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                  <span className="ml-2 text-xs text-gray-500">{item.id}</span>
                                </div>
                                <p className="text-sm text-gray-600">Category: {item.category}</p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${
                                  item.status === "Found" ? "bg-green-100 text-green-700" :
                                  item.status === "Lost" ? "bg-red-100 text-red-700" :
                                  item.status === "Matched" ? "bg-blue-100 text-blue-700" :
                                  item.status === "Claimed" ? "bg-purple-100 text-purple-700" :
                                  "bg-gray-100 text-gray-700"
                                } border-0 mt-2 sm:mt-0`}
                              >
                                {item.status}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 mt-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {item.date}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.location}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                            
                            {item.comments && item.comments.length > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Comments ({item.comments.length})
                                </div>
                                <div className="space-y-2">
                                  {item.comments.slice(0, 1).map((comment, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                                      <div className="flex justify-between">
                                        <span className="font-medium">{comment.user}</span>
                                        <span className="text-gray-500">{comment.date}</span>
                                      </div>
                                      <p className="mt-1 text-gray-700">{comment.message}</p>
                                    </div>
                                  ))}
                                  {item.comments.length > 1 && (
                                    <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                                      View all {item.comments.length} comments
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                Contact: {item.contact}
                              </div>
                              <div className="flex gap-2">
                                {item.status === "Found" && (
                                  <Button size="sm" variant="outline" className="h-8 text-xs">
                                    This is Mine
                                  </Button>
                                )}
                                {item.status === "Lost" && (
                                  <Button size="sm" variant="outline" className="h-8 text-xs">
                                    I Found This
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" className="h-8 text-xs">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No items found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report-lost" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Report a Lost Item</CardTitle>
                <CardDescription>Provide details about the item you've lost</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
                      <Input placeholder="E.g., Student ID Card, Blue Backpack, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Seen Location</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.slice(1).map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Lost</label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                    <Textarea 
                      placeholder="Provide a detailed description of the item, including any identifying features, contents, or markings..."
                      className="resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center">
                        <Camera className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop an image here, or click to browse</p>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Your Name" />
                      <Input placeholder="Email or Phone Number" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Your contact information will be visible to administrators and the person who finds your item.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Submit Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="report-found" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Report a Found Item</CardTitle>
                <CardDescription>Provide details about the item you've found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
                      <Input placeholder="E.g., Student ID Card, Blue Backpack, etc." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Found Location</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.slice(1).map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Found</label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                    <Textarea 
                      placeholder="Provide a detailed description of the item, including any identifying features, contents, or markings..."
                      className="resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Note: For security reasons, please don't include all identifying details (e.g., full ID numbers, all card digits) so the true owner can verify ownership.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">Drag and drop an image here, or click to browse</p>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Item Status</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="with_me">I'm holding onto the item</SelectItem>
                        <SelectItem value="turned_in">Turned in to Lost & Found Office</SelectItem>
                        <SelectItem value="turned_in_other">Turned in to another department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Your Name" />
                      <Input placeholder="Email or Phone Number" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Your contact information will be visible to administrators and potentially the owner of the item.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Submit Report
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lost & Found Guidelines</CardTitle>
              <CardDescription>Important information about the lost and found process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Reporting Process</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Report lost or found items as soon as possible</li>
                    <li>Provide as much detail as possible to help with identification</li>
                    <li>Include clear images when available</li>
                    <li>Check the portal regularly for updates on your report</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Collection Process</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>All found items are stored at the Lost & Found Office (Student Center, Room 105)</li>
                    <li>Office hours: Monday-Friday, 9:00 AM - 4:00 PM</li>
                    <li>You must present your student ID to claim an item</li>
                    <li>You may be asked additional questions to verify ownership</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Retention Policy</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Low-value items are kept for 30 days</li>
                    <li>High-value items (electronics, wallets, etc.) are kept for 90 days</li>
                    <li>Official documents (IDs, passports) are kept for 180 days</li>
                    <li>Unclaimed items are donated to charity or disposed of after the retention period</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                  For urgent inquiries, contact the Lost & Found Office at 555-123-4567
                </div>
                <Button variant="outline" className="sm:w-auto">
                  View Full Policy
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
