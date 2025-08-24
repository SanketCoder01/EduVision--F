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
import { DEPARTMENTS, YEARS, GENDERS } from '@/lib/constants/departments'

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

  // Reset selected seats when department/year changes
  useEffect(() => {
    setSelectedSeats([])
  }, [currentDepartment, currentYear])

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
        gender: currentGender && currentGender !== 'all' ? currentGender : undefined,
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
    <div className="space-y-4">
      {/* Mobile-optimized Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Seat Assignment Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Department</Label>
              <Select value={currentDepartment} onValueChange={setCurrentDepartment}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-sm">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Year</Label>
              <Select value={currentYear} onValueChange={setCurrentYear}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year} className="text-sm">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Gender (Optional)</Label>
              <Select value={currentGender} onValueChange={setCurrentGender}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {GENDERS.map((gender) => (
                    <SelectItem key={gender} value={gender} className="text-sm">
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAssignSeats} 
                disabled={!currentDepartment || !currentYear || selectedSeats.length === 0 || isAssigning}
                className="w-full h-9 text-sm"
                size="sm"
              >
                {isAssigning ? 'Assigning...' : `Assign ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                📍 Selected {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}: {selectedSeats.sort((a, b) => a - b).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Assignments - Mobile Optimized */}
      {assignments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Current Assignments ({assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {assignment.department} • {assignment.year}
                      {assignment.gender && assignment.gender !== 'all' && ` • ${assignment.gender}`}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {assignment.seat_numbers.length} seat{assignment.seat_numbers.length !== 1 ? 's' : ''}: {assignment.seat_numbers.sort((a, b) => a - b).slice(0, 10).join(', ')}{assignment.seat_numbers.length > 10 ? '...' : ''}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-700 ml-2 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
