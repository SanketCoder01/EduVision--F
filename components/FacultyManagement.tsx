"use client"

import { useState, useEffect } from "react"
import { GraduationCap, Search, Filter, Download, Trash2, Eye, Edit, MoreHorizontal, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { getAllFaculty, deleteFaculty, type FacultyData } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface FacultyManagementProps {
  onStatsUpdate?: () => void
}

export default function FacultyManagement({ onStatsUpdate }: FacultyManagementProps) {
  const [faculty, setFaculty] = useState<FacultyData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [facultyToDelete, setFacultyToDelete] = useState<FacultyData | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadFaculty()
  }, [])

  const loadFaculty = async () => {
    try {
      setLoading(true)
      const data = await getAllFaculty()
      setFaculty(data)
    } catch (error) {
      console.error("Error loading faculty:", error)
      toast({
        title: "Error",
        description: "Failed to load faculty",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFaculty = async () => {
    if (!facultyToDelete) return

    try {
      await deleteFaculty(facultyToDelete.id!)
      setFaculty(faculty.filter((f) => f.id !== facultyToDelete.id))
      toast({
        title: "Success",
        description: "Faculty member deleted successfully",
      })
      onStatsUpdate?.()
    } catch (error) {
      console.error("Error deleting faculty:", error)
      toast({
        title: "Error",
        description: "Failed to delete faculty member",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setFacultyToDelete(null)
    }
  }

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getDepartmentBadgeColor = (department: string) => {
    const colors: Record<string, string> = {
      cse: "bg-blue-100 text-blue-800",
      cy: "bg-purple-100 text-purple-800",
      aids: "bg-green-100 text-green-800",
      aiml: "bg-orange-100 text-orange-800",
    }
    return colors[department] || "bg-gray-100 text-gray-800"
  }

  const getDesignationBadgeColor = (designation: string) => {
    const colors: Record<string, string> = {
      Professor: "bg-red-100 text-red-800",
      "Associate Professor": "bg-purple-100 text-purple-800",
      "Assistant Professor": "bg-blue-100 text-blue-800",
      Lecturer: "bg-green-100 text-green-800",
    }
    return colors[designation] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Management</h2>
          <p className="text-gray-600">Manage faculty members and their assignments</p>
        </div>
        <Button
          onClick={() => router.push("/university/manage-faculty/add")}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Faculty</p>
                <p className="text-2xl font-bold">{faculty.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Professors</p>
                <p className="text-2xl font-bold">{faculty.filter((f) => f.designation === "Professor").length}</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold">{new Set(faculty.map((f) => f.department)).size}</p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Experience</p>
                <p className="text-2xl font-bold">
                  {faculty.length > 0
                    ? Math.round(faculty.reduce((sum, f) => sum + f.experience_years, 0) / faculty.length)
                    : 0}
                  y
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search faculty by name, email, employee ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Members ({filteredFaculty.length})</CardTitle>
          <CardDescription>Complete list of faculty members</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Details</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-sm text-gray-600">{f.email}</p>
                        {f.qualification && <p className="text-xs text-gray-500">{f.qualification}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{f.employee_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDepartmentBadgeColor(f.department)}>{f.department.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDesignationBadgeColor(f.designation)}>{f.designation}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{f.experience_years} years</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={f.status === "active" ? "default" : "secondary"}
                        className={f.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {f.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Faculty
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setFacultyToDelete(f)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Faculty
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredFaculty.length === 0 && (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No faculty members found</p>
              <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {facultyToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFaculty} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
