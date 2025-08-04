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
  AlertCircle,
  Calendar, 
  Check,
  Clock, 
  Filter,
  Loader2,
  MessageSquare,
  Search,
  Eye,
  ArrowLeft,
  ArrowUpDown,
  MapPin,
  Tag,
  Phone,
  Mail,
  Image,
  X,
  Plus
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function LostFoundPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [replyText, setReplyText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortField, setSortField] = useState("reportDate")
  const [sortDirection, setSortDirection] = useState("desc")
  const [activeTab, setActiveTab] = useState("lost")
  
  // Form state for adding new item
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [itemTitle, setItemTitle] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemLocation, setItemLocation] = useState("")
  const [itemDate, setItemDate] = useState("")
  const [itemImage, setItemImage] = useState("")
  const [itemContactName, setItemContactName] = useState("")
  const [itemContactEmail, setItemContactEmail] = useState("")
  const [itemContactPhone, setItemContactPhone] = useState("")
  const [itemType, setItemType] = useState("lost")
  
  // Mock data for lost items - in a real app this would come from an API
  const [lostItems, setLostItems] = useState([
    {
      id: "LOST-2023-001",
      title: "Blue Laptop Bag",
      description: "A navy blue laptop bag with a Dell XPS 15 laptop inside. Also contains charger and some notebooks.",
      category: "Electronics",
      location: "Central Library, 2nd Floor",
      reportDate: "2023-05-10",
      reportTime: "14:30",
      status: "Pending",
      reportedBy: {
        id: "STU2023025",
        name: "Rahul Sharma",
        type: "Student",
        department: "Computer Science & Engineering",
        email: "rahul.s@university.edu",
        phone: "+91 9876543210"
      },
      images: ["/lost-found/laptop-bag.jpg"],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-10 15:45",
          text: "Report received. We will check the lost and found collection.",
          internal: false
        }
      ]
    },
    {
      id: "LOST-2023-002",
      title: "Silver Wristwatch",
      description: "A silver Fossil wristwatch with a brown leather strap. It has sentimental value as it was a gift.",
      category: "Accessories",
      location: "Sports Complex, Changing Room",
      reportDate: "2023-05-08",
      reportTime: "18:15",
      status: "Found",
      reportedBy: {
        id: "STU2023056",
        name: "Priya Patel",
        type: "Student",
        department: "Artificial Intelligence & Data Science",
        email: "priya.p@university.edu",
        phone: "+91 9876543211"
      },
      foundDate: "2023-05-09",
      foundTime: "10:30",
      foundBy: "Security Staff",
      foundLocation: "Sports Complex Lost & Found Box",
      images: ["/lost-found/wristwatch.jpg"],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-08 19:00",
          text: "Report received. We will check the lost and found collection.",
          internal: false
        },
        {
          user: "Security Office",
          time: "2023-05-09 10:45",
          text: "A watch matching this description has been found in the Sports Complex. Please contact the security office to identify and collect it.",
          internal: false
        },
        {
          user: "Priya Patel",
          time: "2023-05-09 14:20",
          text: "Thank you! I will come to collect it today.",
          internal: false
        },
        {
          user: "Security Office",
          time: "2023-05-09 17:30",
          text: "Item has been collected by the owner after verification.",
          internal: true
        }
      ]
    },
    {
      id: "LOST-2023-003",
      title: "Student ID Card",
      description: "University ID card for Arjun Singh, ID: STU2023089.",
      category: "Documents",
      location: "Cafeteria",
      reportDate: "2023-05-05",
      reportTime: "13:45",
      status: "Claimed",
      reportedBy: {
        id: "STU2023089",
        name: "Arjun Singh",
        type: "Student",
        department: "Cyber Security",
        email: "arjun.s@university.edu",
        phone: "+91 9876543212"
      },
      foundDate: "2023-05-06",
      foundTime: "09:30",
      foundBy: "Cafeteria Staff",
      foundLocation: "Cafeteria Counter",
      claimedDate: "2023-05-06",
      claimedTime: "14:15",
      images: ["/lost-found/id-card.jpg"],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-05 14:30",
          text: "Report received. We will check the lost and found collection.",
          internal: false
        },
        {
          user: "Admin Office",
          time: "2023-05-06 10:15",
          text: "Your ID card has been found at the Cafeteria. You can collect it from the Admin Office after verification.",
          internal: false
        },
        {
          user: "Arjun Singh",
          time: "2023-05-06 11:30",
          text: "Thank you! I will come to collect it today.",
          internal: false
        },
        {
          user: "Admin Office",
          time: "2023-05-06 14:30",
          text: "ID card has been collected by the owner after verification.",
          internal: true
        }
      ]
    }
  ])
  
  // Mock data for found items - in a real app this would come from an API
  const [foundItems, setFoundItems] = useState([
    {
      id: "FOUND-2023-001",
      title: "Black Wallet",
      description: "A black leather wallet containing some cash, credit cards, and an ID card for Neha Gupta.",
      category: "Personal Items",
      location: "Lecture Hall B, Room 203",
      reportDate: "2023-05-12",
      reportTime: "16:45",
      status: "Pending",
      reportedBy: {
        id: "FAC2023015",
        name: "Dr. Rajesh Kumar",
        type: "Faculty",
        department: "Computer Science & Engineering",
        email: "rajesh.k@university.edu",
        phone: "+91 9876543220"
      },
      currentLocation: "Admin Office Lost & Found",
      images: ["/lost-found/wallet.jpg"],
      comments: [
        {
          user: "Admin Office",
          time: "2023-05-12 17:15",
          text: "Item received and stored in the lost and found collection. We will try to identify the owner from the ID card.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-12 17:30",
          text: "Owner identified as Neha Gupta (STU2023112). Attempting to contact her.",
          internal: true
        }
      ]
    },
    {
      id: "FOUND-2023-002",
      title: "USB Flash Drive",
      description: "A 32GB SanDisk USB flash drive, red and black in color.",
      category: "Electronics",
      location: "Computer Lab 3",
      reportDate: "2023-05-11",
      reportTime: "11:30",
      status: "Claimed",
      reportedBy: {
        id: "STU2023102",
        name: "Vikram Mehta",
        type: "Student",
        department: "Electronics & Communication",
        email: "vikram.m@university.edu",
        phone: "+91 9876543215"
      },
      currentLocation: "IT Department",
      claimedDate: "2023-05-13",
      claimedTime: "14:30",
      claimedBy: "Ananya Desai (STU2023078)",
      images: ["/lost-found/usb-drive.jpg"],
      comments: [
        {
          user: "IT Department",
          time: "2023-05-11 12:15",
          text: "USB drive received. We will store it safely.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-12 10:30",
          text: "Announcement made about the found USB drive.",
          internal: true
        },
        {
          user: "IT Department",
          time: "2023-05-13 13:45",
          text: "A student named Ananya Desai has claimed ownership of the USB drive. She will come to collect it today.",
          internal: true
        },
        {
          user: "IT Department",
          time: "2023-05-13 14:45",
          text: "USB drive has been collected by Ananya Desai after verification of contents.",
          internal: true
        }
      ]
    },
    {
      id: "FOUND-2023-003",
      title: "Textbook - Advanced Machine Learning",
      description: "A textbook on Advanced Machine Learning by Dr. Samantha Chen, 3rd Edition. Has some handwritten notes inside.",
      category: "Books",
      location: "Central Library, Study Area",
      reportDate: "2023-05-09",
      reportTime: "18:30",
      status: "Unclaimed",
      reportedBy: {
        id: "LIB2023005",
        name: "Meera Joshi",
        type: "Staff",
        department: "Library",
        email: "meera.j@university.edu",
        phone: "+91 9876543225"
      },
      currentLocation: "Central Library Lost & Found",
      images: ["/lost-found/textbook.jpg"],
      comments: [
        {
          user: "Library Staff",
          time: "2023-05-09 18:45",
          text: "Book added to the library's lost and found collection.",
          internal: true
        },
        {
          user: "Admin Office",
          time: "2023-05-10 10:15",
          text: "Announcement made about the found textbook.",
          internal: true
        },
        {
          user: "Library Staff",
          time: "2023-05-15 16:30",
          text: "Book remains unclaimed. Will keep in lost and found for 30 days as per policy.",
          internal: true
        }
      ]
    }
  ])

  // Combine and filter items based on active tab, search, and filters
  const getFilteredItems = () => {
    const items = activeTab === "lost" ? lostItems : foundItems
    
    return items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "All" || item.status === statusFilter
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }

  // Sort filtered items
  const getSortedItems = () => {
    const filteredItems = getFilteredItems()
    
    return [...filteredItems].sort((a, b) => {
      let valueA, valueB
      
      if (sortField === "reportDate") {
        valueA = new Date(`${a.reportDate} ${a.reportTime || "00:00"}`).getTime()
        valueB = new Date(`${b.reportDate} ${b.reportTime || "00:00"}`).getTime()
      } else {
        valueA = a[sortField as keyof typeof a] || ""
        valueB = b[sortField as keyof typeof b] || ""
      }
      
      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })
  }

  const handleViewItem = (item: any) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const handleSendReply = () => {
    if (!selectedItem || !replyText.trim()) return
    
    // In a real application, this would send the reply to an API
    const newComment = {
      user: "University Admin",
      time: new Date().toLocaleString(),
      text: replyText,
      internal: false
    }
    
    if (activeTab === "lost") {
      const updatedItems = lostItems.map(item => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            comments: item.comments ? [...item.comments, newComment] : [newComment]
          }
        }
        return item
      })
      
      setLostItems(updatedItems)
      
      // Update the selected item to show the new comment
      const updatedItem = updatedItems.find(item => item.id === selectedItem.id)
      if (updatedItem) setSelectedItem(updatedItem)
    } else {
      const updatedItems = foundItems.map(item => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            comments: item.comments ? [...item.comments, newComment] : [newComment]
          }
        }
        return item
      })
      
      setFoundItems(updatedItems)
      
      // Update the selected item to show the new comment
      const updatedItem = updatedItems.find(item => item.id === selectedItem.id)
      if (updatedItem) setSelectedItem(updatedItem)
    }
    
    setReplyText("")
    alert(`Reply sent regarding ${selectedItem.id}`)
  }

  const handleStatusChange = (itemId: string, newStatus: string) => {
    const isLostItem = itemId.startsWith("LOST")
    
    if (isLostItem) {
      const updatedItems = lostItems.map(item => {
        if (item.id === itemId) {
          const statusUpdateComment = {
            user: "University Admin",
            time: new Date().toLocaleString(),
            text: `Status updated to ${newStatus}`,
            internal: true
          }
          
          const updates: any = {
            status: newStatus,
            comments: item.comments ? [...item.comments, statusUpdateComment] : [statusUpdateComment]
          }
          
          if (newStatus === "Found") {
            updates.foundDate = new Date().toLocaleDateString()
            updates.foundTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            updates.foundBy = "University Admin"
            updates.foundLocation = "Admin Office Lost & Found"
          } else if (newStatus === "Claimed") {
            updates.claimedDate = new Date().toLocaleDateString()
            updates.claimedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
          
          return {
            ...item,
            ...updates
          }
        }
        return item
      })
      
      setLostItems(updatedItems)
      
      // If we're viewing this item, update the selected item too
      if (selectedItem && selectedItem.id === itemId) {
        const updatedItem = updatedItems.find(item => item.id === itemId)
        if (updatedItem) setSelectedItem(updatedItem)
      }
    } else {
      const updatedItems = foundItems.map(item => {
        if (item.id === itemId) {
          const statusUpdateComment = {
            user: "University Admin",
            time: new Date().toLocaleString(),
            text: `Status updated to ${newStatus}`,
            internal: true
          }
          
          const updates: any = {
            status: newStatus,
            comments: item.comments ? [...item.comments, statusUpdateComment] : [statusUpdateComment]
          }
          
          if (newStatus === "Claimed") {
            updates.claimedDate = new Date().toLocaleDateString()
            updates.claimedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            updates.claimedBy = "Claimed by University Admin"
          }
          
          return {
            ...item,
            ...updates
          }
        }
        return item
      })
      
      setFoundItems(updatedItems)
      
      // If we're viewing this item, update the selected item too
      if (selectedItem && selectedItem.id === itemId) {
        const updatedItem = updatedItems.find(item => item.id === itemId)
        if (updatedItem) setSelectedItem(updatedItem)
      }
    }
    
    alert(`Status updated to ${newStatus} for item ${itemId}`)
  }
  
  const handleAddItem = () => {
    if (!itemTitle || !itemDescription || !itemCategory || !itemLocation || !itemDate) {
      alert("Please fill in all required fields")
      return
    }
    
    const now = new Date()
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    if (itemType === "lost") {
      const newItem = {
        id: `LOST-${now.getFullYear()}-${String(lostItems.length + 1).padStart(3, '0')}`,
        title: itemTitle,
        description: itemDescription,
        category: itemCategory,
        location: itemLocation,
        reportDate: itemDate,
        reportTime: formattedTime,
        status: "Pending",
        reportedBy: {
          id: "ADMIN001",
          name: "University Admin",
          type: "Staff",
          department: "Administration",
          email: itemContactEmail || "admin@university.edu",
          phone: itemContactPhone || "+91 9876543200"
        },
        images: itemImage ? [itemImage] : [],
        comments: [
          {
            user: "University Admin",
            time: now.toLocaleString(),
            text: "Item reported as lost and added to the system.",
            internal: true
          }
        ]
      }
      
      setLostItems([newItem, ...lostItems])
    } else {
      const newItem = {
        id: `FOUND-${now.getFullYear()}-${String(foundItems.length + 1).padStart(3, '0')}`,
        title: itemTitle,
        description: itemDescription,
        category: itemCategory,
        location: itemLocation,
        reportDate: itemDate,
        reportTime: formattedTime,
        status: "Unclaimed",
        reportedBy: {
          id: "ADMIN001",
          name: "University Admin",
          type: "Staff",
          department: "Administration",
          email: itemContactEmail || "admin@university.edu",
          phone: itemContactPhone || "+91 9876543200"
        },
        currentLocation: "Admin Office Lost & Found",
        images: itemImage ? [itemImage] : [],
        comments: [
          {
            user: "University Admin",
            time: now.toLocaleString(),
            text: "Item reported as found and added to the system.",
            internal: true
          }
        ]
      }
      
      setFoundItems([newItem, ...foundItems])
    }
    
    // Reset form
    setItemTitle("")
    setItemDescription("")
    setItemCategory("")
    setItemLocation("")
    setItemDate("")
    setItemImage("")
    setItemContactName("")
    setItemContactEmail("")
    setItemContactPhone("")
    setIsAddItemDialogOpen(false)
    
    alert(`New ${itemType} item added successfully`)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new sort field and default to descending
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const statusColors: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "Found": "bg-green-100 text-green-800",
    "Claimed": "bg-blue-100 text-blue-800",
    "Unclaimed": "bg-purple-100 text-purple-800",
  }

  const categories = [
    "All",
    "Electronics",
    "Books",
    "Documents",
    "Accessories",
    "Personal Items",
    "Clothing",
    "Others"
  ]

  const statuses = activeTab === "lost" 
    ? ["All", "Pending", "Found", "Claimed"] 
    : ["All", "Pending", "Unclaimed", "Claimed"]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/university/other-services">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Lost & Found Portal</h1>
            </div>
            <p className="text-gray-500">Manage lost and found items reported by students and faculty</p>
          </div>
          <Button onClick={() => setIsAddItemDialogOpen(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter {activeTab} items by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by title, ID, description, or location..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" className="w-full" onClick={() => {
                      setSearchQuery("")
                      setStatusFilter("All")
                      setCategoryFilter("All")
                    }}>
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{activeTab === "lost" ? "Lost" : "Found"} Items</CardTitle>
                <CardDescription>
                  {getSortedItems().length} items found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("id")}
                          >
                            ID
                            {sortField === "id" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("title")}
                          >
                            Item
                            {sortField === "title" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("category")}
                          >
                            Category
                            {sortField === "category" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("location")}
                          >
                            Location
                            {sortField === "location" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("reportDate")}
                          >
                            Report Date
                            {sortField === "reportDate" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Reported By
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900"
                            onClick={() => handleSort("status")}
                          >
                            Status
                            {sortField === "status" && (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedItems().length > 0 ? (
                        getSortedItems().map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">{item.id}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {item.images && item.images.length > 0 ? (
                                  <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={item.images[0]} 
                                      alt={item.title} 
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = "https://placehold.co/40x40?text=No+Image"
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                                    <Image className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {item.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                {item.location}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                {item.reportDate}
                                <Clock className="h-3 w-3 ml-1 text-gray-400" />
                                {item.reportTime}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{item.reportedBy.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-medium">{item.reportedBy.name}</p>
                                  <p className="text-xs text-gray-500">{item.reportedBy.type}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={statusColors[item.status]}>{item.status}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewItem(item)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Filter className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {activeTab === "lost" ? (
                                      <>
                                        <DropdownMenuItem onClick={() => handleStatusChange(item.id, "Found")}>
                                          Mark as Found
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(item.id, "Claimed")}>
                                          Mark as Claimed
                                        </DropdownMenuItem>
                                      </>
                                    ) : (
                                      <>
                                        <DropdownMenuItem onClick={() => handleStatusChange(item.id, "Unclaimed")}>
                                          Mark as Unclaimed
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(item.id, "Claimed")}>
                                          Mark as Claimed
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-gray-500">
                            No items found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Item Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    {selectedItem.id.startsWith("LOST") ? "Lost" : "Found"} Item Details
                  </DialogTitle>
                  <DialogDescription>
                    Item ID: {selectedItem.id}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Item Information</h3>
                    
                    {/* Item Images */}
                    {selectedItem.images && selectedItem.images.length > 0 && (
                      <div className="mb-4">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          <img 
                            src={selectedItem.images[0]} 
                            alt={selectedItem.title} 
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "https://placehold.co/400x300?text=No+Image"
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Title</p>
                        <p className="text-base font-medium">{selectedItem.title}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-base">{selectedItem.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Category</p>
                          <Badge variant="outline" className="mt-1">{selectedItem.category}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <Badge className={`${statusColors[selectedItem.status]} mt-1`}>{selectedItem.status}</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location Reported</p>
                        <p className="text-base">{selectedItem.location}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Report Date</p>
                          <p className="text-base">{selectedItem.reportDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Report Time</p>
                          <p className="text-base">{selectedItem.reportTime}</p>
                        </div>
                      </div>
                      
                      {selectedItem.foundDate && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Found Date</p>
                            <p className="text-base">{selectedItem.foundDate}</p>
                          </div>
                          {selectedItem.foundTime && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Found Time</p>
                              <p className="text-base">{selectedItem.foundTime}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedItem.foundBy && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Found By</p>
                          <p className="text-base">{selectedItem.foundBy}</p>
                        </div>
                      )}
                      
                      {selectedItem.foundLocation && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Found Location</p>
                          <p className="text-base">{selectedItem.foundLocation}</p>
                        </div>
                      )}
                      
                      {selectedItem.currentLocation && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Current Location</p>
                          <p className="text-base">{selectedItem.currentLocation}</p>
                        </div>
                      )}
                      
                      {selectedItem.claimedDate && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Claimed Date</p>
                            <p className="text-base">{selectedItem.claimedDate}</p>
                          </div>
                          {selectedItem.claimedTime && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Claimed Time</p>
                              <p className="text-base">{selectedItem.claimedTime}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedItem.claimedBy && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Claimed By</p>
                          <p className="text-base">{selectedItem.claimedBy}</p>
                        </div>
                      )}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-medium mb-4">Reporter Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{selectedItem.reportedBy.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedItem.reportedBy.name}</p>
                          <p className="text-sm text-gray-500">{selectedItem.reportedBy.type} - {selectedItem.reportedBy.department}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a href={`mailto:${selectedItem.reportedBy.email}`} className="text-blue-600 hover:underline">
                              {selectedItem.reportedBy.email}
                            </a>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a href={`tel:${selectedItem.reportedBy.phone}`} className="text-blue-600 hover:underline">
                              {selectedItem.reportedBy.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Comments/Communication History */}
                    <h3 className="text-lg font-medium mb-4">Communication History</h3>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-[400px] overflow-y-auto">
                      {selectedItem.comments && selectedItem.comments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedItem.comments.map((comment: any, index: number) => (
                            <div 
                              key={index} 
                              className={`rounded-lg p-3 shadow-sm ${comment.internal ? 'bg-yellow-50 border border-yellow-100' : 'bg-white'}`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium flex items-center gap-1">
                                  {comment.internal && (
                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">Internal Note</span>
                                  )}
                                  {comment.user}
                                </p>
                                <p className="text-xs text-gray-500">{comment.time}</p>
                              </div>
                              <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No communication history available</p>
                      )}
                    </div>

                    {/* Reply Form */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">Send Reply</h4>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="internal-note" className="rounded text-blue-600" />
                          <label htmlFor="internal-note" className="text-sm">Internal Note Only</label>
                        </div>
                      </div>
                      <Textarea 
                        placeholder="Type your response here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[120px]"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <div className="space-x-2">
                          {selectedItem.id.startsWith("LOST") ? (
                            <>
                              <Button 
                                variant="outline" 
                                onClick={() => handleStatusChange(selectedItem.id, "Found")}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Found
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleStatusChange(selectedItem.id, "Claimed")}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Claimed
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                onClick={() => handleStatusChange(selectedItem.id, "Unclaimed")}
                              >
                                <Loader2 className="h-4 w-4 mr-2" />
                                Mark as Unclaimed
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => handleStatusChange(selectedItem.id, "Claimed")}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Claimed
                              </Button>
                            </>
                          )}
                        </div>
                        <Button 
                          onClick={handleSendReply}
                          disabled={!replyText.trim()}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Add Item Dialog */}
        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Add a new lost or found item to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="item-type" className="text-sm font-medium">Item Type*</label>
                  <Select value={itemType} onValueChange={setItemType}>
                    <SelectTrigger id="item-type">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lost">Lost Item</SelectItem>
                      <SelectItem value="found">Found Item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="item-category" className="text-sm font-medium">Category*</label>
                  <Select value={itemCategory} onValueChange={setItemCategory}>
                    <SelectTrigger id="item-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "All").map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="item-title" className="text-sm font-medium">Title*</label>
                <Input 
                  id="item-title" 
                  value={itemTitle} 
                  onChange={(e) => setItemTitle(e.target.value)} 
                  placeholder="Brief title of the item"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="item-description" className="text-sm font-medium">Description*</label>
                <Textarea 
                  id="item-description" 
                  value={itemDescription} 
                  onChange={(e) => setItemDescription(e.target.value)} 
                  placeholder="Detailed description of the item"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="item-location" className="text-sm font-medium">Location*</label>
                  <Input 
                    id="item-location" 
                    value={itemLocation} 
                    onChange={(e) => setItemLocation(e.target.value)} 
                    placeholder="Where the item was lost/found"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="item-date" className="text-sm font-medium">Date*</label>
                  <Input 
                    id="item-date" 
                    type="date"
                    value={itemDate} 
                    onChange={(e) => setItemDate(e.target.value)} 
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="item-image" className="text-sm font-medium">Image URL (Optional)</label>
                <Input 
                  id="item-image" 
                  value={itemImage} 
                  onChange={(e) => setItemImage(e.target.value)} 
                  placeholder="URL to an image of the item"
                />
              </div>
              
              <Separator />
              
              <h4 className="text-sm font-medium">Contact Information (Optional)</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                  <Input 
                    id="contact-name" 
                    value={itemContactName} 
                    onChange={(e) => setItemContactName(e.target.value)} 
                    placeholder="Contact name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="contact-email" 
                    type="email"
                    value={itemContactEmail} 
                    onChange={(e) => setItemContactEmail(e.target.value)} 
                    placeholder="Contact email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contact-phone" className="text-sm font-medium">Phone</label>
                  <Input 
                    id="contact-phone" 
                    value={itemContactPhone} 
                    onChange={(e) => setItemContactPhone(e.target.value)} 
                    placeholder="Contact phone"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}
