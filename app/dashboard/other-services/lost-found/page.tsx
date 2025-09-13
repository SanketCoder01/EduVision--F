"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Search, Filter, MapPin, Calendar as CalendarIcon2, Clock, User, Phone, Mail, Info, ThumbsUp, Eye, AlertTriangle, ArrowLeft, Upload, Camera, Plus } from "lucide-react"

// Mock data for lost and found items
const mockItems = [
  {
    id: 1,
    title: "Black Laptop Bag",
    category: "Electronics Accessories",
    location: "Engineering Building, Room 204",
    date: "2023-11-15",
    description: "A black laptop bag with a Dell laptop inside. Found after the Advanced Programming class.",
    status: "Found",
    image: "/placeholder.svg?height=200&width=200",
    contact: {
      name: "",
      email: "",
      phone: "",
    },
    comments: [
      {
        user: "Admin",
        time: "2023-11-15 15:30",
        text: "Item has been stored in the Lost & Found office. Can be collected with proper identification.",
        isPrivate: false,
      },
    ],
  },
  {
    id: 2,
    title: "Blue Water Bottle",
    category: "Personal Items",
    location: "Library, 2nd Floor",
    date: "2023-11-14",
    description: "A blue metal water bottle with university logo. Left on a study table.",
    status: "Found",
    image: "/placeholder.svg?height=200&width=200",
    contact: {
      name: "",
      email: "",
      phone: "",
    },
    comments: [],
  },
  {
    id: 3,
    title: "Student ID Card",
    category: "Documents",
    location: "Student Center",
    date: "2023-11-16",
    description: "Lost my student ID card somewhere in the student center during lunch hours.",
    status: "Lost",
    image: "",
    contact: {
      name: "",
      email: "",
      phone: "",
    },
    comments: [
      {
        user: "Lost & Found Office",
        time: "2023-11-16 14:45",
        text: "A student ID was turned in today. Please visit the office to verify if it's yours.",
        isPrivate: false,
      },
    ],
  },
  {
    id: 4,
    title: "Graphing Calculator",
    category: "Electronics",
    location: "Science Building, Room 105",
    date: "2023-11-13",
    description: "TI-84 Plus graphing calculator. Lost during the Calculus exam.",
    status: "Lost",
    image: "",
    contact: {
      name: "",
      email: "",
      phone: "",
    },
    comments: [],
  },
  {
    id: 5,
    title: "Wireless Earbuds",
    category: "Electronics",
    location: "Gym",
    date: "2023-11-12",
    description: "White wireless earbuds in a charging case. Found near the treadmills.",
    status: "Found",
    image: "/placeholder.svg?height=200&width=200",
    contact: {
      name: "",
      email: "",
      phone: "",
    },
    comments: [],
  },
  {
    id: 6,
    title: "Textbook - Data Structures",
    category: "Books",
    location: "Computer Lab",
    date: "2023-11-10",
    description: "Lost my Data Structures and Algorithms textbook. It has my name written on the first page.",
    status: "Lost",
    image: "",
    contact: {
      name: "",
      email: "",
      phone: "",
    },
    comments: [],
  },
]

// Categories and locations for filtering
const categories = [
  "All Categories",
  "Electronics",
  "Electronics Accessories",
  "Books",
  "Documents",
  "Clothing",
  "Personal Items",
  "Jewelry",
  "Keys",
  "Other",
]

const locations = [
  "All Locations",
  "Library",
  "Student Center",
  "Engineering Building",
  "Science Building",
  "Arts Building",
  "Cafeteria",
  "Gym",
  "Dormitories",
  "Parking Lot",
  "Other",
]

export default function LostFoundPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("browse")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [claimingItem, setClaimingItem] = useState<any>(null)

  // Form states for reporting lost/found items
  const [itemTitle, setItemTitle] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemLocation, setItemLocation] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemImage, setItemImage] = useState<File | null>(null)
  const [itemImagePreview, setItemImagePreview] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [itemStatus, setItemStatus] = useState("Found")
  const [reporterName, setReporterName] = useState("")
  const [reporterDepartment, setReporterDepartment] = useState("")
  const [reporterPhone, setReporterPhone] = useState("")
  const [reporterEmail, setReporterEmail] = useState("")

  // Claim form states
  const [claimerName, setClaimerName] = useState("")
  const [claimerEmail, setClaimerEmail] = useState("")
  const [claimerPhone, setClaimerPhone] = useState("")
  const [claimerDepartment, setClaimerDepartment] = useState("")
  const [claimDescription, setClaimDescription] = useState("")

  // Filter items based on search query, category, location, and status
  const filteredItems = mockItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory
    const matchesLocation = selectedLocation === "All Locations" || item.location.includes(selectedLocation)
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesLocation && matchesStatus
  })

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setItemImage(file)
      setItemImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle image removal
  const handleRemoveImage = () => {
    setItemImage(null)
    setItemImagePreview("")
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent, formType: string) => {
    e.preventDefault()
    
    // Validate required fields
    if (!itemTitle || !itemCategory || !itemLocation || !itemDescription || !reporterName || !reporterDepartment || !reporterPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including reporter contact details.",
        variant: "destructive"
      })
      return
    }

    // In a real application, this would send data to a backend
    toast({
      title: "Success",
      description: `${formType} report submitted successfully! You will be contacted if there's a match.`,
    })
    
    // Reset form
    setItemTitle("")
    setItemCategory("")
    setItemLocation("")
    setItemDescription("")
    setItemImage(null)
    setItemImagePreview("")
    setContactName("")
    setContactEmail("")
    setContactPhone("")
    setReporterName("")
    setReporterDepartment("")
    setReporterPhone("")
    setReporterEmail("")
    setDate(undefined)
    setActiveTab("browse")
  }

  // Handle claim submission
  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!claimerName || !claimerEmail || !claimerPhone || !claimerDepartment || !claimDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to claim this item.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Claim Submitted",
      description: "Your claim has been submitted. The reporter will be contacted to verify and arrange pickup.",
    })
    
    // Reset claim form
    setClaimerName("")
    setClaimerEmail("")
    setClaimerPhone("")
    setClaimerDepartment("")
    setClaimDescription("")
    setShowClaimDialog(false)
    setClaimingItem(null)
  }

  // Handle item claim
  const handleClaimItem = (item: any) => {
    setClaimingItem(item)
    setShowClaimDialog(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/other-services')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Other Services
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lost & Found Portal</h1>
            <p className="text-gray-500 mt-1">Report lost items or submit found items for matching</p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="browse">Browse Items</TabsTrigger>
            <TabsTrigger value="report-lost">Report a Lost Item</TabsTrigger>
            <TabsTrigger value="report-found">Report a Found Item</TabsTrigger>
          </TabsList>

          {/* Browse Items Tab */}
          <TabsContent value="browse" className="mt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search for items..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Category" />
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
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Location" />
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
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                    <SelectItem value="Found">Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="relative">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <Info size={40} className="text-gray-300" />
                        </div>
                      )}
                      <Badge
                        className={`absolute top-2 right-2 ${item.status === "Found" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{item.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Badge variant="outline" className="mr-2">{item.category}</Badge>
                        <span className="flex items-center">
                          <CalendarIcon2 size={14} className="mr-1" />
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-start mb-2">
                        <MapPin size={16} className="text-gray-400 mr-1 mt-0.5" />
                        <p className="text-sm text-gray-600">{item.location}</p>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>
                      
                      {item.comments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-2">Latest Update:</p>
                          <div className="flex items-start">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="text-xs">{item.comments[0].user[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <p className="text-xs font-medium">{item.comments[0].user}</p>
                                <p className="text-xs text-gray-500 ml-2">{item.comments[0].time}</p>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{item.comments[0].text}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      {item.status === "Found" ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleClaimItem(item)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" /> This is Mine
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs">
                          <ThumbsUp className="h-3 w-3 mr-1" /> I Found This
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <AlertTriangle className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">No items found matching your criteria.</p>
                  <p className="text-gray-400 text-sm text-center mt-1">Try adjusting your filters or search terms.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Report a Lost Item Tab */}
          <TabsContent value="report-lost" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Report a Lost Item</CardTitle>
                <CardDescription>
                  Please provide as much detail as possible to help us locate your item.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Lost item")} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-title">Item Title *</Label>
                        <Input
                          id="item-title"
                          placeholder="e.g., Black Laptop Bag"
                          value={itemTitle}
                          onChange={(e) => setItemTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item-category">Category *</Label>
                        <Select value={itemCategory} onValueChange={setItemCategory} required>
                          <SelectTrigger id="item-category">
                            <SelectValue placeholder="Select a category" />
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

                      <div className="space-y-2">
                        <Label htmlFor="last-seen">Last Seen Location *</Label>
                        <Select value={itemLocation} onValueChange={setItemLocation} required>
                          <SelectTrigger id="last-seen">
                            <SelectValue placeholder="Select a location" />
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

                      <div className="space-y-2">
                        <Label htmlFor="date-lost">Date Lost *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Provide a detailed description of the item, including any identifying features..."
                          className="min-h-[120px]"
                          value={itemDescription}
                          onChange={(e) => setItemDescription(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image">Image (Optional)</Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                          {itemImagePreview ? (
                            <div className="relative">
                              <img
                                src={itemImagePreview}
                                alt="Preview"
                                className="mx-auto max-h-[150px] rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={handleRemoveImage}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">Upload an image of the item</p>
                              <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("image")?.click()}
                              >
                                Choose File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Reporter Contact Information *</Label>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center space-x-2">
                            <User size={16} className="text-gray-400" />
                            <Input
                              placeholder="Your Full Name"
                              value={reporterName}
                              onChange={(e) => setReporterName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail size={16} className="text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Email Address"
                              value={reporterEmail}
                              onChange={(e) => setReporterEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone size={16} className="text-gray-400" />
                            <Input
                              type="tel"
                              placeholder="Phone Number"
                              value={reporterPhone}
                              onChange={(e) => setReporterPhone(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Select value={reporterDepartment} onValueChange={setReporterDepartment} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Your Department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                                <SelectItem value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</SelectItem>
                                <SelectItem value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</SelectItem>
                                <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                                <SelectItem value="Faculty">Faculty</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("browse")}>Cancel</Button>
                    <Button type="submit">Submit Report</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report a Found Item Tab */}
          <TabsContent value="report-found" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Report a Found Item</CardTitle>
                <CardDescription>
                  Thank you for reporting a found item. Please provide details to help us return it to its owner.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Found item")} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="found-item-title">Item Title *</Label>
                        <Input
                          id="found-item-title"
                          placeholder="e.g., Black Laptop Bag"
                          value={itemTitle}
                          onChange={(e) => setItemTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="found-item-category">Category *</Label>
                        <Select value={itemCategory} onValueChange={setItemCategory} required>
                          <SelectTrigger id="found-item-category">
                            <SelectValue placeholder="Select a category" />
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

                      <div className="space-y-2">
                        <Label htmlFor="found-location">Found Location *</Label>
                        <Select value={itemLocation} onValueChange={setItemLocation} required>
                          <SelectTrigger id="found-location">
                            <SelectValue placeholder="Select a location" />
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

                      <div className="space-y-2">
                        <Label htmlFor="date-found">Date Found *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item-status">Current Item Status *</Label>
                        <Select value={itemStatus} onValueChange={setItemStatus} required>
                          <SelectTrigger id="item-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Found">I have the item</SelectItem>
                            <SelectItem value="Submitted">Submitted to Lost & Found Office</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="found-description">Description *</Label>
                        <Textarea
                          id="found-description"
                          placeholder="Provide a detailed description of the item. Note: For security reasons, don't include all identifying details."
                          className="min-h-[120px]"
                          value={itemDescription}
                          onChange={(e) => setItemDescription(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="found-image">Image (Optional)</Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                          {itemImagePreview ? (
                            <div className="relative">
                              <img
                                src={itemImagePreview}
                                alt="Preview"
                                className="mx-auto max-h-[150px] rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={handleRemoveImage}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-500 mb-2">Upload an image of the item</p>
                              <Input
                                id="found-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("found-image")?.click()}
                              >
                                Choose File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Reporter Contact Information *</Label>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center space-x-2">
                            <User size={16} className="text-gray-400" />
                            <Input
                              placeholder="Your Full Name"
                              value={reporterName}
                              onChange={(e) => setReporterName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail size={16} className="text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Email Address"
                              value={reporterEmail}
                              onChange={(e) => setReporterEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone size={16} className="text-gray-400" />
                            <Input
                              type="tel"
                              placeholder="Phone Number"
                              value={reporterPhone}
                              onChange={(e) => setReporterPhone(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Select value={reporterDepartment} onValueChange={setReporterDepartment} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Your Department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                                <SelectItem value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</SelectItem>
                                <SelectItem value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</SelectItem>
                                <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                                <SelectItem value="Faculty">Faculty</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("browse")}>Cancel</Button>
                    <Button type="submit">Submit Report</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Lost & Found Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Lost & Found Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reporting Process</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Report lost or found items as soon as possible using the appropriate form.</li>
                <li>Provide as much detail as possible to help with identification and matching.</li>
                <li>Include clear images when available, but avoid sharing all identifying details for security.</li>
                <li>All reports are reviewed by the Lost & Found office within 24 hours.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Collection Process</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Items can be collected from the Lost & Found office during operating hours (Mon-Fri, 9am-5pm).</li>
                <li>Proper identification and verification will be required to claim items.</li>
                <li>For valuable items, additional verification steps may be necessary.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Retention Policy</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Low-value items are kept for 30 days before being donated or disposed of.</li>
                <li>Valuable items (electronics, jewelry, etc.) are kept for 90 days.</li>
                <li>Official documents (IDs, passports, etc.) are kept for 90 days before being returned to the issuing authority.</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <div className="flex items-start">
                <Info className="text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-700">Contact Information</h4>
                  <p className="text-sm text-blue-600 mt-1">For urgent inquiries about lost or found items, please contact the Lost & Found office:</p>
                  <p className="text-sm text-blue-600 mt-2">Email: lostfound@university.edu</p>
                  <p className="text-sm text-blue-600">Phone: (555) 123-4567</p>
                  <p className="text-sm text-blue-600">Location: Student Center, Room 102</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claim Item Dialog */}
        <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Claim Item: {claimingItem?.title}</DialogTitle>
              <DialogDescription>
                Please provide your details to claim this item. The reporter will be contacted to verify and arrange pickup.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimer-name">Full Name *</Label>
                  <Input
                    id="claimer-name"
                    placeholder="Your full name"
                    value={claimerName}
                    onChange={(e) => setClaimerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimer-email">Email Address *</Label>
                  <Input
                    id="claimer-email"
                    type="email"
                    placeholder="your.email@sanjivani.edu.in"
                    value={claimerEmail}
                    onChange={(e) => setClaimerEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimer-phone">Phone Number *</Label>
                  <Input
                    id="claimer-phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={claimerPhone}
                    onChange={(e) => setClaimerPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimer-department">Department *</Label>
                  <Select value={claimerDepartment} onValueChange={setClaimerDepartment} required>
                    <SelectTrigger id="claimer-department">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                      <SelectItem value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</SelectItem>
                      <SelectItem value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</SelectItem>
                      <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                      <SelectItem value="Faculty">Faculty</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="claim-description">Why do you believe this item is yours? *</Label>
                <Textarea
                  id="claim-description"
                  placeholder="Provide specific details about the item that prove it belongs to you (e.g., unique features, contents, purchase details, etc.)"
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={16} />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your claim will be sent to the person who found this item. They will contact you directly to verify ownership and arrange pickup. 
                      Please ensure all information is accurate and be prepared to provide additional proof of ownership if requested.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowClaimDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Claim
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Item Details Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedItem?.title}</DialogTitle>
              <DialogDescription>
                {selectedItem?.category} • {selectedItem?.location} • {selectedItem && new Date(selectedItem.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-6">
                {/* Item Image */}
                {selectedItem.image && (
                  <div className="flex justify-center">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      className="max-w-full max-h-64 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-4">
                  <Badge className={`${
                    selectedItem.status === "Found" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {selectedItem.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Reported on {new Date(selectedItem.date).toLocaleDateString()}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedItem.description}</p>
                </div>

                {/* Location Details */}
                <div>
                  <h3 className="font-semibold mb-2">Location Details</h3>
                  <div className="flex items-center text-gray-700">
                    <MapPin size={16} className="mr-2" />
                    {selectedItem.location}
                  </div>
                </div>

                {/* Comments/Updates */}
                {selectedItem.comments && selectedItem.comments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Updates & Comments</h3>
                    <div className="space-y-3">
                      {selectedItem.comments.map((comment: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{comment.user}</span>
                            <span className="text-xs text-gray-500">{comment.time}</span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  {selectedItem.status === "Found" ? (
                    <Button 
                      onClick={() => {
                        setSelectedItem(null)
                        handleClaimItem(selectedItem)
                      }}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Claim This Item
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      I Found This Item
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
