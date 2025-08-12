"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function DataClearUtility() {
  const clearAllData = () => {
    try {
      // Clear all user data for fresh start
      localStorage.removeItem('student_users')
      localStorage.removeItem('faculty_users') 
      localStorage.removeItem('student_session')
      localStorage.removeItem('faculty_session')
      localStorage.removeItem('student_credentials')
      localStorage.removeItem('faculty_credentials')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('studentSession')
      localStorage.removeItem('facultySession')
      
      toast({
        title: "Data Cleared! ✅",
        description: "All user data has been cleared. You can now start fresh registration.",
      })
      
      // Refresh the page to reset state
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Development Utility</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={clearAllData}
          variant="destructive"
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Data & Start Fresh
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          This will clear all stored user data for testing
        </p>
      </CardContent>
    </Card>
  )
}
