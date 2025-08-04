import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudentMentorshipDashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="w-full">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-5 w-64 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-36" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="meetings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="notes">Notes & Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="w-full">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <div className="flex items-center mt-2">
                            <Skeleton className="h-4 w-4 mr-1" />
                            <Skeleton className="h-4 w-24 mr-3" />
                            <Skeleton className="h-4 w-4 mr-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
