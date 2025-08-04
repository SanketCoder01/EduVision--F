import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LeaveRequestLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-64 mt-2 ml-11" />
        </div>
      </div>

      <Tabs defaultValue="requests" className="mb-8">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="requests" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="new" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="calendar" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
              <div className="relative mt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-5 w-20 mb-2" />
                        </div>
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <div className="flex flex-wrap gap-3 mt-3">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
