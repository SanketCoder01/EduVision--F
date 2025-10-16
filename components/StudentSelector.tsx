"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Search, Users, Filter } from 'lucide-react'
import { getStudentsByDepartmentAndYears, StudentData, formatDepartmentName, formatYearName } from '@/lib/student-data-service'

interface StudentSelectorProps {
  department?: string  // If provided, only show students from this department
  years?: string[]     // If provided, only show students from these years
  selectedStudents: string[]  // Array of student IDs
  onSelectionChange: (studentIds: string[]) => void
  multiSelect?: boolean  // Allow multiple selections
  showFilters?: boolean  // Show department/year filters
  title?: string
}

export default function StudentSelector({
  department,
  years,
  selectedStudents,
  onSelectionChange,
  multiSelect = true,
  showFilters = true,
  title = "Select Students"
}: StudentSelectorProps) {
  const [students, setStudents] = useState<StudentData[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState(department || 'cse')
  const [selectedYears, setSelectedYears] = useState<string[]>(years || [])

  const departments = [
    { value: 'cse', label: 'Computer Science & Engineering' },
    { value: 'cyber', label: 'Cyber Security' },
    { value: 'aids', label: 'Artificial Intelligence & Data Science' },
    { value: 'aiml', label: 'Artificial Intelligence & Machine Learning' }
  ]

  const yearOptions = [
    { value: 'first', label: 'First Year' },
    { value: 'second', label: 'Second Year' },
    { value: 'third', label: 'Third Year' },
    { value: 'fourth', label: 'Fourth Year' }
  ]

  useEffect(() => {
    loadStudents()
  }, [selectedDept, selectedYears])

  useEffect(() => {
    filterStudents()
  }, [students, searchQuery])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await getStudentsByDepartmentAndYears(
        selectedDept,
        selectedYears.length > 0 ? selectedYears : []
      )
      setStudents(data)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = students.filter(student => 
      student.name?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      student.prn?.toLowerCase().includes(query)
    )
    setFilteredStudents(filtered)
  }

  const toggleStudent = (studentId: string) => {
    if (multiSelect) {
      if (selectedStudents.includes(studentId)) {
        onSelectionChange(selectedStudents.filter(id => id !== studentId))
      } else {
        onSelectionChange([...selectedStudents, studentId])
      }
    } else {
      onSelectionChange([studentId])
    }
  }

  const toggleYear = (year: string) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year))
    } else {
      setSelectedYears([...selectedYears, year])
    }
  }

  const selectAll = () => {
    const allIds = filteredStudents.map(s => s.id)
    onSelectionChange(allIds)
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {title}
          </span>
          <Badge variant="outline">
            {selectedStudents.length} / {filteredStudents.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && !department && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Department</Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter by Year</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {yearOptions.map(year => (
                  <Badge
                    key={year.value}
                    variant={selectedYears.includes(year.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => !years && toggleYear(year.value)}
                  >
                    {year.label}
                  </Badge>
                ))}
                {selectedYears.length > 0 && !years && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setSelectedYears([])}
                  >
                    Clear
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or PRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Action Buttons */}
        {multiSelect && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={selectAll}
              disabled={filteredStudents.length === 0}
            >
              Select All ({filteredStudents.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearSelection}
              disabled={selectedStudents.length === 0}
            >
              Clear Selection
            </Button>
          </div>
        )}

        {/* Student List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No students found</p>
              {searchQuery && <p className="text-sm">Try adjusting your search</p>}
            </div>
          ) : (
            filteredStudents.map(student => (
              <div
                key={student.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedStudents.includes(student.id)
                    ? 'bg-blue-50 border-blue-300'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => toggleStudent(student.id)}
              >
                {multiSelect && (
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => toggleStudent(student.id)}
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {student.name || student.full_name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {formatYearName(student.year)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="truncate">{student.email}</span>
                    <span>•</span>
                    <span>{student.prn}</span>
                  </div>
                </div>

                {student.face_url && (
                  <img
                    src={student.face_url}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Students:</span>
            <span className="font-semibold">{students.length}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Selected:</span>
            <span className="font-semibold text-blue-600">{selectedStudents.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
