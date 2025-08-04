"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Clock, Download, ExternalLink, Library, Search } from "lucide-react"

const books = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    cover: "/placeholder.svg",
    available: true,
    category: "Computer Science",
    location: "Main Library - Floor 2",
    isbn: "978-0262033848",
  },
  {
    id: 2,
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    cover: "/placeholder.svg",
    available: true,
    category: "Computer Science",
    location: "Main Library - Floor 2",
    isbn: "978-0134610993",
  },
  {
    id: 3,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    cover: "/placeholder.svg",
    available: false,
    category: "Computer Science",
    location: "Main Library - Floor 2",
    isbn: "978-0132350884",
  },
  {
    id: 4,
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    cover: "/placeholder.svg",
    available: true,
    category: "Computer Science",
    location: "Main Library - Floor 2",
    isbn: "978-0201633610",
  },
  {
    id: 5,
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
    cover: "/placeholder.svg",
    available: true,
    category: "Computer Science",
    location: "Main Library - Floor 2",
    isbn: "978-0073523323",
  },
]

const digitalResources = [
  {
    id: 1,
    title: "IEEE Xplore Digital Library",
    description: "Access to IEEE journals, conferences, standards, and educational courses.",
    icon: ExternalLink,
    url: "#",
  },
  {
    id: 2,
    title: "ACM Digital Library",
    description: "Full-text collection of all ACM publications, including journals, conference proceedings, technical magazines, newsletters, and books.",
    icon: ExternalLink,
    url: "#",
  },
  {
    id: 3,
    title: "ScienceDirect",
    description: "Full-text scientific database offering journal articles and book chapters from more than 2,500 journals and 26,000 books.",
    icon: ExternalLink,
    url: "#",
  },
  {
    id: 4,
    title: "JSTOR",
    description: "Digital library of academic journals, books, and primary sources.",
    icon: ExternalLink,
    url: "#",
  },
]

const libraryHours = [
  { day: "Monday", hours: "8:00 AM - 10:00 PM" },
  { day: "Tuesday", hours: "8:00 AM - 10:00 PM" },
  { day: "Wednesday", hours: "8:00 AM - 10:00 PM" },
  { day: "Thursday", hours: "8:00 AM - 10:00 PM" },
  { day: "Friday", hours: "8:00 AM - 8:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
  { day: "Sunday", hours: "12:00 PM - 6:00 PM" },
]

export default function LibraryServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Library className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Library Services</h1>
            </div>
            <p className="text-gray-500 mt-1 ml-11">Access digital library resources, reserve books, and check availability</p>
          </div>
        </div>

        <Tabs defaultValue="catalog" className="mb-8">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
            <TabsTrigger value="digital">Digital Resources</TabsTrigger>
            <TabsTrigger value="info">Library Information</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Catalog</CardTitle>
                <CardDescription>Search and browse available books in the university library</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title or author..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <Avatar className="h-16 w-16 rounded-md">
                          <AvatarImage src={book.cover} alt={book.title} />
                          <AvatarFallback className="rounded-md bg-blue-100 text-blue-700">
                            <BookOpen className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{book.title}</h3>
                          <p className="text-sm text-gray-500">{book.author}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={`${book.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} border-0`}
                            >
                              {book.available ? "Available" : "Checked Out"}
                            </Badge>
                            <span className="text-xs text-gray-500">{book.category}</span>
                          </div>
                          <div className="mt-3 flex justify-between">
                            <Button variant="outline" size="sm" className="text-xs">
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              disabled={!book.available}
                            >
                              {book.available ? "Reserve" : "Join Waitlist"}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 text-center">
                      <p className="text-gray-500">No books found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="digital" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Digital Resources</CardTitle>
                <CardDescription>Access online journals, e-books, and research databases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {digitalResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                          <resource.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{resource.description}</p>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Access Resource
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Clock className="h-5 w-5" />
                    </div>
                    <CardTitle>Library Hours</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {libraryHours.map((item, index) => (
                      <div key={index} className="flex justify-between py-2">
                        <span className="font-medium">{item.day}</span>
                        <span className="text-gray-600">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Download className="h-5 w-5" />
                    </div>
                    <CardTitle>Resources & Guides</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <h3 className="font-medium">Library User Guide</h3>
                      <p className="text-sm text-gray-500">How to use library resources and services</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <h3 className="font-medium">Citation Styles Guide</h3>
                      <p className="text-sm text-gray-500">APA, MLA, Chicago, and other citation formats</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <h3 className="font-medium">Research Methodology</h3>
                      <p className="text-sm text-gray-500">Guide to conducting academic research</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <h3 className="font-medium">Interlibrary Loan</h3>
                      <p className="text-sm text-gray-500">Request books from other libraries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
