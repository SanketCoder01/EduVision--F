"use client"

import { useState, useEffect, useTransition, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getGrievances, submitGrievance } from "./actions"
import { Grievance } from "@/lib/types"
import { format } from "date-fns"
import { Search, PlusCircle } from "lucide-react"

export default function GrievancePage() {
  const [view, setView] = useState<'list' | 'submit'>('list')
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [isPending, startTransition] = useTransition()

  const fetchGrievances = () => {
    startTransition(() => {
      getGrievances().then(setGrievances)
    })
  }

  useEffect(() => {
    if (view === 'list') {
      fetchGrievances()
    }
  }, [view])

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
        const result = await submitGrievance(formData);
        if (result.success) {
          setView('list');
        } else {
          // A more user-friendly error notification would be better here
          alert(result.error);
        }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return <Badge className="bg-green-500 text-white hover:bg-green-600">Resolved</Badge>
      case "In Progress":
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">In Progress</Badge>
      case "Pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Grievance Portal</h1>
          <p className="text-muted-foreground">Submit and track your grievances.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setView('list')} variant={view === 'list' ? 'default' : 'outline'}>
            View Grievances
          </Button>
          <Button onClick={() => setView('submit')} variant={view === 'submit' ? 'default' : 'outline'}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit New Grievance
          </Button>
        </div>
      </header>

      {view === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>My Submitted Grievances</CardTitle>
            <CardDescription>Here is a list of grievances you have submitted.</CardDescription>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by subject..." className="pl-8" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <p>Loading grievances...</p>
            ) : grievances.length > 0 ? (
              <div className="grid gap-4">
                {grievances.map((g) => (
                  <Card key={g.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{g.subject}</CardTitle>
                          <CardDescription>Category: {g.category}</CardDescription>
                        </div>
                        {getStatusBadge(g.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{g.description}</p>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                      <p>Submitted on: {format(new Date(g.submittedAt), "PPP")}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p>You have not submitted any grievances yet.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submit a New Grievance</CardTitle>
            <CardDescription>Please provide details about your concern. All submissions are confidential.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="e.g., Issue with course registration" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required defaultValue="academic">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="faculty">Faculty Related</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Please describe your grievance in detail." required rows={6} />
              </div>
              <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? 'Submitting...' : 'Submit Grievance'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
