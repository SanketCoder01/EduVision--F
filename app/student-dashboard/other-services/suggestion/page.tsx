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
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertCircle,
  BarChart3,
  Check,
  ChevronDown,
  Clock,
  Eye,
  Filter,
  Flag,
  Lightbulb,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Star,
  ThumbsUp,
  User
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const feedbackItems = [
  {
    id: "FB-2023-001",
    title: "Improve Library Hours During Exam Week",
    category: "Facilities",
    subcategory: "Library",
    date: "May 10, 2023",
    description: "The library should extend its hours during exam weeks. Currently it closes at 8 PM, but many students need to study late into the night. Extending hours until midnight would be very helpful.",
    status: "Under Review",
    anonymous: false,
    upvotes: 42,
    comments: [
      {
        user: "Admin",
        date: "May 12, 2023",
        message: "Thank you for your suggestion. We're discussing this with the library staff and will update you soon."
      }
    ],
    author: {
      name: "Alex Johnson",
      avatar: "/avatars/01.png",
      department: "Computer Science"
    }
  },
  {
    id: "FB-2023-008",
    title: "More Vegetarian Options in Cafeteria",
    category: "Food Services",
    subcategory: "Menu Options",
    date: "May 15, 2023",
    description: "There are very limited vegetarian options in the cafeteria. It would be great to have more variety beyond just salads and the occasional pasta dish. Many students are vegetarian or trying to reduce meat consumption.",
    status: "In Progress",
    anonymous: true,
    upvotes: 38,
    comments: [
      {
        user: "Food Services Manager",
        date: "May 16, 2023",
        message: "We appreciate your feedback. We're working with our chefs to develop new vegetarian menu items that will be introduced next month."
      },
      {
        user: "Anonymous",
        date: "May 16, 2023",
        message: "Thank you for considering this! Looking forward to the new options."
      }
    ],
    author: {
      name: "Anonymous",
      avatar: null,
      department: "Anonymous"
    }
  },
  {
    id: "FB-2023-012",
    title: "More Power Outlets in Lecture Halls",
    category: "Facilities",
    subcategory: "Classrooms",
    date: "May 18, 2023",
    description: "Most of the lecture halls have very few power outlets, making it difficult for students to keep their laptops charged during long classes. Adding more outlets, especially in the older buildings, would be very helpful.",
    status: "Implemented",
    anonymous: false,
    upvotes: 56,
    comments: [
      {
        user: "Facilities Manager",
        date: "May 20, 2023",
        message: "We've scheduled installations of additional power outlets in Halls A, B, and C during the summer break. Thank you for bringing this to our attention."
      },
      {
        user: "Facilities Manager",
        date: "June 30, 2023",
        message: "Update: The installation has been completed in all three lecture halls. Each row now has access to power outlets."
      }
    ],
    author: {
      name: "Samantha Lee",
      avatar: "/avatars/03.png",
      department: "Engineering"
    }
  },
  {
    id: "FB-2023-015",
    title: "Improve WiFi in Dormitories",
    category: "IT Services",
    subcategory: "Network",
    date: "May 22, 2023",
    description: "The WiFi in the East Campus dormitories is very unreliable, especially during peak hours. It's affecting our ability to complete online assignments and attend virtual classes.",
    status: "Pending",
    anonymous: false,
    upvotes: 78,
    comments: [],
    author: {
      name: "Michael Chen",
      avatar: "/avatars/04.png",
      department: "Business Administration"
    }
  }
]

const categories = [
  "All Categories",
  "Academics",
  "Facilities",
  "Food Services",
  "IT Services",
  "Student Activities",
  "Administration",
  "Faculty",
  "Other"
]

const subcategories = {
  "Academics": ["Course Content", "Teaching Methods", "Scheduling", "Exams", "Resources"],
  "Facilities": ["Classrooms", "Library", "Labs", "Sports Complex", "Common Areas", "Dormitories"],
  "Food Services": ["Menu Options", "Pricing", "Quality", "Service", "Hours"],
  "IT Services": ["Network", "Software", "Hardware", "Support", "Website"],
  "Student Activities": ["Clubs", "Events", "Funding", "Participation"],
  "Administration": ["Policies", "Procedures", "Communication", "Support Services"],
  "Faculty": ["Teaching", "Availability", "Feedback", "Support"],
  "Other": ["General"]
}

const statusOptions = [
  "All",
  "Pending",
  "Under Review",
  "In Progress",
  "Implemented",
  "Declined"
]

export default function SuggestionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedSubcategory, setSelectedSubcategory] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  const filteredItems = feedbackItems.filter(
    (item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        item.category === selectedCategory
      
      const matchesSubcategory = 
        selectedSubcategory === "All" || 
        item.subcategory === selectedSubcategory
      
      const matchesStatus = 
        selectedStatus === "All" || 
        item.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus
    }
  )

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    setSelectedSubcategory("All")
  }

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
                <Lightbulb className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Suggestion Box & Feedback Hub</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Share your ideas and feedback to help improve our institution</p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="browse">Browse Suggestions</TabsTrigger>
            <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
            <TabsTrigger value="analytics">Feedback Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Browse Suggestions & Feedback</CardTitle>
                <CardDescription>View and interact with feedback from the community</CardDescription>
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
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
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
                    
                    <Select 
                      value={selectedSubcategory} 
                      onValueChange={setSelectedSubcategory}
                      disabled={selectedCategory === "All Categories"}
                    >
                      <SelectTrigger className="w-[150px]">
                        <div className="flex items-center">
                          <ChevronDown className="h-4 w-4 mr-2" />
                          <span className="truncate">Subcategory</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Subcategories</SelectItem>
                        {selectedCategory !== "All Categories" && 
                          subcategories[selectedCategory]?.map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[120px]">
                        <div className="flex items-center">
                          <Flag className="h-4 w-4 mr-2" />
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
                        <div className="flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-900">{item.title}</h3>
                              <span className="ml-2 text-xs text-gray-500">{item.id}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                item.status === "Implemented" ? "bg-green-100 text-green-700" :
                                item.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                item.status === "Under Review" ? "bg-amber-100 text-amber-700" :
                                item.status === "Pending" ? "bg-gray-100 text-gray-700" :
                                item.status === "Declined" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              } border-0 mt-2 sm:mt-0`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.date}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Filter className="h-3 w-3 mr-1" />
                              {item.category} &gt; {item.subcategory}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {item.upvotes} upvotes
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                              {item.anonymous ? (
                                <div className="flex items-center">
                                  <div className="bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                                    <User className="h-3 w-3 text-gray-500" />
                                  </div>
                                  <span className="text-xs text-gray-500">Anonymous</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={item.author.avatar} alt={item.author.name} />
                                    <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-700">{item.author.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">({item.author.department})</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Upvote
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Comment
                              </Button>
                            </div>
                          </div>
                          
                          {item.comments && item.comments.length > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center text-xs font-medium text-gray-700 mb-2">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Comments ({item.comments.length})
                              </div>
                              <div className="space-y-2">
                                {item.comments.map((comment, index) => (
                                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="flex justify-between">
                                      <span className="font-medium">{comment.user}</span>
                                      <span className="text-gray-500">{comment.date}</span>
                                    </div>
                                    <p className="mt-1 text-gray-700">{comment.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No suggestions found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Feedback</CardTitle>
                <CardDescription>Share your suggestions, ideas, or concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Title</label>
                    <Input placeholder="Enter a clear, concise title for your feedback" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                      <Select disabled={selectedCategory === "All Categories"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCategory !== "All Categories" && 
                            subcategories[selectedCategory]?.map((subcategory) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                    <Textarea 
                      placeholder="Describe your suggestion, idea, or concern in detail. Be specific and constructive..."
                      className="resize-none"
                      rows={5}
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="anonymous"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Submit Anonymously
                      </label>
                      <p className="text-xs text-gray-500">
                        Your name and department will not be displayed with your feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Analytics</CardTitle>
                <CardDescription>View trends and statistics about feedback submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Total Suggestions</h3>
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mt-2">124</p>
                      <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Implementation Rate</h3>
                        <div className="p-2 rounded-full bg-green-100 text-green-600">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mt-2">38%</p>
                      <p className="text-xs text-green-600 mt-1">+5% from last month</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Avg. Response Time</h3>
                        <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                          <Clock className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mt-2">3.2 days</p>
                      <p className="text-xs text-red-600 mt-1">+0.5 days from last month</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback by Category</h3>
                    <div className="space-y-2">
                      {[
                        { category: "Facilities", count: 42, percentage: 34 },
                        { category: "Academics", count: 28, percentage: 23 },
                        { category: "Food Services", count: 22, percentage: 18 },
                        { category: "IT Services", count: 18, percentage: 14 },
                        { category: "Other", count: 14, percentage: 11 }
                      ].map((item) => (
                        <div key={item.category} className="">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700">{item.category}</span>
                            <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback Status Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { status: "Pending", count: 32, color: "bg-gray-500" },
                        { status: "Under Review", count: 45, color: "bg-amber-500" },
                        { status: "In Progress", count: 28, color: "bg-blue-500" },
                        { status: "Implemented", count: 47, color: "bg-green-500" },
                        { status: "Declined", count: 12, color: "bg-red-500" }
                      ].map((item) => (
                        <div key={item.status} className="p-3 border rounded-lg text-center">
                          <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-1`}></div>
                          <p className="text-xs font-medium text-gray-700">{item.status}</p>
                          <p className="text-lg font-bold">{item.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Top Trending Suggestions</h3>
                    <div className="space-y-2">
                      {[
                        { title: "Improve WiFi in Dormitories", upvotes: 78 },
                        { title: "More Power Outlets in Lecture Halls", upvotes: 56 },
                        { title: "Extend Library Hours During Exams", upvotes: 42 },
                        { title: "More Vegetarian Options in Cafeteria", upvotes: 38 },
                        { title: "Add Covered Bicycle Parking", upvotes: 35 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2 text-xs font-medium">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{item.title}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {item.upvotes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Guidelines & Policies</CardTitle>
              <CardDescription>Important information about our feedback process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Submission Guidelines</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Be specific and constructive in your feedback</li>
                    <li>Focus on solutions rather than just problems</li>
                    <li>Avoid personal attacks or naming specific individuals</li>
                    <li>Provide context and examples when possible</li>
                    <li>One suggestion per submission for better tracking</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Review Process</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>All submissions are reviewed by the appropriate department</li>
                    <li>Initial review typically takes 3-5 business days</li>
                    <li>You'll receive updates when your suggestion status changes</li>
                    <li>Popular suggestions (high upvotes) receive priority review</li>
                    <li>Implementation decisions are based on feasibility, impact, and resources</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Anonymity Policy</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>You can choose to submit feedback anonymously</li>
                    <li>Anonymous submissions are still reviewed with equal consideration</li>
                    <li>For sensitive issues, consider using the Grievance Portal instead</li>
                    <li>Note: We cannot provide direct responses to anonymous submissions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                  For urgent matters, please contact the Student Affairs Office directly
                </div>
                <Button variant="outline" className="sm:w-auto">
                  View Full Feedback Policy
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
