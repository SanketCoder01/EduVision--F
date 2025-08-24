"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, XCircle, Clock, User, Mail, Phone, GraduationCap } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PendingRegistration {
  id: string
  email: string
  name: string
  phone?: string
  department: string
  year?: string
  user_type: 'student' | 'faculty'
  face_url?: string
  status: string
  created_at: string
}

export default function PendingRegistrations() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingRegistrations()
  }, [])

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/pending-registrations')
      const data = await response.json()
      if (data.success) {
        setRegistrations(data.registrations)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch pending registrations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/approve-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: `Registration ${action}d`,
          description: `User has been ${action}d successfully`,
        })
        fetchPendingRegistrations() // Refresh list
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} registration`,
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading pending registrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Registrations</h1>
          <p className="text-gray-600 mt-2">Review and approve new user registrations</p>
        </div>

        {registrations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Registrations</h3>
              <p className="text-gray-600">All registrations have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {registrations.map((registration) => (
              <Card key={registration.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={registration.face_url} />
                        <AvatarFallback>
                          {registration.user_type === 'student' ? <User /> : <GraduationCap />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{registration.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={registration.user_type === 'student' ? 'default' : 'secondary'}>
                            {registration.user_type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{registration.department}</Badge>
                          {registration.year && <Badge variant="outline">{registration.year}</Badge>}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="font-medium">{registration.email}</span>
                      </div>
                      
                      {registration.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="font-medium">{registration.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Submitted:</span>
                        <span className="font-medium">
                          {new Date(registration.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {registration.face_url && (
                      <div className="flex justify-center">
                        <img
                          src={registration.face_url}
                          alt="Face capture"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 mt-6 pt-4 border-t">
                    <Button
                      onClick={() => handleApproval(registration.id, 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Registration
                    </Button>
                    <Button
                      onClick={() => handleApproval(registration.id, 'reject')}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Registration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
