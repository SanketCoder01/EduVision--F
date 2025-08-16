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
import { createClient } from '@/lib/supabase/client'
import { Grievance } from "@/lib/types"
import { format } from "date-fns"
import { Search, PlusCircle, ChevronsUpDown, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"

export default function GrievancePage() {
  const [view, setView] = useState<'list' | 'submit'>('list')
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [isPending, startTransition] = useTransition()
  const [userRole, setUserRole] = useState<'faculty' | 'student' | null>(null)
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: faculty } = await supabase
          .from('faculty')
          .select('id')
          .eq('id', user.id)
          .single();
        setUserRole(faculty ? 'faculty' : 'student');
      } else {
        setUserRole(null); // Or handle unauthenticated state
      }
    };
    checkUserRole();
  }, []);

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
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const renderHeader = () => (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold">{userRole === 'faculty' ? 'Grievance Submissions' : 'Grievance Portal'}</h1>
        <p className="text-muted-foreground">
          {userRole === 'faculty' ? 'Review grievances submitted by students in your department.' : 'Submit and track your grievances.'}
        </p>
      </div>
      {userRole === 'student' && (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setView('list')} variant={view === 'list' ? 'default' : 'outline'}>
            View Grievances
          </Button>
          <Button onClick={() => setView('submit')} variant={view === 'submit' ? 'default' : 'outline'}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit New Grievance
          </Button>
        </div>
      )}
    </header>
  )

  const renderStudentView = () => (
    <>
      {view === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>My Submitted Grievances</CardTitle>
            <CardDescription>Here is a list of grievances you have submitted.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? <p>Loading...</p> : grievances.length > 0 ? (
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
                    <CardContent><p className="text-sm text-muted-foreground">{g.description}</p></CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                      <p>Submitted on: {format(new Date(g.submittedAt), "PPP")}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : <p>You have not submitted any grievances yet.</p>}
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
              <div className="grid gap-2"><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" required /></div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required defaultValue="academic">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="faculty">Faculty Related</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" required rows={6} /></div>
              <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? 'Submitting...' : 'Submit Grievance'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )

  const renderFacultyView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Department Grievances</CardTitle>
        <CardDescription>List of grievances from students in your department.</CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? <p>Loading...</p> : grievances.length > 0 ? (
          <div className="space-y-3">
            {grievances.map((g) => (
              <Card key={g.id} className="overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-muted/50" onClick={() => setSelectedGrievance(selectedGrievance?.id === g.id ? null : g)}>
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{g.subject}</div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(g.status)}
                      <ChevronsUpDown className={`h-4 w-4 transition-transform ${selectedGrievance?.id === g.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span>{g.studentName}</span> • <span>{g.studentDepartment}</span> • <span>{g.studentYear} Year</span>
                  </div>
                </div>
                <AnimatePresence>
                  {selectedGrievance?.id === g.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="p-4 border-t bg-muted/20">
                        <h4 className="font-semibold text-sm mb-2">Full Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Category:</span> {g.category}</p>
                          <p className="whitespace-pre-wrap"><span className="font-medium">Description:</span> {g.description}</p>
                          <p className="text-xs text-muted-foreground pt-2">Submitted on: {format(new Date(g.submittedAt), "PPP p")}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        ) : <p>No grievances found for your department.</p>}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4 md:p-6">
      {renderHeader()}
      {userRole === 'student' ? (
        renderStudentView()
      ) : userRole === 'faculty' ? (
        renderFacultyView()
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to access the grievance portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Use your student or faculty account to continue.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
