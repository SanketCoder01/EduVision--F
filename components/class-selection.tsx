"use client"

import type { ClassInfo } from "@/types/assignment"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClassSelectionProps {
  classes: ClassInfo[]
  selectedClass: string
  onClassChange: (classId: string) => void
}

export function ClassSelection({ classes, selectedClass, onClassChange }: ClassSelectionProps) {
  return (
    <div className="flex-1">
      <h2 className="text-lg font-medium mb-4">Select Class</h2>
      <Select value={selectedClass} onValueChange={onClassChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name} ({cls.students} students)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
