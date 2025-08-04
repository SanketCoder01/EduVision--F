"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  AlertCircle,
  Calendar, 
  Check,
  Clock, 
  Download, 
  FileText, 
  HelpCircle, 
  Loader2,
  Plus,
  Search,
  Upload
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const certificateRequests = [
  {
    id: 1,
    type: "Bonafide Certificate",
    requestDate: "May 10, 2023",
    purpose: "Internship Application",
    status: "Approved",
    approvedBy: "Dr. Sharma",
    approvedDate: "May 12, 2023",
    documentUrl: "#",
  },
  {
    id: 2,
    type: "Internship Letter",
    requestDate: "April 25, 2023",
    purpose: "Summer Internship at TechCorp",
    status: "Pending",
    approvedBy: "",
    approvedDate: "",
    documentUrl: "",
  },
  {
    id: 3,
    type: "Character Certificate",
    requestDate: "March 15, 2023",
    purpose: "Visa Application",
    status: "Rejected",
    approvedBy: "Dr. Patel",
    approvedDate: "March 18, 2023",
    reason: "Insufficient information provided. Please reapply with complete details.",
    documentUrl: "",
  },
]

const certificateTypes = [
  {
    id: "bonafide",
    name: "Bonafide Certificate",
    description: "Confirms your enrollment as a student",
    processingTime: "2-3 working days",
    requirements: ["Valid student ID", "No pending fees"],
  },
  {
    id: "other",
    name: "Other Document",
    description: "Request any other official document not listed",
    processingTime: "5-7 working days",
    requirements: ["Valid student ID", "Supporting documents", "Specific details about the document"],
  }
]

export default function CertificateRequestPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCertificateType, setSelectedCertificateType] = useState("")
  const [otherDocumentName, setOtherDocumentName] = useState("")
  const [purpose, setPurpose] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [submittedRequests, setSubmittedRequests] = useState(certificateRequests)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const filteredRequests = submittedRequests.filter(
    (request) =>
      request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")
    
    // Validate form
    if (!selectedCertificateType) {
      setFormError("Please select a document type")
      setIsSubmitting(false)
      return
    }
    
    if (selectedCertificateType === "other" && !otherDocumentName) {
      setFormError("Please specify the document name")
      setIsSubmitting(false)
      return
    }
    
    if (!purpose) {
      setFormError("Please provide a purpose for your request")
      setIsSubmitting(false)
      return
    }
    
    if (!uploadedFile) {
      setFormError("Please upload a supporting document")
      setIsSubmitting(false)
      return
    }
    
    // Create new request object
    const newRequest = {
      id: submittedRequests.length + 1,
      type: selectedCertificateType === "bonafide" ? "Bonafide Certificate" : otherDocumentName,
      requestDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      purpose: purpose,
      status: "Pending",
      approvedBy: "",
      approvedDate: "",
      documentUrl: "",
    }
    
    // Simulate API call
    setTimeout(() => {
      // Add new request to the list
      setSubmittedRequests([newRequest, ...submittedRequests])
      
      // Reset form
      setSelectedCertificateType("")
      setOtherDocumentName("")
      setPurpose("")
      setAdditionalInfo("")
      setUploadedFile(null)
      setIsSubmitting(false)
      
      // Show success message
      alert("Certificate request submitted successfully!")
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                <FileText className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Certificate Requests</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Request and track official documents and certificates</p>
          </div>
        </div>

        <Tabs defaultValue="requests" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Certificate Requests</CardTitle>
                <CardDescription>Track the status of your certificate and document requests</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by type, purpose, or status..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            request.status === "Approved" ? "bg-green-100 text-green-700" :
                            request.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {
                              request.status === "Approved" ? <Check className="h-6 w-6" /> :
                              request.status === "Pending" ? <Clock className="h-6 w-6" /> :
                              <AlertCircle className="h-6 w-6" />
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="font-semibold text-gray-900">{request.type}</h3>
                              <Badge
                                variant="outline"
                                className={`${
                                  request.status === "Approved" ? "bg-green-100 text-green-700" :
                                  request.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                } border-0 mt-1 sm:mt-0`}
                              >
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Purpose: {request.purpose}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                Requested: {request.requestDate}
                              </div>
                              {request.approvedDate && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {request.status === "Approved" ? "Approved" : "Reviewed"}: {request.approvedDate}
                                </div>
                              )}
                              {request.approvedBy && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <span className="mr-1">By:</span>
                                  {request.approvedBy}
                                </div>
                              )}
                            </div>
                            {request.reason && (
                              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start">
                                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{request.reason}</span>
                              </div>
                            )}
                            <div className="mt-4 flex justify-end">
                              {request.status === "Rejected" && (
                                <Button variant="outline" size="sm" className="text-xs mr-2">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Reapply
                                </Button>
                              )}
                              {request.status === "Pending" && (
                                <Button variant="outline" size="sm" className="text-xs mr-2 border-red-200 text-red-600 hover:bg-red-50">
                                  Cancel Request
                                </Button>
                              )}
                              {request.status === "Approved" && request.documentUrl && (
                                <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No certificate requests found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Request a New Certificate</CardTitle>
                <CardDescription>Fill out the form below to request an official document or certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 rounded-lg text-red-600 text-sm mb-4 flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Document Type</label>
                    <Select value={selectedCertificateType} onValueChange={setSelectedCertificateType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificateTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCertificateType === "other" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Document Name</label>
                      <Input 
                        placeholder="Specify the document you need" 
                        value={otherDocumentName}
                        onChange={(e) => setOtherDocumentName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {selectedCertificateType && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-1">
                        {certificateTypes.find(t => t.id === selectedCertificateType)?.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {certificateTypes.find(t => t.id === selectedCertificateType)?.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Processing Time: {certificateTypes.find(t => t.id === selectedCertificateType)?.processingTime}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Requirements:</span>
                        <ul className="list-disc list-inside mt-1">
                          {certificateTypes.find(t => t.id === selectedCertificateType)?.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Purpose</label>
                    <Input 
                      placeholder="e.g., Internship application, Visa, Scholarship" 
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Additional Information</label>
                    <Textarea 
                      placeholder="Provide any additional details that may be relevant to your request" 
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Supporting Documents (if any)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {uploadedFile ? (
                          <div className="flex flex-col items-center">
                            <FileText className="h-8 w-8 text-indigo-500 mb-2" />
                            <p className="text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => setUploadedFile(null)}
                            >
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">Click to upload a file</p>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, JPG, or PNG (max. 5MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Information</CardTitle>
                <CardDescription>Learn about the different types of certificates and documents available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {certificateTypes.map((type) => (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-indigo-100 text-indigo-700">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{type.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                          
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500">PROCESSING TIME</p>
                              <p className="text-sm">{type.processingTime}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">REQUIREMENTS</p>
                              <ul className="text-sm list-disc list-inside">
                                {type.requirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="mt-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                    <div className="flex items-start">
                      <HelpCircle className="h-5 w-5 text-indigo-700 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          If you have questions about which certificate you need or how to complete your request, please contact the Academic Office.
                        </p>
                        <div className="text-sm">
                          <p><span className="font-medium">Email:</span> academic.office@university.edu</p>
                          <p><span className="font-medium">Phone:</span> (555) 123-4567</p>
                          <p><span className="font-medium">Location:</span> Admin Building, Room 205</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
