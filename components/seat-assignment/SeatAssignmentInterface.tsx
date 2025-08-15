"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Trash2, Users, MapPin } from 'lucide-react'
import SeatVisualization from './SeatVisualization'
import { DEPARTMENTS } from '@/lib/constants/departments'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const GENDERS = ['Male', 'Female']

interface SeatAssignment {
  id: string
  department: string
  year: string
  gender?: string
  seat_numbers: number[]
  row_numbers: number[]
  venue_type: string
}

interface SeatAssignmentInterfaceProps {
  eventId: string
  venueType: 'seminar-hall' | 'solar-shade'
  assignments: SeatAssignment[]
  onAssignmentCreateAction: (assignment: Omit<SeatAssignment, 'id' | 'event_id' | 'created_at'>) => Promise<void>
  onAssignmentUpdateAction: (assignmentId: string, seatNumbers: number[]) => Promise<void>
  onAssignmentDeleteAction: (assignmentId: string) => Promise<void>
}

export default function SeatAssignmentInterface({
  eventId,
  venueType,
  assignments,
  onAssignmentCreateAction,
  onAssignmentUpdateAction,
  onAssignmentDeleteAction
}: SeatAssignmentInterfaceProps) {
  const { toast } = useToast()
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [currentDepartment, setCurrentDepartment] = useState('')
  const [currentYear, setCurrentYear] = useState('')
  const [currentGender, setCurrentGender] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const handleSeatClick = (seatNumber: number) => {
    // Check if seat is already assigned
    const isAssigned = assignments.some(assignment => 
      assignment.seat_numbers.includes(seatNumber)
    )
    
    if (isAssigned) {
      toast({
        title: "Seat Already Assigned",
        description: "This seat is already assigned to another group.",
        variant: "destructive"
      })
      return
    }

    setSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(seat => seat !== seatNumber)
        : [...prev, seatNumber]
    )
  }

  const handleAssignSeats = async () => {
    if (!currentDepartment || !currentYear || selectedSeats.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select department, year, and at least one seat.",
        variant: "destructive"
      })
      return
    }

    setIsAssigning(true)

    try {
      const rowNumbers = selectedSeats.map(seat => Math.ceil(seat / 16)) // Assuming 16 seats per row
      
      await onAssignmentCreateAction({
        department: currentDepartment,
        year: currentYear,
        gender: currentGender || undefined,
        seat_numbers: selectedSeats,
        row_numbers: Array.from(new Set(selectedSeats.map(seat => Math.floor((seat - 1) / 16) + 1))),
        venue_type: venueType
      })

      setSelectedSeats([])
      setCurrentDepartment('')
      setCurrentYear('')
      setCurrentGender('')

      toast({
        title: "Seats Assigned",
        description: `Successfully assigned ${selectedSeats.length} seats to ${currentDepartment} ${currentYear}.`
      })
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign seats. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await onAssignmentDeleteAction(assignmentId)
      toast({
        title: "Assignment Deleted",
        description: "Seat assignment has been removed."
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive"
      })
    }
  }

  const clearSelection = () => {
    setSelectedSeats([])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Seat Assignment Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={currentDepartment} onValueChange={setCurrentDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={currentYear} onValueChange={setCurrentYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year: string) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender (Optional)</Label>
              <Select value={currentGender} onValueChange={setCurrentGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {GENDERS.map((gender: string) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedSeats.length} seats</span>
              </div>
              {selectedSeats.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              )}
            </div>

            <Button 
              onClick={handleAssignSeats}
              disabled={!currentDepartment || !currentYear || selectedSeats.length === 0 || isAssigning}
            >
              {isAssigning ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Assign {selectedSeats.length} Seats
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seat Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <SeatVisualization
            venueType={venueType}
            assignments={assignments}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <div className="font-medium">{assignment.department}</div>
                      <div className="text-sm text-gray-600">
                        {assignment.year}
                        {assignment.gender && ` • ${assignment.gender}`}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {assignment.seat_numbers.length} seats
                    </Badge>
                    <div className="text-sm text-gray-500">
                      Seats: {assignment.seat_numbers.slice(0, 5).join(', ')}
                      {assignment.seat_numbers.length > 5 && ` +${assignment.seat_numbers.length - 5} more`}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
