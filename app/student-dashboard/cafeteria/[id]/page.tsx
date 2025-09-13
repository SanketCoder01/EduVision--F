"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Clock, Star, MapPin, Phone, Mail, Users, Heart, Share, Utensils, Plus, Send } from "lucide-react"

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

// Mock data for cafeterias (same as before)
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
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600"
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
      },
      {
        id: 3,
        name: "Masala Dosa",
        price: 60,
        image: "/placeholder.svg?height=200&width=200",
        category: "Breakfast",
        description: "Crispy South Indian crepe with spiced potato filling"
      },
      {
        id: 4,
        name: "Fresh Juice",
        price: 40,
        image: "/placeholder.svg?height=200&width=200",
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
  }
]

export default function CafeteriaDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Mock current user data
  const currentUser = {
    id: 1,
    name: "John Doe",
    role: "Student",
    email: "john.doe@sanjivani.edu.in"
  }

  // Find cafeteria by ID
  const cafeteria = mockCafeterias.find(c => c.id === parseInt(params.id as string))

  if (!cafeteria) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cafeteria Not Found</h1>
          <p className="text-gray-600 mb-4">The cafeteria you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/student-dashboard/cafeteria')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cafeterias
          </Button>
        </div>
      </div>
    )
  }

  // Check if user has already reviewed this cafeteria
  const hasUserReviewed = () => {
    return cafeteria.reviews.some(review => 
      review.userName === currentUser.name && review.userRole === currentUser.role
    )
  }

  // Submit review function
  const handleSubmitReview = async () => {
    if (reviewRating === 0 || !reviewComment.trim()) {
      toast({
        title: "Incomplete Review",
        description: "Please provide both a rating and comment for your review.",
        variant: "destructive"
      })
      return
    }

    if (hasUserReviewed()) {
      toast({
        title: "Review Already Submitted",
        description: "You have already reviewed this cafeteria. Only one review per user is allowed.",
        variant: "destructive"
      })
      return
    }

    setIsSubmittingReview(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Review Submitted Successfully!",
        description: "Thank you for your feedback. Your review will help other students.",
        variant: "default"
      })

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

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-80 w-full">
        <img
          src={cafeteria.images[0]}
          alt={cafeteria.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => router.push('/student-dashboard/cafeteria')}
            className="rounded-full bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/90 hover:bg-white"
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/90 hover:bg-white"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Main Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{cafeteria.name}</CardTitle>
                <CardDescription className="text-base">{cafeteria.description}</CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-bold">{cafeteria.rating}</span>
                </div>
                <p className="text-sm text-gray-500">({cafeteria.totalReviews} reviews)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{cafeteria.openTime} - {cafeteria.closeTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{cafeteria.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{cafeteria.contactNo}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1">
                <MapPin className="w-4 h-4 mr-2" />
                Direction
              </Button>
              <Button variant="outline" className="flex-1">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About this place</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">{cafeteria.description}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{cafeteria.contactNo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{cafeteria.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Open: {cafeteria.openTime} - {cafeteria.closeTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>Managed by: {cafeteria.createdBy}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cafeteria.menuItems.map((item) => (
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

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Write Review Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <Button
                  onClick={() => {
                    if (hasUserReviewed()) {
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
                  variant={hasUserReviewed() ? "secondary" : "default"}
                  disabled={hasUserReviewed()}
                >
                  <Plus className="w-4 h-4" />
                  {hasUserReviewed() ? "Review Submitted" : "Write Review"}
                </Button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {cafeteria.reviews.map((review) => (
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
            </div>
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cafeteria.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${cafeteria.name} - ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Submission Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience at {cafeteria.name}
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
                onClick={() => setShowReviewDialog(false)}
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
    </div>
  )
}
