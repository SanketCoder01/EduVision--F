"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, MapPin, Phone, Star, Coffee, Utensils } from "lucide-react"
import Link from "next/link"

const messData = [
  {
    id: 1,
    name: "Main Campus Mess",
    type: "Vegetarian",
    distance: "0.2 km",
    rating: 4.2,
    timings: {
      breakfast: "7:00 AM - 10:00 AM",
      lunch: "12:00 PM - 3:00 PM",
      dinner: "7:00 PM - 10:00 PM"
    },
    contact: "+91 9876543210",
    location: "Main Campus, Ground Floor",
    menu: {
      breakfast: ["Poha", "Upma", "Paratha", "Tea/Coffee", "Fruits"],
      lunch: ["Dal Rice", "Roti", "Sabzi", "Curd", "Pickle"],
      dinner: ["Chapati", "Dal", "Vegetable Curry", "Rice", "Sweet"]
    },
    price: "₹80/meal"
  },
  {
    id: 2,
    name: "Hostel Mess A",
    type: "Mixed",
    distance: "0.5 km",
    rating: 3.8,
    timings: {
      breakfast: "7:30 AM - 9:30 AM",
      lunch: "12:30 PM - 2:30 PM",
      dinner: "7:30 PM - 9:30 PM"
    },
    contact: "+91 9876543211",
    location: "Boys Hostel Block A",
    menu: {
      breakfast: ["Bread Butter", "Egg Curry", "Tea", "Banana"],
      lunch: ["Rice", "Dal", "Chicken/Paneer", "Roti", "Salad"],
      dinner: ["Rice", "Sambar", "Dry Vegetable", "Curd", "Papad"]
    },
    price: "₹90/meal"
  },
  {
    id: 3,
    name: "Cafeteria Express",
    type: "Fast Food",
    distance: "0.3 km",
    rating: 4.0,
    timings: {
      breakfast: "8:00 AM - 11:00 AM",
      lunch: "11:00 AM - 4:00 PM",
      dinner: "4:00 PM - 9:00 PM"
    },
    contact: "+91 9876543212",
    location: "Near Library, 1st Floor",
    menu: {
      breakfast: ["Sandwich", "Burger", "Coffee", "Juice"],
      lunch: ["Pizza", "Pasta", "Noodles", "Cold Drinks"],
      dinner: ["Dosa", "Idli", "Vada Pav", "Tea"]
    },
    price: "₹60-120/item"
  }
]

export default function NearbyMessPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedMess, setSelectedMess] = useState<any>(null)

  const filteredMess = activeTab === "all" 
    ? messData 
    : messData.filter(mess => mess.type.toLowerCase().includes(activeTab))

  const getCurrentMeal = () => {
    const hour = new Date().getHours()
    if (hour >= 7 && hour < 11) return "breakfast"
    if (hour >= 12 && hour < 16) return "lunch"
    if (hour >= 19 && hour < 22) return "dinner"
    return "closed"
  }

  const currentMeal = getCurrentMeal()

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center mb-6">
          <Link href="/student-dashboard/other-services">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nearby Mess</h1>
            <p className="text-gray-500 mt-1">Find mess and food options near campus</p>
          </div>
        </div>

        {currentMeal !== "closed" && (
          <Card className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Current Meal Time: {currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="all">All Options</TabsTrigger>
            <TabsTrigger value="vegetarian">Vegetarian</TabsTrigger>
            <TabsTrigger value="fast">Fast Food</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMess.map((mess) => (
                <MessCard key={mess.id} mess={mess} currentMeal={currentMeal} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="vegetarian" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMess.map((mess) => (
                <MessCard key={mess.id} mess={mess} currentMeal={currentMeal} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="fast" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMess.map((mess) => (
                <MessCard key={mess.id} mess={mess} currentMeal={currentMeal} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

function MessCard({ mess, currentMeal }: { mess: any, currentMeal: string }) {
  const [showDetails, setShowDetails] = useState(false)
  
  const isOpen = currentMeal !== "closed" && mess.timings[currentMeal as keyof typeof mess.timings]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{mess.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {mess.type}
                </Badge>
                {isOpen && (
                  <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                    Open Now
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{mess.rating}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{mess.location}</span>
            <span className="text-xs">({mess.distance})</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{mess.contact}</span>
          </div>
          
          {isOpen && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <Clock className="h-4 w-4" />
              <span>{mess.timings[currentMeal as keyof typeof mess.timings]}</span>
            </div>
          )}
          
          <div className="text-sm font-semibold text-blue-600">
            {mess.price}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Menu" : "View Menu"}
          </Button>
          
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-gray-50 rounded-lg"
            >
              <h4 className="font-semibold mb-2">Today's Menu:</h4>
              {Object.entries(mess.menu).map(([mealType, items]) => (
                <div key={mealType} className="mb-2">
                  <span className="text-sm font-medium capitalize text-gray-700">
                    {mealType}:
                  </span>
                  <p className="text-xs text-gray-600 ml-2">
                    {(items as string[]).join(", ")}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
