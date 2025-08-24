"use client"

import StudentQueriesInterface from "@/components/student-queries/StudentQueriesInterface"

export default function QueriesPage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Student Queries</h1>
        <p className="text-gray-600">Submit questions and get help from faculty</p>
      </div>
      
      <StudentQueriesInterface />
    </div>
  )
}
