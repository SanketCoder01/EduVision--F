"use client"

import { useState } from "react"
import { createWorker } from "tesseract.js"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, CheckCircle, Loader2, AlertCircle } from "lucide-react"

interface OCRExtractorProps {
  file: File
  onExtractionComplete: (extractedData: any) => void
  onCancel: () => void
}

export default function OCRExtractor({ file, onExtractionComplete, onCancel }: OCRExtractorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("Initializing OCR...")
  const [extractedText, setExtractedText] = useState("")
  const [parsedSchedule, setParsedSchedule] = useState<any>(null)

  const performOCR = async () => {
    setIsProcessing(true)
    setStatus("Loading OCR engine...")
    setProgress(10)

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const percent = Math.floor(m.progress * 70) + 20 // 20-90%
            setProgress(percent)
            setStatus(`Extracting text from image... ${Math.floor(m.progress * 100)}%`)
          }
        },
      })

      setStatus("Processing image...")
      setProgress(20)

      // Convert file to image URL
      const imageUrl = URL.createObjectURL(file)

      // Perform OCR
      const { data: { text } } = await worker.recognize(imageUrl)
      
      setExtractedText(text)
      setProgress(90)
      setStatus("Parsing timetable structure...")

      // Parse the extracted text into structured timetable data
      const schedule = parseExtractedText(text)
      setParsedSchedule(schedule)

      setProgress(100)
      setStatus("Extraction complete!")

      await worker.terminate()
      URL.revokeObjectURL(imageUrl)

      // Wait a moment to show completion
      setTimeout(() => {
        onExtractionComplete({
          rawText: text,
          schedule,
          extractedAt: new Date().toISOString(),
        })
      }, 1000)

    } catch (error) {
      console.error("OCR Error:", error)
      setStatus("Failed to extract text. Please try again.")
      setIsProcessing(false)
    }
  }

  const parseExtractedText = (text: string): any[] => {
    // This is a smart parser that attempts to structure the OCR text into a timetable
    const lines = text.split("\n").filter(line => line.trim().length > 0)
    
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const schedule: any[] = []
    
    let currentDay = ""
    let currentDayLectures: any[] = []
    
    // Common time patterns
    const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/gi
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check if line contains a day name
      const foundDay = days.find(day => line.toUpperCase().includes(day.toUpperCase()))
      
      if (foundDay) {
        // Save previous day's data
        if (currentDay && currentDayLectures.length > 0) {
          schedule.push({
            day: currentDay,
            lectures: currentDayLectures
          })
        }
        
        // Start new day
        currentDay = foundDay
        currentDayLectures = []
      } else if (currentDay && line.length > 5) {
        // Try to parse as lecture entry
        const timeMatches = [...line.matchAll(timePattern)]
        
        if (timeMatches.length >= 1) {
          // Extract time range
          let timeRange = ""
          if (timeMatches.length >= 2) {
            const startTime = timeMatches[0][0]
            const endTime = timeMatches[1][0]
            timeRange = `${startTime}-${endTime}`
          } else {
            timeRange = timeMatches[0][0]
          }
          
          // Extract subject (usually the text after time)
          let remainingText = line
          timeMatches.forEach(match => {
            remainingText = remainingText.replace(match[0], "")
          })
          
          const parts = remainingText.split(/[,\-|\/]/).map(p => p.trim()).filter(p => p.length > 0)
          
          const subject = parts[0] || "Unknown Subject"
          const room = parts.find(p => /room|lab|hall|r-?\d+|l-?\d+/i.test(p)) || ""
          const faculty = parts.find(p => /dr\.|prof\.|mr\.|ms\.|mrs\./i.test(p)) || ""
          const type = detectLectureType(line)
          
          currentDayLectures.push({
            time: timeRange,
            subject: subject,
            room: room || "TBA",
            faculty: faculty || "Faculty",
            type: type
          })
        } else {
          // If no time found but we have a current day, might be a continuation
          // or subject name on separate line
          if (currentDayLectures.length > 0 && line.length > 3) {
            const lastLecture = currentDayLectures[currentDayLectures.length - 1]
            if (lastLecture.subject === "Unknown Subject" || lastLecture.subject.length < 5) {
              lastLecture.subject = line
            }
          }
        }
      }
    }
    
    // Add last day
    if (currentDay && currentDayLectures.length > 0) {
      schedule.push({
        day: currentDay,
        lectures: currentDayLectures
      })
    }
    
    // If no structured data found, create a simple note
    if (schedule.length === 0) {
      return [{
        day: "Extracted Data",
        lectures: [{
          time: "N/A",
          subject: "Please review extracted text",
          room: "N/A",
          faculty: "N/A",
          type: "note"
        }]
      }]
    }
    
    return schedule
  }

  const detectLectureType = (text: string): string => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("lab") || lowerText.includes("practical")) return "Practical"
    if (lowerText.includes("tutorial")) return "Tutorial"
    if (lowerText.includes("project")) return "Project"
    if (lowerText.includes("seminar")) return "Seminar"
    return "Lecture"
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        {!isProcessing && !parsedSchedule && (
          <div className="text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Ready to Extract Timetable</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click below to use AI-powered OCR to extract text and structure from your timetable image.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={performOCR} className="bg-blue-600 hover:bg-blue-700">
                <Bot className="h-4 w-4 mr-2" />
                Start OCR Extraction
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">{status}</span>
                  <span className="text-sm text-blue-700">{progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {extractedText && (
              <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Extracted Text Preview
                </h4>
                <div className="text-xs text-gray-600 max-h-32 overflow-y-auto font-mono bg-gray-50 p-2 rounded">
                  {extractedText.substring(0, 500)}
                  {extractedText.length > 500 && "..."}
                </div>
              </div>
            )}
          </div>
        )}

        {parsedSchedule && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Extraction Successful!</h3>
            </div>
            
            <div className="bg-white rounded border border-blue-200 p-4 max-h-96 overflow-y-auto">
              <h4 className="font-semibold mb-3">Extracted Schedule Preview:</h4>
              {parsedSchedule.map((daySchedule: any, idx: number) => (
                <div key={idx} className="mb-4">
                  <Badge className="mb-2">{daySchedule.day}</Badge>
                  <div className="space-y-2 ml-4">
                    {daySchedule.lectures.map((lecture: any, lecIdx: number) => (
                      <div key={lecIdx} className="text-sm flex gap-3 items-start">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {lecture.time}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium">{lecture.subject}</div>
                          <div className="text-gray-600 text-xs">
                            {lecture.faculty} • {lecture.room} • {lecture.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-2 text-yellow-600" />
              <span className="text-yellow-800">
                Please review the extracted data. You can proceed to save or try again if the extraction is incorrect.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
