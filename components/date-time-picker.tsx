"use client"

import { Calendar, Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  label: string
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  required?: boolean
  timezone?: string
  onTimezoneChange?: (timezone: string) => void
  showTimezone?: boolean
}

export function DateTimePicker({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  required = false,
  timezone = "UTC",
  onTimezoneChange,
  showTimezone = false,
}: DateTimePickerProps) {
  // Common timezones
  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  ]

  return (
    <div>
      <Label className="text-base mb-2 block">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Calendar className="h-4 w-4" />
          </div>
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-8"
            required={required}
          />
        </div>
        <div className="relative">
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Clock className="h-4 w-4" />
          </div>
          <Input type="time" value={time} onChange={(e) => onTimeChange(e.target.value)} className="pl-8" />
        </div>
      </div>

      {showTimezone && onTimezoneChange && (
        <div className="mt-2">
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Times will be converted to student's local timezone when displayed
          </p>
        </div>
      )}
    </div>
  )
}
