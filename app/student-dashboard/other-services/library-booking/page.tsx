"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Search, BookOpen, Clock, Users, MapPin, Library } from "lucide-react"

// Mock data for room bookings
const roomBookings = [
  {
    id: "RB001",
    roomName: "Study Room A101",
    location: "Main Library - First Floor",
    date: "2023-06-15",
    startTime: "10:00",
    endTime: "12:00",
    status: "Confirmed",
    capacity: 4,
    amenities: ["Whiteboard", "Power Outlets", "Wi-Fi"],
    bookedBy: {
      name: "Sanket Gaikwad",
      email: "sanket.g@example.edu",
      avatar: "/avatars/01.png",
    },
    createdAt: "2023-06-10T09:30:00Z",
  },
  {
    id: "RB002",
    roomName: "Group Study Room B205",
    location: "Engineering Library - Second Floor",
    date: "2023-06-18",
    startTime: "14:00",
    endTime: "16:00",
    status: "Pending",
    capacity: 8,
    amenities: ["Projector", "Whiteboard", "Power Outlets", "Wi-Fi"],
    bookedBy: {
      name: "Sanket Gaikwad",
      email: "sanket.g@example.edu",
      avatar: "/avatars/01.png",
    },
    createdAt: "2023-06-12T15:45:00Z",
  },
  {
    id: "RB003",
    roomName: "Quiet Study Carrel C12",
    location: "Main Library - Third Floor",
    date: "2023-06-20",
    startTime: "09:00",
    endTime: "11:00",
    status: "Cancelled",
    capacity: 1,
    amenities: ["Power Outlets", "Wi-Fi", "Reading Lamp"],
    bookedBy: {
      name: "Sanket Gaikwad",
      email: "sanket.g@example.edu",
      avatar: "/avatars/01.png",
    },
    createdAt: "2023-06-14T10:15:00Z",
    cancelledAt: "2023-06-15T08:30:00Z",
    cancellationReason: "Schedule conflict",
  },
]

// Mock data for available rooms
const availableRooms = [
  {
    id: "SR001",
    name: "Study Room A101",
    location: "Main Library - First Floor",
    capacity: 4,
    amenities: ["Whiteboard", "Power Outlets", "Wi-Fi"],
    image: "/images/study-room-1.jpg",
    availabilityStatus: "Available",
  },
  {
    id: "SR002",
    name: "Group Study Room B205",
    location: "Engineering Library - Second Floor",
    capacity: 8,
    amenities: ["Projector", "Whiteboard", "Power Outlets", "Wi-Fi"],
    image: "/images/study-room-2.jpg",
    availabilityStatus: "Available",
  },
  {
    id: "SR003",
    name: "Quiet Study Carrel C12",
    location: "Main Library - Third Floor",
    capacity: 1,
    amenities: ["Power Outlets", "Wi-Fi", "Reading Lamp"],
    image: "/images/study-room-3.jpg",
    availabilityStatus: "Booked until 2:00 PM",
  },
  {
    id: "SR004",
    name: "Collaboration Space D100",
    location: "Science Library - Ground Floor",
    capacity: 12,
    amenities: ["Smart Board", "Video Conference", "Power Outlets", "Wi-Fi"],
    image: "/images/study-room-4.jpg",
    availabilityStatus: "Available",
  },
  {
    id: "SR005",
    name: "Media Room E303",
    location: "Media Library - Third Floor",
    capacity: 6,
    amenities: ["Audio Equipment", "Projector", "Power Outlets", "Wi-Fi"],
    image: "/images/study-room-5.jpg",
    availabilityStatus: "Maintenance",
  },
  {
    id: "SR006",
    name: "Silent Study Room F110",
    location: "Main Library - First Floor",
    capacity: 20,
    amenities: ["Power Outlets", "Wi-Fi", "Individual Desks"],
    image: "/images/study-room-6.jpg",
    availabilityStatus: "Available",
  },
]

// Mock data for library locations
const libraryLocations = [
  { id: "lib1", name: "Main Library" },
  { id: "lib2", name: "Engineering Library" },
  { id: "lib3", name: "Science Library" },
  { id: "lib4", name: "Media Library" },
  { id: "lib5", name: "Law Library" },
]

// Mock data for room types
const roomTypes = [
  { id: "rt1", name: "Individual Study Carrel" },
  { id: "rt2", name: "Group Study Room" },
  { id: "rt3", name: "Collaboration Space" },
  { id: "rt4", name: "Media Room" },
  { id: "rt5", name: "Silent Study Room" },
]

// Mock data for time slots
const timeSlots = [
  { id: "ts1", time: "08:00 - 10:00" },
  { id: "ts2", time: "10:00 - 12:00" },
  { id: "ts3", time: "12:00 - 14:00" },
  { id: "ts4", time: "14:00 - 16:00" },
  { id: "ts5", time: "16:00 - 18:00" },
  { id: "ts6", time: "18:00 - 20:00" },
]

export default function LibraryBookingPage() {
  const [activeTab, setActiveTab] = useState("my-bookings")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedRoomType, setSelectedRoomType] = useState("")
  const [selectedCapacity, setSelectedCapacity] = useState("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [bookingPurpose, setBookingPurpose] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // Filter bookings based on search query
  const filteredBookings = roomBookings.filter((booking) => {
    return (
      booking.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Filter available rooms based on selected filters
  const filteredRooms = availableRooms.filter((room) => {
    let matchesLocation = true
    let matchesRoomType = true
    let matchesCapacity = true

    if (selectedLocation) {
      matchesLocation = room.location.includes(selectedLocation)
    }

    if (selectedRoomType) {
      // This is a simplified check - in a real app, you'd have a roomType field
      matchesRoomType = room.name.includes(selectedRoomType)
    }

    if (selectedCapacity) {
      const requiredCapacity = parseInt(selectedCapacity)
      matchesCapacity = room.capacity >= requiredCapacity
    }

    return matchesLocation && matchesRoomType && matchesCapacity
  })

  // Handle booking submission
  const handleBookingSubmit = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedRoom || !bookingPurpose || !agreeToTerms) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and agree to the terms.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would submit this to your backend
    toast({
      title: "Booking Submitted",
      description: "Your room booking request has been submitted successfully.",
    })

    // Reset form
    setSelectedRoom(null)
    setBookingPurpose("")
    setAgreeToTerms(false)
    setActiveTab("my-bookings")
  }

  // Handle booking cancellation
  const handleCancelBooking = (bookingId: string) => {
    // In a real app, you would submit this to your backend
    toast({
      title: "Booking Cancelled",
      description: `Booking ${bookingId} has been cancelled successfully.`,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center">
            <Library className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Library Study Room Booking</h1>
              <p className="text-gray-500 mt-1">Reserve study spaces and rooms across campus libraries</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="my-bookings" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="new-booking">New Booking</TabsTrigger>
            <TabsTrigger value="availability">Room Availability</TabsTrigger>
          </TabsList>

          {/* My Bookings Tab */}
          <TabsContent value="my-bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Room Bookings</CardTitle>
                <CardDescription>View and manage your library room bookings</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by room name, location, or booking ID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                    <p className="text-gray-500 mb-4">You haven't made any room bookings yet.</p>
                    <Button onClick={() => setActiveTab("new-booking")}>
                      Make Your First Booking
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg font-semibold">{booking.roomName}</h3>
                              <Badge
                                className={cn(
                                  "ml-3",
                                  booking.status === "Confirmed" && "bg-green-100 text-green-800 border-0",
                                  booking.status === "Pending" && "bg-yellow-100 text-yellow-800 border-0",
                                  booking.status === "Cancelled" && "bg-red-100 text-red-800 border-0"
                                )}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-gray-500 flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {booking.location}
                            </p>
                            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600">
                              <div className="flex items-center mr-4">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(booking.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center mr-4">
                                <Clock className="h-4 w-4 mr-1" />
                                {booking.startTime} - {booking.endTime}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Capacity: {booking.capacity}
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">
                                Booked on {new Date(booking.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                            <div className="flex space-x-2">
                              {booking.status !== "Cancelled" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {booking.amenities.map((amenity, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        {booking.status === "Cancelled" && booking.cancellationReason && (
                          <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <span className="font-medium">Cancellation reason:</span> {booking.cancellationReason}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Booking Tab */}
          <TabsContent value="new-booking" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Book a Study Room</CardTitle>
                    <CardDescription>Fill in the details to reserve a study space</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Date*</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Location Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Library Location*</label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a library" />
                        </SelectTrigger>
                        <SelectContent>
                          {libraryLocations.map((location) => (
                            <SelectItem key={location.id} value={location.name}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Room Type Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Room Type*</label>
                      <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Capacity Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Required Capacity*</label>
                      <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select capacity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 person</SelectItem>
                          <SelectItem value="2">2 people</SelectItem>
                          <SelectItem value="4">4 people</SelectItem>
                          <SelectItem value="6">6 people</SelectItem>
                          <SelectItem value="8">8+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Time Slot Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time Slot*</label>
                      <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.time}>
                              {slot.time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Available Rooms */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Available Rooms*</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredRooms.length > 0 ? (
                          filteredRooms.map((room) => (
                            <div
                              key={room.id}
                              className={cn(
                                "border rounded-md p-3 cursor-pointer transition-all",
                                selectedRoom === room.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "hover:border-gray-300",
                                room.availabilityStatus !== "Available" &&
                                  "opacity-60 cursor-not-allowed"
                              )}
                              onClick={() => {
                                if (room.availabilityStatus === "Available") {
                                  setSelectedRoom(room.id)
                                }
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{room.name}</h4>
                                  <p className="text-xs text-gray-500">{room.location}</p>
                                </div>
                                <Badge
                                  className={cn(
                                    room.availabilityStatus === "Available"
                                      ? "bg-green-100 text-green-800 border-0"
                                      : "bg-red-100 text-red-800 border-0"
                                  )}
                                >
                                  {room.availabilityStatus}
                                </Badge>
                              </div>
                              <div className="mt-2 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  Capacity: {room.capacity}
                                </div>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {room.amenities.slice(0, 2).map((amenity, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-gray-50"
                                  >
                                    {amenity}
                                  </Badge>
                                ))}
                                {room.amenities.length > 2 && (
                                  <Badge variant="outline" className="text-xs bg-gray-50">
                                    +{room.amenities.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 border rounded-md">
                            <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <h3 className="text-sm font-medium text-gray-900 mb-1">
                              No rooms match your criteria
                            </h3>
                            <p className="text-xs text-gray-500">
                              Try adjusting your filters or select a different date/time
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Purpose */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Booking Purpose*</label>
                      <Textarea
                        placeholder="Briefly describe why you need this room (e.g., group study, project work)"
                        value={bookingPurpose}
                        onChange={(e) => setBookingPurpose(e.target.value)}
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2 pt-4">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          library room booking policies
                        </a>{" "}
                        and understand that failure to show up for a booking may result in booking
                        privileges being suspended.
                      </label>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("my-bookings")}>
                      Cancel
                    </Button>
                    <Button onClick={handleBookingSubmit}>Submit Booking</Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Booking Policies</h3>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                        <li>Bookings can be made up to 2 weeks in advance</li>
                        <li>Maximum booking duration is 2 hours per day</li>
                        <li>Arrive within 15 minutes of your booking time</li>
                        <li>Cancel at least 2 hours before if you can't make it</li>
                        <li>Leave the room clean and organized</li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">Need Help?</h3>
                      <p className="text-sm text-gray-600">
                        Contact the library desk at{" "}
                        <a href="tel:555-123-4567" className="text-blue-600">
                          555-123-4567
                        </a>{" "}
                        or email{" "}
                        <a href="mailto:library@university.edu" className="text-blue-600">
                          library@university.edu
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Room Availability Tab */}
          <TabsContent value="availability" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Availability</CardTitle>
                <CardDescription>Check real-time availability of study spaces</CardDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a library" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Libraries</SelectItem>
                        {libraryLocations.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Room Types</SelectItem>
                        {roomTypes.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-40 bg-gray-100 relative">
                        <div
                          className={cn(
                            "absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium",
                            room.availabilityStatus === "Available"
                              ? "bg-green-100 text-green-800"
                              : room.availabilityStatus === "Maintenance"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {room.availabilityStatus}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium">{room.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{room.location}</p>
                        <div className="flex items-center mt-2 text-sm">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          <span>Capacity: {room.capacity}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {room.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button
                            className="w-full"
                            variant={room.availabilityStatus === "Available" ? "default" : "outline"}
                            disabled={room.availabilityStatus !== "Available"}
                            onClick={() => {
                              if (room.availabilityStatus === "Available") {
                                setSelectedRoom(room.id)
                                setActiveTab("new-booking")
                              }
                            }}
                          >
                            {room.availabilityStatus === "Available" ? "Book Now" : "Unavailable"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
