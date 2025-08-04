"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, DollarSign, Search, Check, QrCode, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentEventsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [registrationData, setRegistrationData] = useState({})
  const [events, setEvents] = useState([])
  const [registeredEvents, setRegisteredEvents] = useState(new Set())

  // Load events from localStorage
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("events") || "[]")
    const storedRegistrations = JSON.parse(localStorage.getItem("studentRegistrations") || "[]")
    setEvents(storedEvents)
    setRegisteredEvents(new Set(storedRegistrations))
  }, [])

  // Mock events data with enhanced features
  const defaultEvents = [
    {
      id: 1,
      title: "Annual Tech Symposium",
      description:
        "A day-long symposium featuring workshops, talks, and networking opportunities for tech enthusiasts.",
      date: "2023-10-15",
      time: "10:00 AM",
      venue: "Main Auditorium",
      poster: "/placeholder.svg?height=200&width=400",
      maxParticipants: 100,
      targetAudience: ["CSE", "IT", "AIML"],
      onlinePayment: true,
      paymentAmount: "500",
      allowRegistration: true,
      registrationFields: [
        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
        { name: "prn", label: "PRN Number", type: "text", required: true, placeholder: "Enter your PRN" },
        { name: "email", label: "Email Address", type: "email", required: true, placeholder: "Enter your email" },
        {
          name: "mobile",
          label: "Mobile Number",
          type: "tel",
          required: true,
          placeholder: "Enter your mobile number",
        },
        {
          name: "class",
          label: "Class/Department",
          type: "select",
          required: true,
          options: ["FY-CSE", "SY-CSE", "TY-CSE", "FY-IT", "SY-IT", "TY-IT", "FY-AIML", "SY-AIML", "TY-AIML"],
        },
      ],
      registeredStudents: 45,
      venueType: "seminar-hall",
      seatArrangement: "120 seats available",
      isRegistered: false,
      hasPaid: false,
    },
    {
      id: 2,
      title: "Coding Competition",
      description: "Test your programming skills in this competitive coding event with exciting prizes.",
      date: "2023-10-20",
      time: "2:00 PM",
      venue: "Computer Lab 3",
      poster: "/placeholder.svg?height=200&width=400",
      maxParticipants: 50,
      targetAudience: ["CSE", "IT"],
      onlinePayment: false,
      allowRegistration: true,
      registrationFields: [
        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
        { name: "prn", label: "PRN Number", type: "text", required: true, placeholder: "Enter your PRN" },
        {
          name: "class",
          label: "Class",
          type: "select",
          required: true,
          options: ["FY-CSE", "SY-CSE", "TY-CSE", "FY-IT", "SY-IT", "TY-IT"],
        },
      ],
      registeredStudents: 32,
      venueType: "classroom",
      seatArrangement: "60 seats - Boys section",
      isRegistered: true,
      hasPaid: true,
    },
    {
      id: 3,
      title: "Career Guidance Workshop",
      description: "Industry experts will provide guidance on career opportunities in the tech industry.",
      date: "2023-11-05",
      time: "11:00 AM",
      venue: "Seminar Hall",
      poster: "/placeholder.svg?height=200&width=400",
      maxParticipants: 150,
      targetAudience: ["All Departments"],
      onlinePayment: true,
      paymentAmount: "200",
      allowRegistration: true,
      registrationFields: [
        { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
        { name: "email", label: "Email Address", type: "email", required: true, placeholder: "Enter your email" },
        {
          name: "year",
          label: "Academic Year",
          type: "select",
          required: true,
          options: ["First Year", "Second Year", "Third Year", "Fourth Year"],
        },
      ],
      registeredStudents: 78,
      venueType: "solar-shade",
      seatArrangement: "80 seats available",
      isRegistered: false,
      hasPaid: false,
    },
  ]

  const allEvents = [...defaultEvents, ...events].map((event) => ({
    ...event,
    isRegistered: registeredEvents.has(event.id),
  }))

  const handleRegister = () => {
    if (!selectedEvent) return

    // Check if already registered
    if (registeredEvents.has(selectedEvent.id)) {
      toast({
        title: "Already Registered",
        description: "You have already registered for this event.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    const requiredFields = selectedEvent.registrationFields?.filter((field) => field.required) || []
    const missingFields = requiredFields.filter((field) => !registrationData[field.name]?.trim())

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.map((f) => f.label).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)

    // Simulate registration process
    setTimeout(() => {
      setIsRegistering(false)

      if (selectedEvent.onlinePayment && selectedEvent.paymentAmount) {
        setShowPayment(true)
      } else {
        // Complete registration without payment
        completeRegistration()
      }
    }, 1500)
  }

  const completeRegistration = () => {
    // Update registered events
    const newRegisteredEvents = new Set(registeredEvents)
    newRegisteredEvents.add(selectedEvent.id)
    setRegisteredEvents(newRegisteredEvents)

    // Save to localStorage
    localStorage.setItem("studentRegistrations", JSON.stringify([...newRegisteredEvents]))

    // Update event registration count
    const updatedEvents = events.map((event) =>
      event.id === selectedEvent.id ? { ...event, registeredStudents: event.registeredStudents + 1 } : event,
    )
    setEvents(updatedEvents)
    localStorage.setItem("events", JSON.stringify(updatedEvents))

    // Update faculty events as well
    const facultyEvents = JSON.parse(localStorage.getItem("facultyEvents") || "[]")
    const updatedFacultyEvents = facultyEvents.map((event) =>
      event.id === selectedEvent.id ? { ...event, registeredStudents: event.registeredStudents + 1 } : event,
    )
    localStorage.setItem("facultyEvents", JSON.stringify(updatedFacultyEvents))

    setSelectedEvent(null)
    setShowPayment(false)
    setRegistrationData({})
    setPaymentMethod("")

    toast({
      title: "Registration Successful",
      description: "You have successfully registered for the event.",
    })
  }

  const handlePayment = () => {
    if (!paymentMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue",
        variant: "destructive",
      })
      return
    }

    // Simulate payment process
    setTimeout(() => {
      completeRegistration()
      toast({
        title: "Payment Successful",
        description: `Payment of ₹${selectedEvent.paymentAmount} completed successfully.`,
      })
    }, 2000)
  }

  const getFilteredEvents = () => {
    if (!searchQuery) return allEvents

    const query = searchQuery.toLowerCase()
    return allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query),
    )
  }

  const renderFormField = (field) => {
    const value = registrationData[field.name] || ""

    if (field.type === "select") {
      return (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={value}
            onValueChange={(val) => setRegistrationData({ ...registrationData, [field.name]: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`}></SelectValue>
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={field.name}
          type={field.type}
          value={value}
          onChange={(e) => setRegistrationData({ ...registrationData, [field.name]: e.target.value })}
          placeholder={field.placeholder}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campus Events</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredEvents().map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={event.poster || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {event.isRegistered && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Registered
                      </Badge>
                    </div>
                  )}
                  {event.onlinePayment && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-600 text-white">
                        <DollarSign className="h-3 w-3 mr-1" />₹{event.paymentAmount}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.venue}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {event.registeredStudents} registered
                      {event.maxParticipants && ` / ${event.maxParticipants} max`}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {Array.isArray(event.targetAudience) &&
                      event.targetAudience.map((dept) => (
                        <Badge key={dept} variant="outline" className="text-xs">
                          {dept}
                        </Badge>
                      ))}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setSelectedEvent(event)}
                    disabled={event.isRegistered}
                    variant={event.isRegistered ? "outline" : "default"}
                  >
                    {event.isRegistered ? "Already Registered" : "Register Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {getFilteredEvents().length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Registration Dialog */}
      <Dialog open={!!selectedEvent && !showPayment} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.title}</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4 mb-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {selectedEvent.date} at {selectedEvent.time}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mb-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedEvent.venue}</span>
                </div>
                {selectedEvent.onlinePayment && (
                  <div className="flex items-center space-x-4">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Registration Fee: ₹{selectedEvent.paymentAmount}</span>
                  </div>
                )}
              </div>

              {selectedEvent.registrationFields && selectedEvent.registrationFields.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Registration Information</h4>
                  {selectedEvent.registrationFields.map(renderFormField)}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Cancel
                </Button>
                <Button onClick={handleRegister} disabled={isRegistering}>
                  {isRegistering ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={() => setShowPayment(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Event:</span>
                <span className="text-sm">{selectedEvent?.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Amount:</span>
                <span className="text-lg font-bold text-green-600">₹{selectedEvent?.paymentAmount}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <div className="space-y-2">
                <div
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    paymentMethod === "upi" ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <div className="flex items-center space-x-3">
                    <QrCode className="h-5 w-5" />
                    <div>
                      <div className="font-medium">UPI Payment</div>
                      <div className="text-sm text-gray-500">Pay using UPI apps</div>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    paymentMethod === "card" ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Card Payment</div>
                      <div className="text-sm text-gray-500">Debit/Credit card</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowPayment(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={!paymentMethod}>
                Pay ₹{selectedEvent?.paymentAmount}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
