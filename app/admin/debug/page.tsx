"use client"

import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminDebugPage() {
  const { isAdmin, adminEmail, isLoading, login, logout } = useAdminAuth()

  const checkLocalStorage = () => {
    const adminSession = localStorage.getItem('isAdmin')
    const email = localStorage.getItem('adminEmail')
    return { adminSession, email }
  }

  const clearSession = () => {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminEmail')
    window.location.reload()
  }

  const testLogin = () => {
    login('test@admin.sanjivani.edu.in')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Debug Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current admin authentication state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Loading:</span>
              <Badge variant={isLoading ? "default" : "secondary"}>
                {isLoading ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Is Admin:</span>
              <Badge variant={isAdmin ? "default" : "destructive"}>
                {isAdmin ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Email:</span>
              <span className="font-mono text-sm">{adminEmail || "None"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Status</CardTitle>
            <CardDescription>Raw localStorage values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const { adminSession, email } = checkLocalStorage()
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span>isAdmin:</span>
                    <span className="font-mono text-sm">{adminSession || "null"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>adminEmail:</span>
                    <span className="font-mono text-sm">{email || "null"}</span>
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Actions</CardTitle>
          <CardDescription>Test admin authentication functions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testLogin} variant="outline">
              Test Login
            </Button>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
            <Button onClick={clearSession} variant="destructive">
              Clear Session
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>Quick navigation links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <a href="/admin/login">Admin Login</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/registration-approvals">Registration Approvals</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin">Admin Home</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
