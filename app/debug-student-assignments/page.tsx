"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { SupabaseAssignmentService } from '@/lib/supabase-assignments'
import { getStudentSession } from '@/lib/student-auth'

export default function DebugStudentAssignments() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runDebugTest = async () => {
    setLoading(true)
    const info: any = {}

    try {
      // 1. Test Supabase connection
      info.step1 = "Testing Supabase connection..."
      const { data: testConnection, error: connectionError } = await supabase
        .from('assignments')
        .select('count')
        .limit(1)
      
      info.supabaseConnection = connectionError ? 
        { success: false, error: connectionError.message } : 
        { success: true }

      // 2. Get student session
      info.step2 = "Getting student session..."
      const student = await getStudentSession()
      info.studentSession = student

      // 3. Check all assignments in database
      info.step3 = "Checking all assignments..."
      const { data: allAssignments, error: allError } = await supabase
        .from('assignments')
        .select('id, title, department, target_years, status, faculty_id, created_at')
        .order('created_at', { ascending: false })
      
      info.allAssignments = allError ? 
        { success: false, error: allError.message } : 
        { success: true, count: allAssignments?.length || 0, data: allAssignments }

      // 4. Check published CSE assignments
      info.step4 = "Checking published CSE assignments..."
      const { data: cseAssignments, error: cseError } = await supabase
        .from('assignments')
        .select('*')
        .eq('department', 'CSE')
        .eq('status', 'published')
      
      info.cseAssignments = cseError ? 
        { success: false, error: cseError.message } : 
        { success: true, count: cseAssignments?.length || 0, data: cseAssignments }

      // 5. Test year filtering for different years
      info.step5 = "Testing year filtering..."
      const yearTests = ['1', '2', '3', '4']
      info.yearFiltering = {}
      
      for (const year of yearTests) {
        const { data: yearAssignments, error: yearError } = await supabase
          .from('assignments')
          .select('id, title, target_years')
          .eq('department', 'CSE')
          .eq('status', 'published')
          .contains('target_years', [year])
        
        info.yearFiltering[`year${year}`] = yearError ? 
          { success: false, error: yearError.message } : 
          { success: true, count: yearAssignments?.length || 0, data: yearAssignments }
      }

      // 6. Test SupabaseAssignmentService
      if (student?.department && student?.year) {
        info.step6 = "Testing SupabaseAssignmentService..."
        const serviceAssignments = await SupabaseAssignmentService.getStudentAssignments(
          student.department, 
          student.year
        )
        info.serviceAssignments = {
          success: true,
          count: serviceAssignments?.length || 0,
          data: serviceAssignments
        }
      }

      // 7. Check faculty table
      info.step7 = "Checking faculty table..."
      const { data: faculty, error: facultyError } = await supabase
        .from('faculty')
        .select('id, name, email, department')
        .limit(5)
      
      info.faculty = facultyError ? 
        { success: false, error: facultyError.message } : 
        { success: true, count: faculty?.length || 0, data: faculty }

      // 8. Test real-time subscription
      info.step8 = "Testing real-time subscription..."
      const channel = supabase
        .channel('debug-assignments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'assignments',
            filter: 'department=eq.CSE'
          },
          (payload) => {
            console.log('Real-time update received:', payload)
          }
        )
        .subscribe()
      
      info.realtimeSubscription = { success: true, channelId: channel.topic }
      
      // Clean up subscription after 2 seconds
      setTimeout(() => {
        supabase.removeChannel(channel)
      }, 2000)

    } catch (error: any) {
      info.error = error.message
    }

    setDebugInfo(info)
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Student Assignment Debug Tool</h1>
          <Button onClick={runDebugTest} disabled={loading}>
            {loading ? 'Running Tests...' : 'Run Debug Test'}
          </Button>
        </div>

        {Object.keys(debugInfo).length > 0 && (
          <div className="space-y-4">
            {/* Supabase Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Supabase Connection
                  <Badge variant={debugInfo.supabaseConnection?.success ? 'default' : 'destructive'}>
                    {debugInfo.supabaseConnection?.success ? 'Success' : 'Failed'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-2 rounded">
                  {JSON.stringify(debugInfo.supabaseConnection, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Student Session */}
            <Card>
              <CardHeader>
                <CardTitle>Student Session</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-2 rounded">
                  {JSON.stringify(debugInfo.studentSession, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* All Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  All Assignments
                  <Badge variant={debugInfo.allAssignments?.success ? 'default' : 'destructive'}>
                    Count: {debugInfo.allAssignments?.count || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                  {JSON.stringify(debugInfo.allAssignments, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* CSE Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Published CSE Assignments
                  <Badge variant={debugInfo.cseAssignments?.success ? 'default' : 'destructive'}>
                    Count: {debugInfo.cseAssignments?.count || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                  {JSON.stringify(debugInfo.cseAssignments, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Year Filtering */}
            <Card>
              <CardHeader>
                <CardTitle>Year Filtering Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {debugInfo.yearFiltering && Object.entries(debugInfo.yearFiltering).map(([year, data]: [string, any]) => (
                    <div key={year} className="border p-2 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{year}</span>
                        <Badge variant={data.success ? 'default' : 'destructive'}>
                          Count: {data.count || 0}
                        </Badge>
                      </div>
                      <pre className="text-xs bg-gray-50 p-1 rounded max-h-20 overflow-y-auto">
                        {JSON.stringify(data.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Assignments */}
            {debugInfo.serviceAssignments && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    SupabaseAssignmentService Results
                    <Badge variant="default">
                      Count: {debugInfo.serviceAssignments.count || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                    {JSON.stringify(debugInfo.serviceAssignments, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Faculty */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Faculty Table
                  <Badge variant={debugInfo.faculty?.success ? 'default' : 'destructive'}>
                    Count: {debugInfo.faculty?.count || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                  {JSON.stringify(debugInfo.faculty, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Real-time */}
            {debugInfo.realtimeSubscription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Real-time Subscription
                    <Badge variant="default">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-100 p-2 rounded">
                    {JSON.stringify(debugInfo.realtimeSubscription, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
