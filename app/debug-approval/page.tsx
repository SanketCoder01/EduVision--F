'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function DebugApprovalPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/test-approval')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to fetch data')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending_approval':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending_approval':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading debug data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Approval Debug Dashboard</h1>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.total_pending || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.total_students || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.total_faculty || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Registrations</CardTitle>
            <CardDescription>Users waiting for admin approval</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.pending_registrations?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending registrations</p>
            ) : (
              <div className="space-y-3">
                {data?.pending_registrations?.map((reg: any) => (
                  <div key={reg.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(reg.status)}
                      <div>
                        <p className="font-medium">{reg.name}</p>
                        <p className="text-sm text-gray-600">{reg.email}</p>
                        <p className="text-sm text-gray-500">
                          {reg.user_type} - {reg.department}
                          {reg.year && ` (${reg.year} Year)`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(reg.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Students */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Students</CardTitle>
            <CardDescription>Students with active accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.students?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No approved students</p>
            ) : (
              <div className="space-y-3">
                {data?.students?.map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-sm text-gray-500">
                        {student.department} - {student.year} Year - PRN: {student.prn}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(student.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Faculty */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Faculty</CardTitle>
            <CardDescription>Faculty with active accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.faculty?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No approved faculty</p>
            ) : (
              <div className="space-y-3">
                {data?.faculty?.map((faculty: any) => (
                  <div key={faculty.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{faculty.name}</p>
                      <p className="text-sm text-gray-600">{faculty.email}</p>
                      <p className="text-sm text-gray-500">
                        {faculty.department} - {faculty.designation} - ID: {faculty.employee_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(faculty.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Instructions</CardTitle>
            <CardDescription>How to use this debug page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Testing Approval Flow:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Go to admin dashboard and approve a user</li>
                <li>Click "Refresh" button above to see updated data</li>
                <li>Check if user moved from "Pending" to "Approved" section</li>
                <li>Verify user can access their dashboard</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Common Issues:</h4>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>If approval doesn't work, check admin approval API logs</li>
                <li>If user stays on pending page, check pending approval page logic</li>
                <li>If tables are empty, verify database migration was run</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
