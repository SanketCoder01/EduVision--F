"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFaculty } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AddFacultyPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    designation: "",
    qualification: "",
    experience_years: "0",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // prevent native submit/navigation
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      await createFaculty({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        department: form.department,
        designation: form.designation,
        qualification: form.qualification,
        experience_years: form.experience_years,
      })
      router.replace("/university/manage-faculty")
    } catch (err: any) {
      setError(err?.message || "Failed to create faculty")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Add Faculty</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form id="add-faculty-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={form.department} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" value={form.designation} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="experience_years">Experience (years)</Label>
                <Input id="experience_years" type="number" min="0" value={form.experience_years} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" value={form.qualification} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? "Submitting..." : "Create Faculty"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
