"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Camera, Plus, Edit, Trash2, Clock, MapPin, Phone, Star, Eye, Utensils, ChefHat, Building, X } from "lucide-react"

interface MenuItem {
  id: number
  name: string
  price: number
  image: string
  category: string
  description?: string
}

interface Cafeteria {
  id: number
  name: string
  address: string
  contactNo: string
  openTime: string
  closeTime: string
  rating: number
  totalReviews: number
  images: string[]
  menuItems: MenuItem[]
  createdBy: string
  department: string
}

// Mock data for existing cafeterias
const mockCafeterias: Cafeteria[] = [
  {
    id: 1,
    name: "Campus Central Cafeteria",
    address: "Main Building, Ground Floor, Sanjivani College",
    contactNo: "+91 9876543210",
    openTime: "07:00",
    closeTime: "21:00",
    rating: 4.2,
    totalReviews: 156,
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ],
    menuItems: [
      {
        id: 1,
        name: "Veg Thali",
        price: 80,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Main Course",
        description: "Complete vegetarian meal with rice, dal, vegetables, roti, and dessert"
      },
      {
        id: 2,
        name: "Chicken Biryani", 
        price: 120,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Main Course",
        description: "Aromatic basmati rice cooked with tender chicken pieces"
      }
    ],
    createdBy: "Dr. Rajesh Kumar",
    department: "Computer Science Engineering"
  },
  {
    id: 2,
    name: "Engineering Block Canteen",
    address: "Engineering Block, First Floor, Sanjivani College",
    contactNo: "+91 9876543211",
    openTime: "08:00",
    closeTime: "20:00",
    rating: 3.8,
    totalReviews: 89,
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ],
    menuItems: [
      {
        id: 3,
        name: "Pav Bhaji",
        price: 50,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Snacks",
        description: "Spicy vegetable curry served with buttered bread rolls"
      }
    ],
    createdBy: "Prof. Priya Sharma",
    department: "Artificial Intelligence & Data Science"
  }
]

export default function CafeteriaManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState<'browse' | 'add'>('browse')
  
  // Form states for creating new cafeteria
  const [cafeteriaName, setCafeteriaName] = useState("")
  const [cafeteriaAddress, setCafeteriaAddress] = useState("")
  const [contactNo, setContactNo] = useState("")
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")
  const [cafeteriaDescription, setCafeteriaDescription] = useState("")
  const [cafeteriaImages, setCafeteriaImages] = useState<File[]>([])
  const [cafeteriaImagePreviews, setCafeteriaImagePreviews] = useState<string[]>([])
  
  // Menu item states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: null as File | null,
    imagePreview: ""
  })

  // Handle image upload for cafeteria
  const handleCafeteriaImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setCafeteriaImages(prev => [...prev, ...files])
      
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setCafeteriaImagePreviews(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Remove cafeteria image
  const removeCafeteriaImage = (index: number) => {
    setCafeteriaImages(prev => prev.filter((_, i) => i !== index))
    setCafeteriaImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Handle menu item image upload
  const handleMenuItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewMenuItem(prev => ({ ...prev, image: file }))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewMenuItem(prev => ({ ...prev, imagePreview: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Add menu item
  const addMenuItem = () => {
    if (newMenuItem.name && newMenuItem.price && newMenuItem.category) {
      const menuItem: MenuItem = {
        id: Date.now(),
        name: newMenuItem.name,
        price: parseFloat(newMenuItem.price),
        category: newMenuItem.category,
        description: newMenuItem.description,
        image: newMenuItem.imagePreview || "/placeholder.svg?height=200&width=200"
      }
      
      setMenuItems(prev => [...prev, menuItem])
      setNewMenuItem({
        name: "",
        price: "",
        category: "",
        description: "",
        image: null,
        imagePreview: ""
      })
      
      toast({
        title: "Menu Item Added",
        description: "Menu item has been added successfully.",
      })
    }
  }

  // Remove menu item
  const removeMenuItem = (id: number) => {
    setMenuItems(prev => prev.filter(item => item.id !== id))
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!cafeteriaName || !cafeteriaAddress || !contactNo || !openTime || !closeTime || !cafeteriaDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including description.",
        variant: "destructive"
      })
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Cafeteria Created Successfully!",
        description: `${cafeteriaName} has been added to the system with ${menuItems.length} menu items.`,
      })

      // Reset form
      setCafeteriaName("")
      setCafeteriaAddress("")
      setContactNo("")
      setOpenTime("")
      setCloseTime("")
      setCafeteriaDescription("")
      setCafeteriaImages([])
      setCafeteriaImagePreviews([])
      setMenuItems([])
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create cafeteria. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cafeteria Management</h1>
            <p className="text-gray-600 mt-1">Manage your campus cafeterias and menus</p>
          </div>
        </div>

        {activeSection === 'browse' ? (
          <div className="space-y-6">
            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">Browse Cafeterias</CardTitle>
                    <CardDescription>View and manage existing cafeterias</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      {mockCafeterias.length} Available
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200 bg-green-50"
                  onClick={() => setActiveSection('add')}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">Add New Cafeteria</CardTitle>
                    <CardDescription>Create a new cafeteria with menu</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Setup complete system
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Existing Cafeterias */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Existing Cafeterias</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCafeterias.map((cafeteria) => (
                  <motion.div
                    key={cafeteria.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <img
                          src={cafeteria.images[0]}
                          alt={cafeteria.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90">
                            {cafeteria.department}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{cafeteria.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{cafeteria.rating}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{cafeteria.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{cafeteria.openTime} - {cafeteria.closeTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{cafeteria.contactNo}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Utensils className="w-4 h-4" />
                              <span>{cafeteria.menuItems.length} items</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Add New Cafeteria Section */
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSection('browse')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold">Add New Cafeteria</h2>
                <p className="text-gray-600">Create a complete cafeteria with menu items</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cafeteria Details Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Cafeteria Details
                  </CardTitle>
                  <CardDescription>
                    Enter basic information about the cafeteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Cafeteria Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter cafeteria name"
                      value={cafeteriaName}
                      onChange={(e) => setCafeteriaName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter complete address"
                      value={cafeteriaAddress}
                      onChange={(e) => setCafeteriaAddress(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your cafeteria, specialties, and atmosphere"
                      value={cafeteriaDescription}
                      onChange={(e) => setCafeteriaDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number *</Label>
                    <Input
                      id="contact"
                      placeholder="Enter contact number"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openTime">Opening Time *</Label>
                      <Input
                        id="openTime"
                        type="time"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="closeTime">Closing Time *</Label>
                      <Input
                        id="closeTime"
                        type="time"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-4">
                    <Label>Cafeteria Images</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label htmlFor="cafeteria-images" className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Upload cafeteria images
                            </span>
                            <input
                              id="cafeteria-images"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*"
                              onChange={handleCafeteriaImageUpload}
                            />
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB each
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Image Previews */}
                    {cafeteriaImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {cafeteriaImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeCafeteriaImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Menu Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    Menu Management
                  </CardTitle>
                  <CardDescription>
                    Add menu items with images and details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name *</Label>
                    <Input
                      id="itemName"
                      placeholder="Enter item name"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itemDescription">Description</Label>
                    <Textarea
                      id="itemDescription"
                      placeholder="Enter item description"
                      value={newMenuItem.description}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemPrice">Price (₹) *</Label>
                      <Input
                        id="itemPrice"
                        type="number"
                        placeholder="0"
                        value={newMenuItem.price}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemCategory">Category *</Label>
                      <Select
                        value={newMenuItem.category}
                        onValueChange={(value) => setNewMenuItem(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Course">Main Course</SelectItem>
                          <SelectItem value="Breakfast">Breakfast</SelectItem>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Desserts">Desserts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Item Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <label htmlFor="menu-item-image" className="cursor-pointer">
                          <Camera className="mx-auto h-8 w-8 text-gray-400" />
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload item image
                          </span>
                          <input
                            id="menu-item-image"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleMenuItemImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                    {newMenuItem.imagePreview && (
                      <img
                        src={newMenuItem.imagePreview}
                        alt="Item preview"
                        className="w-full h-32 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>

                  <Button onClick={addMenuItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>

                  {/* Menu Items List */}
                  {menuItems.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <h3 className="font-semibold">Added Menu Items ({menuItems.length})</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {menuItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="font-semibold text-green-600">₹{item.price}</span>
                                <Badge variant="outline" className="text-xs">{item.category}</Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMenuItem(item.id)}
                              className="text-red-500 hover:text-red-700 h-8 w-8"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button onClick={handleSubmit} size="lg" className="px-8">
                <Plus className="w-4 h-4 mr-2" />
                Create Cafeteria with Menu
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
