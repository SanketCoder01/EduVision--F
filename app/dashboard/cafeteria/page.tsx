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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, Camera, Plus, Edit, Trash2, Clock, DollarSign, Users, ChefHat } from "lucide-react"

// Mock data for menu items
const mockMenuItems = [
  {
    id: 1,
    name: "Veg Thali",
    category: "Main Course",
    price: 80,
    description: "Complete vegetarian meal with rice, dal, vegetables, roti, and dessert",
    image: "/placeholder.svg?height=200&width=200",
    availability: "Available",
    preparationTime: "15-20 mins",
    ingredients: ["Rice", "Dal", "Mixed Vegetables", "Roti", "Pickle", "Sweet"],
    nutritionalInfo: {
      calories: 450,
      protein: "12g",
      carbs: "65g",
      fat: "15g"
    }
  },
  {
    id: 2,
    name: "Chicken Biryani",
    category: "Main Course", 
    price: 120,
    description: "Aromatic basmati rice cooked with tender chicken pieces and traditional spices",
    image: "/placeholder.svg?height=200&width=200",
    availability: "Available",
    preparationTime: "25-30 mins",
    ingredients: ["Basmati Rice", "Chicken", "Onions", "Spices", "Yogurt", "Mint"],
    nutritionalInfo: {
      calories: 580,
      protein: "28g", 
      carbs: "70g",
      fat: "18g"
    }
  }
]

const categories = ["All", "Main Course", "Snacks", "Beverages", "Desserts", "Breakfast"]

export default function CafeteriaManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("menu")
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  // Form states for adding/editing menu items
  const [itemName, setItemName] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemImage, setItemImage] = useState<File | null>(null)
  const [itemImagePreview, setItemImagePreview] = useState("")
  const [preparationTime, setPreparationTime] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [availability, setAvailability] = useState("Available")

  // Filter menu items
  const filteredItems = mockMenuItems.filter(item => 
    selectedCategory === "All" || item.category === selectedCategory
  )

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setItemImage(file)
      setItemImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!itemName || !itemCategory || !itemPrice || !itemDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Menu Item Added",
      description: `${itemName} has been added to the cafeteria menu.`,
    })
    
    // Reset form
    setItemName("")
    setItemCategory("")
    setItemPrice("")
    setItemDescription("")
    setItemImage(null)
    setItemImagePreview("")
    setPreparationTime("")
    setIngredients("")
    setCalories("")
    setProtein("")
    setCarbs("")
    setFat("")
    setAvailability("Available")
    setActiveTab("menu")
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">Cafeteria Management</h1>
              <p className="text-gray-500 mt-1">Manage menu items, pricing, and availability</p>
            </div>
          </div>

          <Tabs defaultValue="menu" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="menu">Menu Management</TabsTrigger>
              <TabsTrigger value="add-item">Add New Item</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Menu Management Tab */}
            <TabsContent value="menu" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setActiveTab("add-item")} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Item
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          item.availability === "Available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.availability}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">{item.category}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{item.price}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.preparationTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {item.nutritionalInfo.calories} cal
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Add New Item Tab */}
            <TabsContent value="add-item" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Menu Item</CardTitle>
                  <CardDescription>
                    Add a new item to the cafeteria menu with complete details and pricing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="item-name">Item Name *</Label>
                          <Input
                            id="item-name"
                            placeholder="e.g., Veg Thali"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="item-category">Category *</Label>
                          <Select value={itemCategory} onValueChange={setItemCategory} required>
                            <SelectTrigger id="item-category">
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

                        <div className="space-y-2">
                          <Label htmlFor="item-price">Price (₹) *</Label>
                          <Input
                            id="item-price"
                            type="number"
                            placeholder="e.g., 80"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="preparation-time">Preparation Time</Label>
                          <Input
                            id="preparation-time"
                            placeholder="e.g., 15-20 mins"
                            value={preparationTime}
                            onChange={(e) => setPreparationTime(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="availability">Availability</Label>
                          <Select value={availability} onValueChange={setAvailability}>
                            <SelectTrigger id="availability">
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Available">Available</SelectItem>
                              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                              <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="item-description">Description *</Label>
                          <Textarea
                            id="item-description"
                            placeholder="Describe the item, its ingredients, and what makes it special..."
                            className="min-h-[100px]"
                            value={itemDescription}
                            onChange={(e) => setItemDescription(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ingredients">Ingredients</Label>
                          <Textarea
                            id="ingredients"
                            placeholder="List main ingredients separated by commas..."
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Nutritional Information (Optional)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              placeholder="Calories"
                              value={calories}
                              onChange={(e) => setCalories(e.target.value)}
                            />
                            <Input
                              placeholder="Protein (g)"
                              value={protein}
                              onChange={(e) => setProtein(e.target.value)}
                            />
                            <Input
                              placeholder="Carbs (g)"
                              value={carbs}
                              onChange={(e) => setCarbs(e.target.value)}
                            />
                            <Input
                              placeholder="Fat (g)"
                              value={fat}
                              onChange={(e) => setFat(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="item-image">Item Image</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                        {itemImagePreview ? (
                          <div className="relative">
                            <img
                              src={itemImagePreview}
                              alt="Preview"
                              className="mx-auto max-h-[200px] rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setItemImage(null)
                                setItemImagePreview("")
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm text-gray-500 mb-2">Upload an image of the food item</p>
                            <Input
                              id="item-image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("item-image")?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("menu")}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <ChefHat className="w-4 h-4 mr-2" />
                        Add to Menu
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockMenuItems.length}</div>
                    <p className="text-xs text-muted-foreground">Active items</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{Math.round(mockMenuItems.reduce((sum, item) => sum + item.price, 0) / mockMenuItems.length)}
                    </div>
                    <p className="text-xs text-muted-foreground">Per item</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Items</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockMenuItems.filter(item => item.availability === "Available").length}
                    </div>
                    <p className="text-xs text-muted-foreground">Ready to serve</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Set(mockMenuItems.map(item => item.category)).size}
                    </div>
                    <p className="text-xs text-muted-foreground">Different types</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Menu Overview</CardTitle>
                  <CardDescription>
                    Summary of your cafeteria menu items and their status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.slice(1).map((category) => {
                      const categoryItems = mockMenuItems.filter(item => item.category === category)
                      const availableItems = categoryItems.filter(item => item.availability === "Available")
                      
                      return (
                        <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{category}</h3>
                            <p className="text-sm text-gray-500">
                              {categoryItems.length} items • {availableItems.length} available
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ₹{categoryItems.length > 0 ? Math.round(categoryItems.reduce((sum, item) => sum + item.price, 0) / categoryItems.length) : 0}
                            </p>
                            <p className="text-xs text-gray-500">Avg. price</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
