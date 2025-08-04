"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestDatabase() {
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "connected" | "error">("testing")
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus("testing")
      setError(null)

      // Test basic connection
      const { data, error } = await supabase.from("faculty").select("count", { count: "exact", head: true })

      if (error) {
        throw error
      }

      setConnectionStatus("connected")

      // Try to get table information
      const { data: tablesData } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")

      if (tablesData) {
        setTables(tablesData.map((t) => t.table_name))
      }
    } catch (err: any) {
      setConnectionStatus("error")
      setError(err.message || "Unknown error occurred")
    }
  }

  const createSampleData = async () => {
    try {
      // Create a sample faculty member
      const { data: faculty, error: facultyError } = await supabase
        .from("faculty")
        .insert([
          {
            name: "Dr. John Smith",
            email: "john.smith@university.edu",
            password: "password123",
            department: "Computer Science",
            designation: "Professor",
            phone: "+1234567890",
            employee_id: "EMP001",
          },
        ])
        .select()

      if (facultyError) throw facultyError

      // Create a sample student
      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert([
          {
            name: "Alice Johnson",
            email: "alice.johnson@student.edu",
            password: "password123",
            prn: "CS2024001",
            department: "Computer Science",
            year: "second",
            phone: "+1234567891",
          },
        ])
        .select()

      if (studentError) throw studentError

      alert("Sample data created successfully!")
    } catch (err: any) {
      alert("Error creating sample data: " + err.message)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <span>Connection Status:</span>
            <span
              className={`px-2 py-1 rounded text-sm ${
                connectionStatus === "connected"
                  ? "bg-green-100 text-green-800"
                  : connectionStatus === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {connectionStatus === "connected" ? "Connected" : connectionStatus === "error" ? "Error" : "Testing..."}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {connectionStatus === "connected" && (
            <div className="space-y-2">
              <h3 className="font-semibold">Available Tables:</h3>
              <div className="grid grid-cols-2 gap-2">
                {tables.map((table) => (
                  <div key={table} className="p-2 bg-gray-50 rounded text-sm">
                    {table}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button onClick={testConnection} variant="outline">
              Test Connection
            </Button>
            {connectionStatus === "connected" && <Button onClick={createSampleData}>Create Sample Data</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
