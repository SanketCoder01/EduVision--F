"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, AlertCircle, BookOpen, MessageSquare, FileText, Users, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'

type HubItem = {
  id: string
  title: string
  description: string
  time?: string
  type: 'class' | 'assignment' | 'announcement' | 'message' | 'event' | 'submission'
  action?: () => void
}

interface BaseHubProps {
  title: string
  subtitle: string
  loading: boolean
  items: HubItem[]
  emptyMessage: string
  emptyIcon: React.ReactNode
}

export function BaseHub({ title, subtitle, loading, items, emptyMessage, emptyIcon }: BaseHubProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'class':
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case 'assignment':
        return <FileText className="h-5 w-5 text-amber-500" />
      case 'announcement':
        return <AlertCircle className="h-5 w-5 text-green-500" />
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case 'event':
        return <Calendar className="h-5 w-5 text-red-500" />
      case 'submission':
        return <GraduationCap className="h-5 w-5 text-emerald-500" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-200" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))
        ) : items.length === 0 ? (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              {emptyIcon}
            </div>
            <h3 className="text-lg font-medium mb-1">Nothing to show yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {emptyMessage}
            </p>
          </div>
        ) : (
          // Items grid
          items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-muted">
                      {getIcon(item.type)}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>
                  {item.time && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {item.time}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                {item.action && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3 px-0 text-sm h-auto"
                    onClick={item.action}
                  >
                    View details
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
