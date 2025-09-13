"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, Clock, DollarSign, Users, Star, MapPin, Phone, Mail, ChefHat, Eye, MessageSquare, Utensils, Plus, Send } from "lucide-react"

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
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400"
    ],
    menuItems: [
      {
        id: 1,
        name: "Veg Thali",
        price: 80,
        image: "/placeholder.svg?height=200&width=200",
        category: "Main Course",
        description: "Complete vegetarian meal with rice, dal, vegetables, roti, and dessert"
      },
      {
        id: 2,
        name: "Chicken Biryani", 
        price: 120,
        image: "/placeholder.svg?height=200&width=200",
        category: "Main Course",
        description: "Aromatic basmati rice cooked with tender chicken pieces and traditional spices"
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
    name: "Quick Bites Corner",
    address: "Library Building, 1st Floor",
    contactNo: "+91 9876543211",
    openTime: "08:00",
    closeTime: "18:00", 
    rating: 3.8,
    totalReviews: 89,
    description: "Perfect spot for quick snacks and beverages between classes. Ideal for students looking for fast service.",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400"
    ],
    menuItems: [
      {
        id: 3,
        name: "Samosa",
        price: 15,
        image: "/placeholder.svg?height=200&width=200",
        category: "Snacks",
        description: "Crispy fried pastry with spiced potato filling"
      },
      {
        id: 4,
        name: "Tea",
        price: 10,
        image: "/placeholder.svg?height=200&width=200",
        category: "Beverages",
        description: "Fresh brewed tea with milk and spices"
      }
    ],
    createdBy: "Prof. Priya Sharma",
    department: "Artificial Intelligence & Data Science",
    reviews: [
      {
        id: 3,
        userName: "Ravi Patel",
        userRole: "Student",
        rating: 4,
        comment: "Good for quick snacks. Tea is really good here.",
        date: "2024-01-12"
      }
    ]
  },
  {
    id: 3,
    name: "Healthy Eats Cafe",
    address: "Sports Complex, Ground Floor",
    contactNo: "+91 9876543212",
    openTime: "06:30",
    closeTime: "20:00",
    rating: 4.5,
    totalReviews: 203,
    description: "Focused on healthy and nutritious meals. Perfect for fitness enthusiasts and health-conscious individuals.",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400"
    ],
    menuItems: [
      {
        id: 5,
        name: "Fresh Fruit Bowl",
        price: 60,
        image: "/placeholder.svg?height=200&width=200",
        category: "Healthy",
        description: "Seasonal fresh fruits with yogurt and honey"
      },
      {
        id: 6,
        name: "Protein Smoothie",
        price: 80,
        image: "/placeholder.svg?height=200&width=200",
        category: "Beverages",
        description: "Nutritious smoothie with protein powder and fresh fruits"
      }
    ],
    createdBy: "Dr. Meera Patel",
    department: "Mechanical Engineering",
    reviews: [
      {
        id: 4,
        userName: "Sneha Joshi",
        userRole: "Student",
        rating: 5,
        comment: "Love the healthy options! Great for maintaining fitness goals.",
        date: "2024-01-14"
      }
    ]
  }
]


export default function StudentCafeteriaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All")
  const [selectedCafeteria, setSelectedCafeteria] = useState<Cafeteria | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Mock current user data (in real app, this would come from auth context)
  const currentUser = {
    id: 1,
    name: "John Doe",
    role: "Student",
    email: "john.doe@sanjivani.edu.in"
  }

  // Check if user has already reviewed this cafeteria
  const hasUserReviewed = (cafeteriaId: number) => {
    const cafeteria = mockCafeterias.find(c => c.id === cafeteriaId)
    return cafeteria?.reviews.some(review => 
      review.userName === currentUser.name && review.userRole === currentUser.role
    ) || false
  }

  // Filter cafeterias
  const filteredCafeterias = mockCafeterias.filter(cafeteria => {
    const matchesSearch = cafeteria.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cafeteria.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === "All" || cafeteria.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const departments = ["All", ...Array.from(new Set(mockCafeterias.map(c => c.department)))]

  // Submit review function
  const handleSubmitReview = async () => {
    if (!selectedCafeteria || reviewRating === 0 || !reviewComment.trim()) {
      toast({
        title: "Incomplete Review",
        description: "Please provide both a rating and comment for your review.",
        variant: "destructive"
      })
      return
    }

    if (hasUserReviewed(selectedCafeteria.id)) {
      toast({
        title: "Review Already Submitted",
        description: "You have already reviewed this cafeteria. Only one review per user is allowed.",
        variant: "destructive"
      })
      return
    }

    setIsSubmittingReview(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would be an API call to submit the review
      // For now, we'll just show a success message
      toast({
        title: "Review Submitted Successfully!",
        description: "Thank you for your feedback. Your review will help other students.",
        variant: "default"
      })

      // Reset form
      setReviewRating(0)
      setReviewComment("")
      setShowReviewDialog(false)
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Reset review form when dialog closes
  const handleCloseReviewDialog = () => {
    setShowReviewDialog(false)
    setReviewRating(0)
    setReviewComment("")
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/student-dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">Campus Cafeterias</h1>
              <p className="text-gray-500 mt-1">Discover dining options across campus</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search cafeterias..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cafeteria Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCafeterias.map((cafeteria) => (
              <motion.div
                key={cafeteria.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedCafeteria(cafeteria)}
                >
                  <div className="relative">
                    <img
                      src={cafeteria.images[0]}
                      alt={cafeteria.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm">
                        {cafeteria.department}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{cafeteria.rating}</span>
                        <span className="text-gray-600">({cafeteria.totalReviews})</span>
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{cafeteria.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {cafeteria.description || "Serving delicious meals to our campus community"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{cafeteria.openTime} - {cafeteria.closeTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{cafeteria.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{cafeteria.contactNo}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Utensils className="w-4 h-4" />
                          <span>{cafeteria.menuItems.length} items</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/student-dashboard/cafeteria/${cafeteria.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredCafeterias.length === 0 && (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <ChefHat className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">No cafeterias found matching your search.</p>
                <p className="text-gray-400 text-sm text-center mt-1">Try adjusting your search terms or filters.</p>
              </CardContent>
            </Card>
          )}

          {/* Cafeteria Details Dialog */}
          <Dialog open={!!selectedCafeteria} onOpenChange={() => setSelectedCafeteria(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCafeteria?.name}</DialogTitle>
                <DialogDescription>
                  {selectedCafeteria?.department} • {selectedCafeteria?.address}
                </DialogDescription>
              </DialogHeader>
              
              {selectedCafeteria && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCafeteria.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedCafeteria.name} - ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>

                    {/* Rating and Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          Rating & Reviews
                        </h3>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-2xl font-bold">{selectedCafeteria.rating}</span>
                          </div>
                          <span className="text-gray-500">({selectedCafeteria.totalReviews} reviews)</span>
                        </div>
                        <p className="text-gray-600">{selectedCafeteria.description}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-500" />
                          Operating Hours
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Opens:</span>
                            <span className="font-medium">{selectedCafeteria.openTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Closes:</span>
                            <span className="font-medium">{selectedCafeteria.closeTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="menu" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCafeteria.menuItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className="flex">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-24 h-24 object-cover"
                            />
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{item.name}</h4>
                                <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                              </div>
                              <Badge variant="outline" className="mb-2">{item.category}</Badge>
                              {item.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    {/* Write Review Button */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Customer Reviews</h3>
                      <Button
                        onClick={() => {
                          if (hasUserReviewed(selectedCafeteria.id)) {
                            toast({
                              title: "Review Already Submitted",
                              description: "You have already reviewed this cafeteria. Only one review per user is allowed.",
                              variant: "destructive"
                            })
                          } else {
                            setShowReviewDialog(true)
                          }
                        }}
                        className="flex items-center gap-2"
                        variant={hasUserReviewed(selectedCafeteria.id) ? "secondary" : "default"}
                        disabled={hasUserReviewed(selectedCafeteria.id)}
                      >
                        <Plus className="w-4 h-4" />
                        {hasUserReviewed(selectedCafeteria.id) ? "Review Submitted" : "Write Review"}
                      </Button>
                    </div>

                    {selectedCafeteria.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {selectedCafeteria.reviews.map((review) => (
                          <Card key={review.id}>
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.userName}</h4>
                                  <Badge variant="secondary" className="text-xs">{review.userRole}</Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{review.rating}</span>
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                              <p className="text-sm text-gray-500">{review.date}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet</p>
                        <p className="text-gray-400 text-sm">Be the first to review this cafeteria!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Phone className="w-5 h-5 text-green-500" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{selectedCafeteria.contactNo}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{selectedCafeteria.address}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-500" />
                          Management
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium">{selectedCafeteria.createdBy}</p>
                            <p className="text-sm text-gray-500">Cafeteria Manager</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{selectedCafeteria.department}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>

          {/* Review Submission Dialog */}
          <Dialog open={showReviewDialog} onOpenChange={handleCloseReviewDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>
                  Share your experience at {selectedCafeteria?.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Rating Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating *</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= reviewRating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="ml-2 text-sm text-gray-600">
                        {reviewRating} star{reviewRating !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review *</label>
                  <Textarea
                    placeholder="Share your thoughts about the food quality, service, ambiance, etc..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {reviewComment.length}/500 characters
                  </p>
                </div>

                {/* User Info Display */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Reviewing as: <span className="font-medium">{currentUser.name}</span> ({currentUser.role})
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCloseReviewDialog}
                    disabled={isSubmittingReview}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || !reviewComment.trim() || isSubmittingReview}
                    className="flex items-center gap-2"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  )
}
