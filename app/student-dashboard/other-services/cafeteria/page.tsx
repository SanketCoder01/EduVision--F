"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Clock, Star, MapPin, Phone, Utensils, Eye } from "lucide-react"

interface MenuItem {
  id: number
  name: string
  price: number
  image: string
  category: string
  description?: string
}

interface Review {
  id: number
  userName: string
  userRole: string
  rating: number
  comment: string
  date: string
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
  description?: string
  reviews: Review[]
}

// Mock data for cafeterias
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
    description: "The main cafeteria serving fresh and hygienic meals to the entire college community with a wide variety of options.",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
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
        image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Main Course",
        description: "Aromatic basmati rice cooked with tender chicken pieces and traditional spices"
      },
      {
        id: 3,
        name: "Masala Dosa",
        price: 60,
        image: "https://images.unsplash.com/photo-1630383249896-424e482df921?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Breakfast",
        description: "Crispy South Indian crepe with spiced potato filling"
      },
      {
        id: 4,
        name: "Fresh Juice",
        price: 40,
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Beverages",
        description: "Freshly squeezed seasonal fruit juice"
      }
    ],
    createdBy: "Dr. Rajesh Kumar",
    department: "Computer Science Engineering",
    reviews: [
      {
        id: 1,
        userName: "Amit Sharma",
        userRole: "Student",
        rating: 4,
        comment: "Great food quality and variety. The thali is excellent value for money.",
        date: "2024-01-15"
      },
      {
        id: 2,
        userName: "Prof. Neha Gupta",
        userRole: "Faculty",
        rating: 5,
        comment: "Clean and hygienic. Staff is very courteous and food is always fresh.",
        date: "2024-01-10"
      }
    ]
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
    description: "A cozy canteen in the engineering block offering quick snacks and beverages for students and faculty.",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ],
    menuItems: [
      {
        id: 5,
        name: "Pav Bhaji",
        price: 50,
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Snacks",
        description: "Spicy vegetable curry served with buttered bread rolls"
      },
      {
        id: 6,
        name: "Cold Coffee",
        price: 30,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Beverages",
        description: "Refreshing iced coffee with milk and sugar"
      },
      {
        id: 7,
        name: "Samosa",
        price: 15,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Snacks",
        description: "Crispy fried pastry with spiced potato filling"
      }
    ],
    createdBy: "Prof. Priya Sharma",
    department: "Artificial Intelligence & Data Science",
    reviews: [
      {
        id: 3,
        userName: "Priya Patel",
        userRole: "Student",
        rating: 4,
        comment: "Good location and quick service. Pav bhaji is really tasty!",
        date: "2024-01-12"
      }
    ]
  },
  {
    id: 3,
    name: "Library Café",
    address: "Library Building, Ground Floor, Sanjivani College",
    contactNo: "+91 9876543212",
    openTime: "09:00",
    closeTime: "18:00",
    rating: 4.5,
    totalReviews: 67,
    description: "A quiet café perfect for studying while enjoying light snacks and beverages.",
    images: [
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    ],
    menuItems: [
      {
        id: 8,
        name: "Sandwich",
        price: 45,
        image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Snacks",
        description: "Grilled sandwich with vegetables and cheese"
      },
      {
        id: 9,
        name: "Green Tea",
        price: 25,
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        category: "Beverages",
        description: "Healthy green tea with natural antioxidants"
      }
    ],
    createdBy: "Dr. Anita Desai",
    department: "Computer Science Engineering",
    reviews: [
      {
        id: 4,
        userName: "Rahul Singh",
        userRole: "Student",
        rating: 5,
        comment: "Perfect place to study and grab a quick bite. Very peaceful environment.",
        date: "2024-01-08"
      }
    ]
  }
]

export default function StudentCafeteriaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Filter cafeterias based on search and department
  const filteredCafeterias = mockCafeterias.filter(cafeteria => {
    const matchesSearch = cafeteria.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cafeteria.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || cafeteria.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  // Get unique departments for filter
  const departments = Array.from(new Set(mockCafeterias.map(c => c.department)))

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/student-dashboard/other-services')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campus Cafeterias</h1>
            <p className="text-gray-600 mt-1">Discover delicious meals and snacks across campus</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search cafeterias by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCafeterias.length} of {mockCafeterias.length} cafeterias
          </p>
        </div>

        {/* Cafeterias Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCafeterias.map((cafeteria) => (
            <motion.div
              key={cafeteria.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative h-48">
                  <img
                    src={cafeteria.images[0]}
                    alt={cafeteria.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-xs">
                      {cafeteria.department}
                    </Badge>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{cafeteria.rating}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">{cafeteria.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{cafeteria.description}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{cafeteria.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{cafeteria.openTime} - {cafeteria.closeTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{cafeteria.contactNo}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Utensils className="w-4 h-4" />
                        <span>{cafeteria.menuItems.length} items</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{cafeteria.totalReviews} reviews</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/student-dashboard/other-services/cafeteria/${cafeteria.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCafeterias.length === 0 && (
          <div className="text-center py-12">
            <Utensils className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cafeterias found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filter criteria.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Campus Dining Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockCafeterias.length}</div>
              <div className="text-sm text-gray-600">Total Cafeterias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockCafeterias.reduce((sum, c) => sum + c.menuItems.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Menu Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(mockCafeterias.reduce((sum, c) => sum + c.rating, 0) / mockCafeterias.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockCafeterias.reduce((sum, c) => sum + c.totalReviews, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
