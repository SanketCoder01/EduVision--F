"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Clock, Mail, User, GraduationCap, RefreshCw, Search, Filter, Home } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface PendingRegistration {
  id: string
  email: string
  user_type: 'student' | 'faculty'
  department: string
  year?: string
  status: 'pending_approval' | 'approved' | 'rejected'
  submitted_at: string
  rejection_reason?: string
  name?: string
  phone?: string
  face_url?: string
  reviewed_at?: string
  reviewed_by?: string
}

export default function RegistrationApprovalsPage() {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<PendingRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchPendingRegistrations()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('pending_registrations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pending_registrations' },
        () => {
          fetchPendingRegistrations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [pendingRegistrations, searchTerm, filterType, filterDepartment])

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/pending-registrations')
      if (!response.ok) {
        setPendingRegistrations([])
        setError(`Failed to fetch pending registrations (HTTP ${response.status})`)
        return
      }
      const data = await response.json()
      
      if (data.success) {
        setPendingRegistrations(data.registrations)
        
        // Calculate stats
        const total = data.registrations.length
        const pending = data.registrations.filter((r: PendingRegistration) => r.status === 'pending_approval').length
        const approved = data.registrations.filter((r: PendingRegistration) => r.status === 'approved').length
        const rejected = data.registrations.filter((r: PendingRegistration) => r.status === 'rejected').length
        
        setStats({ total, pending, approved, rejected })
      } else {
        setPendingRegistrations([])
        setError(data.message || 'Failed to fetch pending registrations')
      }
    } catch (err) {
      setPendingRegistrations([])
      setError(err instanceof Error ? `Failed to fetch pending registrations: ${err.message}` : 'Failed to fetch pending registrations')
    } finally {
      setIsLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = pendingRegistrations

    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(reg => reg.user_type === filterType)
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(reg => reg.department === filterDepartment)
    }

    setFilteredRegistrations(filtered)
  }

  const handleApproval = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      // Optimistically update the UI
      setPendingRegistrations(prev => 
        prev.map(reg => 
          reg.id === id 
            ? { 
                ...reg, 
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewed_at: new Date().toISOString(),
                rejection_reason: action === 'reject' ? reason : undefined
              }
            : reg
        )
      )

      const response = await fetch('/api/admin/approve-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: id, action, rejectionReason: reason })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: `Registration ${action}d successfully`,
          description: `User has been ${action}d and can now access the system.`,
        })
        // Refresh to get the latest data from server
        setTimeout(() => fetchPendingRegistrations(), 500)
      } else {
        // Revert optimistic update on error
        fetchPendingRegistrations()
        toast({
          title: 'Error',
          description: data.message || `Failed to ${action} registration`,
          variant: 'destructive'
        })
      }
    } catch (err) {
      // Revert optimistic update on error
      fetchPendingRegistrations()
      toast({
        title: 'Error',
        description: `Network error: Failed to ${action} registration`,
        variant: 'destructive'
      })
    }
  }

  const getDepartments = () => {
    const departments = [...new Set(pendingRegistrations.map(reg => reg.department))]
    return departments
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Admin Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Registration Approvals</h1>
              <p className="text-gray-600 mt-2">Review and approve pending user registrations</p>
            </div>
          </div>
          <Button
            onClick={fetchPendingRegistrations}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="flex-1">
            <Input
              placeholder="Search by email or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {getDepartments().map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredRegistrations.map((registration, index) => (
            <motion.div
              key={registration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header with email and status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <span className="font-semibold text-lg">{registration.email}</span>
                        {getStatusBadge(registration.status)}
                      </div>
                      {registration.status === 'pending_approval' && (
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => {
                              if (confirm(`Are you sure you want to approve ${registration.email}?`)) {
                                handleApproval(registration.id, 'approve')
                              }
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 shadow-md transition-all"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => {
                              const reason = prompt(`Enter rejection reason for ${registration.email} (optional):`) || ''
                              if (confirm(`Are you sure you want to reject ${registration.email}?`)) {
                                handleApproval(registration.id, 'reject', reason)
                              }
                            }}
                            size="sm"
                            variant="destructive"
                            className="shadow-md transition-all"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Complete user details */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Registration Details
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-gray-500">User Type:</span>
                          <div className="font-medium capitalize">{registration.user_type}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-gray-500">Department:</span>
                          <div className="font-medium">{registration.department}</div>
                        </div>
                        
                        {registration.year && (
                          <div className="space-y-1">
                            <span className="text-gray-500">Year:</span>
                            <div className="font-medium">{registration.year}</div>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <span className="text-gray-500">Submitted:</span>
                          <div className="font-medium">
                            {new Date(registration.submitted_at).toLocaleString()}
                          </div>
                        </div>
                        
                        {registration.name && (
                          <div className="space-y-1">
                            <span className="text-gray-500">Name:</span>
                            <div className="font-medium">{registration.name}</div>
                          </div>
                        )}
                        
                        {registration.phone && (
                          <div className="space-y-1">
                            <span className="text-gray-500">Phone:</span>
                            <div className="font-medium">{registration.phone}</div>
                          </div>
                        )}
                      </div>
                      
                      {registration.face_url && (
                        <div className="space-y-1">
                          <span className="text-gray-500">Profile Image:</span>
                          <img 
                            src={registration.face_url} 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                      )}
                      
                      {registration.reviewed_at && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            <strong>Reviewed:</strong> {new Date(registration.reviewed_at).toLocaleString()}
                            {registration.reviewed_by && (
                              <span className="ml-2">by {registration.reviewed_by}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {registration.rejection_reason && (
                      <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                        <strong>Rejection Reason:</strong> {registration.rejection_reason}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredRegistrations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-gray-600">No registrations match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
