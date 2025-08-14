"use client"

import { useState, useEffect, useTransition, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getHackathons, postHackathon } from "./actions"
import { Hackathon } from "@/lib/types"
import { format } from "date-fns"
import { Search, PlusCircle, Trophy, Building, Users } from "lucide-react"

// This would come from user auth state
const isFaculty = true; // Placeholder for role check

export default function HackathonPage() {
  const [view, setView] = useState<'list' | 'submit'>('list')
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [isPending, startTransition] = useTransition()

  const fetchHackathons = () => {
    startTransition(() => {
      getHackathons().then(setHackathons)
    })
  }

  useEffect(() => {
    if (view === 'list') {
      fetchHackathons()
    }
  }, [view])

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await postHackathon(formData)
      if (result.success) {
        setView('list')
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hackathons & Events</h1>
          <p className="text-muted-foreground">Discover and participate in exciting challenges.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setView('list')} variant={view === 'list' ? 'default' : 'outline'}>
            View Events
          </Button>
          {isFaculty && (
            <Button onClick={() => setView('submit')} variant={view === 'submit' ? 'default' : 'outline'}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Event
            </Button>
          )}
        </div>
      </header>

      {view === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Hackathons</CardTitle>
            <CardDescription>Explore events hosted by our faculty.</CardDescription>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title..." className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <p>Loading hackathons...</p>
            ) : hackathons.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hackathons.map((h) => (
                  <Card key={h.id} className="flex flex-col">
                    <CardHeader>
                      <Trophy className="w-8 h-8 text-primary mb-2" />
                      <CardTitle>{h.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-4">{h.description}</p>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Building className="h-4 w-4"/><span>Departments: {h.department.join(', ')}</span></div>
                        <div className="flex items-center gap-2"><Users className="h-4 w-4"/><span>Years: {h.year.join(', ')}</span></div>
                        <p className="text-xs pt-2">Posted on: {format(new Date(h.postedAt), "PPP")}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No hackathons have been posted yet.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Post a New Hackathon</CardTitle>
            <CardDescription>Provide the details for the new event.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" name="title" placeholder="e.g., AI for Social Good" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Describe the event, its goals, and rules." required rows={6} />
              </div>
              <div className="grid gap-2">
                 <Label>Target Departments</Label>
                 {/* In a real app, this would be a multi-select component */}
                 <Input name="department" placeholder="e.g., CSE, ECE" required />
              </div>
               <div className="grid gap-2">
                 <Label>Target Years</Label>
                 <Input name="year" placeholder="e.g., 3, 4" required />
              </div>
              <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? 'Posting...' : 'Post Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
