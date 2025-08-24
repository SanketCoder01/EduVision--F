"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestRegistration() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testRegistration = async () => {
    setLoading(true)
    try {
      const testData = {
        email: 'test@sanjivani.edu.in',
        name: 'Test User',
        department: 'cse',
        year: '1st_year',
        user_type: 'student',
        mobile: '1234567890',
        photo: 'data:image/jpeg;base64,test'
      }
      
      console.log('Sending test data:', testData)
      
      const response = await fetch('/api/auth/secure-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      console.log('Response:', { status: response.status, data })
      setResult({ status: response.status, data })
    } catch (error: any) {
      console.error('Test error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testSimpleRegistration = async () => {
    setLoading(true)
    try {
      const testData = {
        email: 'test@sanjivani.edu.in',
        name: 'Test User',
        department: 'cse',
        year: '1st_year',
        user_type: 'student',
        mobile: '1234567890',
        photo: 'data:image/jpeg;base64,test'
      }
      
      console.log('Testing simple registration:', testData)
      
      const response = await fetch('/api/auth/simple-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      console.log('Simple registration response:', { status: response.status, data })
      setResult({ status: response.status, data, type: 'simple' })
    } catch (error: any) {
      console.error('Simple test error:', error)
      setResult({ error: error.message, type: 'simple' })
    } finally {
      setLoading(false)
    }
  }

  const testDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const setupDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup-db', {
        method: 'POST'
      })
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Registration Flow Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={setupDatabase} disabled={loading} variant="outline">
              Setup Database
            </Button>
            <Button onClick={testDatabase} disabled={loading}>
              Test Database Connection
            </Button>
            <button
              onClick={testRegistration}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Registration API'}
            </button>
            <button
              onClick={testSimpleRegistration}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Simple Registration'}
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Steps to fix registration:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Click "Setup Database" first</li>
              <li>Click "Test Registration API" to verify it works</li>
              <li>Try registration form again</li>
            </ol>
          </div>
          
          {result && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
