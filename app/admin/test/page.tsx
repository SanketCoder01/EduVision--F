"use client"

import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminTestPage() {
  const { isAdmin, adminEmail, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in as admin to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/admin/login">Go to Admin Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Authentication Test</CardTitle>
          <CardDescription>This page confirms admin authentication is working</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Authentication Status:</span>
            <Badge variant="default">✅ Working</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Admin Email:</span>
            <span className="font-mono">{adminEmail}</span>
          </div>
          <div className="pt-4">
            <Button asChild variant="outline">
              <a href="/admin/registration-approvals">Go to Registration Approvals</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
