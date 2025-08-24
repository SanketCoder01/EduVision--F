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
  assignments: SeatAssignment[]
  onSeatClick?: (seatNumber: number) => void
  selectedSeats?: number[]
  venueType: 'seminar-hall' | 'solar-shade'
  readOnly?: boolean
  studentView?: boolean
  studentDepartment?: string
  studentYear?: string
  studentGender?: string
  showDepartmentStats?: boolean
}

export default function SeatVisualization({
  assignments,
  onSeatClick,
  selectedSeats = [],
  venueType,
  readOnly = false,
  studentView = false,
  studentDepartment,
  studentYear,
  studentGender,
  showDepartmentStats = true,
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
    
    if (selectedSeats.includes(seatNumber)) {
      return 'bg-purple-600 border-purple-700 text-white shadow-lg'
    }
    
    if (!assignment) {
      return 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all'
    }
    
    if (studentView && !isSeatAvailableForStudent(seatNumber)) {
      return 'bg-red-500 border-red-600 text-white cursor-not-allowed opacity-75'
    }
    
    const departmentColor = DEPARTMENT_COLORS[assignment.department as keyof typeof DEPARTMENT_COLORS]
    return `${departmentColor?.bg || 'bg-black'} ${departmentColor?.border || 'border-black'} ${departmentColor?.text || 'text-white'} shadow-md`
  }

  const handleSeatClick = (seatNumber: number) => {
    if (readOnly || !onSeatClick) return
    
    if (studentView && !isSeatAvailableForStudent(seatNumber)) return
    
    onSeatClick(seatNumber)
  }

  const getDepartmentStats = () => {
    const stats: Record<string, { assigned: number; total: number; color: string }> = {}
    const totalSeats = config.totalSeats
    
    // Initialize department stats
    Object.keys(DEPARTMENT_COLORS).forEach(dept => {
      const deptColor = DEPARTMENT_COLORS[dept as keyof typeof DEPARTMENT_COLORS]
      stats[dept] = { assigned: 0, total: 0, color: deptColor?.bg || 'bg-gray-500' }
    })
    
    // Count assigned seats by department
    assignments.forEach(assignment => {
      const dept = assignment.department
      if (stats[dept]) {
        stats[dept].assigned += assignment.seat_numbers.length
      }
    })
    
    // Calculate available seats
    const totalAssigned = assignments.reduce((sum, assignment) => sum + assignment.seat_numbers.length, 0)
    const availableSeats = totalSeats - totalAssigned
    
    return { stats, availableSeats, totalSeats }
  }

  const { stats, availableSeats, totalSeats } = getDepartmentStats()

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
              whileHover={isClickable ? { scale: 1.1, y: -1 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
              className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded text-xs font-bold border cursor-pointer transition-all duration-200 ${seatColor} ${
                !isClickable ? 'cursor-not-allowed' : 'hover:shadow-md'
              }`}
              onClick={() => handleSeatClick(seatNumber)}
              title={assignment ? 
                `${assignment.department} - ${assignment.year}${assignment.gender ? ` (${assignment.gender})` : ''}` : 
                'Available'
              }
            >
              <span className="text-xs">{seatNumber}</span>
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
      <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3 text-sm sm:text-base">Legend</h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
          {!studentView && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white border border-gray-300 rounded"></div>
                <span>Available</span>
              </div>
              
              {selectedSeats.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-600 border border-purple-700 rounded"></div>
                  <span>Selected</span>
                </div>
              )}
            </>
          )}
          
          {usedDepartments.map(department => {
            const color = DEPARTMENT_COLORS[department as keyof typeof DEPARTMENT_COLORS]
            return (
              <div key={department} className="flex items-center gap-2">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${color?.bg || 'bg-gray-500'}`}></div>
                <span className="truncate" title={department}>
                  {department.split(' ').map(word => word.charAt(0)).join('')}
                </span>
              </div>
            )
          })}
          
          {studentView && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 border border-gray-300 rounded opacity-50"></div>
                <span>Not Available</span>
              </div>
              <div className="bg-blue-50 p-2 rounded col-span-full">
                <div className="text-xs sm:text-sm">
                  <span className="font-medium">Your section:</span> {studentDepartment} - {studentYear}
                  {studentGender && ` (${studentGender})`}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full mx-auto">
      {showDepartmentStats && (
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {Object.entries(stats).map(([dept, data]) => (
            <div key={dept} className="bg-white rounded-lg border p-2 sm:p-3 text-center">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded mx-auto mb-1 sm:mb-2 ${data.color}`}></div>
              <div className="text-xs font-medium text-gray-600 mb-1 truncate" title={dept}>
                {dept.split(' ').map(word => word.charAt(0)).join('')}
              </div>
              <div className="text-sm sm:text-lg font-bold">{data.assigned}</div>
              <div className="text-xs text-gray-500">assigned</div>
            </div>
          ))}
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 text-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded mx-auto mb-1 sm:mb-2 bg-white border-2 border-gray-300"></div>
            <div className="text-xs font-medium text-green-600 mb-1">Available</div>
            <div className="text-sm sm:text-lg font-bold text-green-700">{availableSeats}</div>
            <div className="text-xs text-green-600">remaining</div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg border p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold">{config.name}</h3>
          <div className="text-xs sm:text-sm text-gray-600">
            {assignments.reduce((sum, assignment) => sum + assignment.seat_numbers.length, 0)}/{totalSeats} assigned
          </div>
        </div>
        
        <div className="text-center mb-4">
          <div className="inline-block p-2 sm:p-3 bg-gray-100 rounded-lg">
            <div className="text-sm sm:text-lg font-bold">STAGE / FRONT</div>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-2">
          {renderSeatMap()}
        </div>
        
        <div className="text-center text-xs sm:text-sm text-gray-500 mt-4">
          {config.name} - {config.totalSeats} Total Seats
        </div>
      </div>
      
      {renderLegend()}
    </div>
  )
}
