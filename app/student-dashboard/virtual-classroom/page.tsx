"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Video,
  Users,
  MessageSquare,
  Hand,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
  Share,
  FileText,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function VirtualClassroomPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("chat")
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [message, setMessage] = useState("")
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showResourcesDialog, setShowResourcesDialog] = useState(false)

  // Mock participants data
  const participants = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Professor",
      avatar: "/placeholder.svg?height=40&width=40",
      isSpeaking: true,
      hasCamera: true,
      hasMic: true,
    },
    {
      id: 2,
      name: "John Doe",
      role: "Student",
      avatar: "/placeholder.svg?height=40&width=40",
      isSpeaking: false,
      hasCamera: true,
      hasMic: true,
    },
    {
      id: 3,
      name: "Jane Smith",
      role: "Student",
      avatar: "/placeholder.svg?height=40&width=40",
      isSpeaking: false,
      hasCamera: true,
      hasMic: false,
    },
    {
      id: 4,
      name: "Alex Johnson",
      role: "Student",
      avatar: "/placeholder.svg?height=40&width=40",
      isSpeaking: false,
      hasCamera: false,
      hasMic: true,
    },
    {
      id: 5,
      name: "Emily Chen",
      role: "Student",
      avatar: "/placeholder.svg?height=40&width=40",
      isSpeaking: false,
      hasCamera: true,
      hasMic: true,
    },
    {
      id: 6,
      name: "Michael Brown",
      role: "Student",
      avatar: "/placeholder.svg?height=40&width=40",
      isSpeaking: false,
      hasCamera: true,
      hasMic: true,
    },
  ]

  // Mock chat messages
  const chatMessages = [
    {
      id: 1,
      sender: "Dr. Sarah Johnson",
      role: "Professor",
      message: "Welcome to today's virtual class on Data Structures!",
      time: "10:00 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      sender: "Jane Smith",
      role: "Student",
      message: "Good morning, Professor!",
      time: "10:01 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      sender: "Alex Johnson",
      role: "Student",
      message: "I had a question about the binary tree implementation we discussed last time.",
      time: "10:03 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      sender: "Dr. Sarah Johnson",
      role: "Professor",
      message: "Great question, Alex. Let's go over that after I explain today's topic.",
      time: "10:04 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      sender: "Emily Chen",
      role: "Student",
      message: "I've shared some useful resources in the resources tab for everyone.",
      time: "10:05 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 6,
      sender: "Dr. Sarah Johnson",
      role: "Professor",
      message: "Thanks Emily! Everyone, please check the resources tab for additional materials.",
      time: "10:06 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  // Mock resources
  const resources = [
    {
      id: 1,
      name: "Lecture Slides - Data Structures",
      type: "pdf",
      size: "2.5 MB",
      uploadedBy: "Dr. Sarah Johnson",
      uploadTime: "9:55 AM",
    },
    {
      id: 2,
      name: "Binary Tree Implementation Example",
      type: "zip",
      size: "1.2 MB",
      uploadedBy: "Dr. Sarah Johnson",
      uploadTime: "9:56 AM",
    },
    {
      id: 3,
      name: "Additional Reading - Advanced Tree Structures",
      type: "pdf",
      size: "3.8 MB",
      uploadedBy: "Emily Chen",
      uploadTime: "10:05 AM",
    },
    {
      id: 4,
      name: "Practice Problems",
      type: "pdf",
      size: "1.5 MB",
      uploadedBy: "Dr. Sarah Johnson",
      uploadTime: "10:10 AM",
    },
  ]

  // Handle send message
  const handleSendMessage = () => {
    if (!message.trim()) return

    // In a real app, you would send this message to your backend
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the class.",
    })

    setMessage("")
  }

  // Handle raise hand
  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised)

    toast({
      title: isHandRaised ? "Hand Lowered" : "Hand Raised",
      description: isHandRaised
        ? "You have lowered your hand."
        : "You have raised your hand. The professor will see your request.",
    })
  }

  // Handle leave class
  const handleLeaveClass = () => {
    // In a real app, you would disconnect from the virtual classroom
    toast({
      title: "Left Classroom",
      description: "You have left the virtual classroom.",
    })

    // Redirect to dashboard or another page
    window.location.href = "/student-dashboard"
  }

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "zip":
        return <FileText className="h-5 w-5 text-purple-500" />
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="max-w-full mx-auto">
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Video className="inline-block mr-2 h-6 w-6 text-purple-600" />
            Virtual Classroom
          </h1>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="bg-purple-100 text-purple-800 mr-2">
              Data Structures and Algorithms
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              Started at 10:00 AM • Duration: 1h 30m
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowResourcesDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Resources
          </Button>

          <Button variant="destructive" size="sm" onClick={() => setShowLeaveDialog(true)}>
            <PhoneOff className="h-4 w-4 mr-2" />
            Leave
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="mb-4">
            <CardContent className="p-0">
              <div
                className="relative w-full bg-black rounded-md overflow-hidden"
                style={{ height: "calc(100vh - 250px)" }}
              >
                {/* Main video display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=720&width=1280"
                    alt="Video stream"
                    className="w-full h-full object-cover"
                  />

                  {/* Speaker name overlay */}
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded-md text-white flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Dr. Sarah Johnson" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <span>Dr. Sarah Johnson</span>
                  </div>
                </div>

                {/* Video controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="flex items-center justify-center gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-full ${!isMicOn ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"}`}
                            onClick={() => setIsMicOn(!isMicOn)}
                          >
                            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isMicOn ? "Mute Microphone" : "Unmute Microphone"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-full ${!isCameraOn ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"}`}
                            onClick={() => setIsCameraOn(!isCameraOn)}
                          >
                            {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isCameraOn ? "Turn Off Camera" : "Turn On Camera"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-full ${isHandRaised ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"}`}
                            onClick={handleRaiseHand}
                          >
                            <Hand className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isHandRaised ? "Lower Hand" : "Raise Hand"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                          >
                            <Share className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share Screen</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full bg-red-500 text-white hover:bg-red-600"
                            onClick={() => setShowLeaveDialog(true)}
                          >
                            <PhoneOff className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Leave Class</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {participants.slice(1).map((participant) => (
              <div key={participant.id} className="relative">
                <div
                  className={`aspect-video bg-gray-900 rounded-md overflow-hidden ${participant.hasCamera ? "" : "flex items-center justify-center"}`}
                >
                  {participant.hasCamera ? (
                    <img
                      src={participant.avatar || "/placeholder.svg"}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                    <span className="text-xs text-white bg-black bg-opacity-50 px-1 rounded truncate">
                      {participant.name}
                    </span>

                    {!participant.hasMic && <MicOff className="h-3 w-3 text-white bg-red-500 rounded-full p-0.5" />}
                  </div>

                  {participant.isSpeaking && (
                    <div className="absolute inset-0 border-2 border-green-500 rounded-md animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-[calc(100vh-180px)]">
            <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="chat"
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Participants
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={msg.avatar || "/placeholder.svg"} alt={msg.sender} />
                        <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{msg.sender}</span>
                          {msg.role === "Professor" && (
                            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                              Professor
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{msg.time}</span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
                      Send
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="participants" className="flex-1 overflow-y-auto p-4 m-0 space-y-2">
                <div className="text-sm text-gray-500 mb-2">{participants.length} participants</div>

                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{participant.name}</span>
                          {participant.role === "Professor" && (
                            <Badge variant="outline" className="ml-2 text-xs bg-purple-100 text-purple-800">
                              Professor
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          {participant.isSpeaking && (
                            <span className="flex items-center text-green-600 mr-2">
                              <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                              Speaking
                            </span>
                          )}
                          {!participant.hasMic && (
                            <span className="flex items-center text-red-600 mr-2">
                              <MicOff className="h-3 w-3 mr-1" />
                              Muted
                            </span>
                          )}
                          {!participant.hasCamera && (
                            <span className="flex items-center text-gray-600">
                              <CameraOff className="h-3 w-3 mr-1" />
                              No Video
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Leave Confirmation Dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Leave Virtual Classroom?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave the virtual classroom? You can rejoin at any time.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLeaveClass}>
                Leave Class
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resources Dialog */}
      {showResourcesDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Class Resources</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowResourcesDialog(false)}>
                ×
              </Button>
            </div>

            <div className="space-y-3">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    {getFileIcon(resource.type)}
                    <div className="ml-3">
                      <p className="font-medium text-sm">{resource.name}</p>
                      <p className="text-xs text-gray-500">
                        {resource.size} • Uploaded by {resource.uploadedBy} at {resource.uploadTime}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
