"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { DEPARTMENTS, VENUE_CONFIGS, DEPARTMENT_COLORS } from '@/lib/constants/departments'

interface SeatAssignment {
  id: string
  department: string
  year: string
  gender?: string
  seat_numbers: number[]
  row_numbers: number[]
}

interface SeatVisualizationProps {
  venueType: 'seminar-hall' | 'solar-shade'
  assignments: SeatAssignment[]
  selectedSeats?: number[]
  onSeatClick?: (seatNumber: number) => void
  readOnly?: boolean
  studentView?: boolean
  studentDepartment?: string
  studentYear?: string
  studentGender?: string
}

export default function SeatVisualization({
  venueType,
  assignments,
  selectedSeats = [],
  onSeatClick,
  readOnly = false,
  studentView = false,
  studentDepartment,
  studentYear,
  studentGender
}: SeatVisualizationProps) {
  const config = VENUE_CONFIGS[venueType]
  
  const getSeatAssignment = (seatNumber: number): SeatAssignment | null => {
    return assignments.find(assignment => 
      assignment.seat_numbers.includes(seatNumber)
    ) || null
  }

  const isSeatAvailableForStudent = (seatNumber: number): boolean => {
    if (!studentView || !studentDepartment || !studentYear) return true
    
    const assignment = getSeatAssignment(seatNumber)
    if (!assignment) return false
    
    return assignment.department === studentDepartment && 
           assignment.year === studentYear &&
           (!assignment.gender || assignment.gender === studentGender)
  }

  const getSeatColor = (seatNumber: number): string => {
    const assignment = getSeatAssignment(seatNumber)
    if (!assignment) {
      return 'bg-white border-gray-300 hover:bg-gray-50'
    }
    
    const departmentColor = DEPARTMENT_COLORS[assignment.department as keyof typeof DEPARTMENT_COLORS]
    
    if (studentView && !isSeatAvailableForStudent(seatNumber)) {
      return 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'
    }
    
    if (selectedSeats.includes(seatNumber)) {
      return 'bg-purple-600 border-purple-700 text-white'
    }
    
    return `${departmentColor.bg} ${departmentColor.border} ${departmentColor.text}`
  }

  const handleSeatClick = (seatNumber: number) => {
    if (readOnly || !onSeatClick) return
    
    if (studentView && !isSeatAvailableForStudent(seatNumber)) return
    
    onSeatClick(seatNumber)
  }

  const renderSeatMap = () => {
    const seats = []
    
    for (let row = 0; row < config.rows; row++) {
      const rowSeats = []
      
      for (let seat = 0; seat < config.seatsPerRow; seat++) {
        const seatNumber = row * config.seatsPerRow + seat + 1
        
        if (seatNumber <= config.totalSeats) {
          const assignment = getSeatAssignment(seatNumber)
          const seatColor = getSeatColor(seatNumber)
          const isClickable = !readOnly && (!studentView || isSeatAvailableForStudent(seatNumber))
          
          rowSeats.push(
            <motion.div
              key={seatNumber}
              whileHover={isClickable ? { scale: 1.1 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium border cursor-pointer transition-all ${seatColor} ${
                !isClickable ? 'cursor-not-allowed' : ''
              }`}
              onClick={() => handleSeatClick(seatNumber)}
              title={assignment ? 
                `${assignment.department} - ${assignment.year}${assignment.gender ? ` (${assignment.gender})` : ''}` : 
                'Available'
              }
            >
              {seatNumber}
            </motion.div>
          )
        }
      }
      
      seats.push(
        <div key={row} className="flex justify-center space-x-1 mb-2">
          <div className="w-8 text-xs text-gray-500 flex items-center justify-center">
            {String.fromCharCode(65 + row)}
          </div>
          {rowSeats}
        </div>
      )
    }
    
    return seats
  }

  const renderLegend = () => {
    const usedDepartments = [...new Set(assignments.map(a => a.department))]
    
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Seat Assignment Legend</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {!studentView && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span className="text-sm">Available</span>
              </div>
              
              {selectedSeats.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-600 border border-purple-700 rounded"></div>
                  <span className="text-sm">Selected</span>
                </div>
              )}
            </>
          )}
          
          {usedDepartments.map(department => {
            const color = DEPARTMENT_COLORS[department as keyof typeof DEPARTMENT_COLORS]
            return (
              <div key={department} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${color.bg} ${color.border}`}></div>
                <span className="text-sm">{department}</span>
              </div>
            )
          })}
          
          {studentView && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded opacity-50"></div>
              <span className="text-sm">Not Available</span>
            </div>
          )}
        </div>
        
        {studentView && studentDepartment && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Your assigned section:</span> {studentDepartment} - {studentYear}
              {studentGender && ` (${studentGender})`}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderStats = () => {
    const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.seat_numbers.length, 0)
    const availableSeats = config.totalSeats - totalAssigned
    
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{config.totalSeats}</div>
          <div className="text-sm text-blue-600">Total Seats</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{totalAssigned}</div>
          <div className="text-sm text-green-600">Assigned</div>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{availableSeats}</div>
          <div className="text-sm text-orange-600">Available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!studentView && renderStats()}
      
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-block p-3 bg-gray-100 rounded-lg mb-4">
            <div className="text-lg font-bold">STAGE / FRONT</div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {renderSeatMap()}
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          {config.name} - {config.totalSeats} Total Seats
        </div>
      </div>
      
      {renderLegend()}
      
      {assignments.length > 0 && !studentView && (
        <div className="space-y-3">
          <h4 className="font-medium">Department Assignments</h4>
          <div className="space-y-2">
            {assignments.map((assignment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${DEPARTMENT_COLORS[assignment.department as keyof typeof DEPARTMENT_COLORS]?.bg || 'bg-gray-200'}`}></div>
                  <div>
                    <div className="font-medium">{assignment.department}</div>
                    <div className="text-sm text-gray-500">
                      {assignment.year}{assignment.gender && ` • ${assignment.gender}`}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">
                  {assignment.seat_numbers.length} seats
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
