"use client"

import { useState, useEffect, useTransition, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getLostFoundItems, submitLostFoundItem } from "./actions"
import { LostFoundItem } from "@/lib/types"
import { format } from "date-fns"
import { Search, PlusCircle, Package, PackageOpen } from "lucide-react"

export default function LostFoundPage() {
  const [view, setView] = useState<'list' | 'submit'>('list')
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [isPending, startTransition] = useTransition()

  const fetchItems = () => {
    startTransition(() => {
      getLostFoundItems().then(setItems)
    })
  }

  useEffect(() => {
    if (view === 'list') {
      fetchItems()
    }
  }, [view])

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await submitLostFoundItem(formData)
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
          <h1 className="text-2xl font-bold">Lost & Found</h1>
          <p className="text-muted-foreground">Report lost items or post found items.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setView('list')} variant={view === 'list' ? 'default' : 'outline'}>
            View All Items
          </Button>
          <Button onClick={() => setView('submit')} variant={view === 'submit' ? 'default' : 'outline'}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Report an Item
          </Button>
        </div>
      </header>

      {view === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Lost & Found Items</CardTitle>
            <CardDescription>Browse items that have been reported lost or found across the campus.</CardDescription>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title or location..." className="pl-8" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="lost">Lost Items</SelectItem>
                  <SelectItem value="found">Found Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <p>Loading items...</p>
            ) : items.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.isLost ? (
                          <span className="flex items-center text-sm text-red-500"><Package className="mr-1 h-4 w-4"/> Lost</span>
                        ) : (
                          <span className="flex items-center text-sm text-green-500"><PackageOpen className="mr-1 h-4 w-4"/> Found</span>
                        )}
                      </div>
                      <CardDescription>Last seen at: {item.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {item.imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.description}</p>
                      
                      <div className="space-y-1 text-xs text-muted-foreground border-t pt-3">
                        <p><strong>Reported by:</strong> {item.reporterName}</p>
                        <p><strong>Department:</strong> {item.reporterDepartment}</p>
                        {item.reporterPhone && (
                          <p><strong>Contact:</strong> {item.reporterPhone}</p>
                        )}
                        <p><strong>Reported on:</strong> {format(new Date(item.reportedAt), "PPP")}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No items have been reported yet.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Report an Item</CardTitle>
            <CardDescription>Fill out the form below to report a lost or found item.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Item Type</Label>
                <Select name="type" required defaultValue="lost">
                  <SelectTrigger>
                    <SelectValue placeholder="Is the item lost or found?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">I Lost Something</SelectItem>
                    <SelectItem value="found">I Found Something</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" name="name" placeholder="Enter your full name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" placeholder="e.g., Computer Science" required />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="e.g., +91 9876543210" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="title">Item Title</Label>
                <Input id="title" name="title" placeholder="e.g., Black Backpack" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g., Library, 2nd Floor" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Provide details like brand, color, or any identifying features." required rows={5} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <Input id="image" name="image" type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground">Upload a photo of the item to help with identification (Max 5MB)</p>
              </div>
              
              <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
