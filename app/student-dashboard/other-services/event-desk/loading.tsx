import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Loading() {
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

      <Tabs defaultValue="my-requests" className="mb-8">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="my-requests" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="new-request" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="resources" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Skeleton className="h-10 w-full sm:w-80" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center">
                          <Skeleton className="h-5 w-48 mr-2" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-6 w-24 mt-2 sm:mt-0" />
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      
                      <Skeleton className="h-4 w-full mt-2" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                      
                      <div className="mt-3">
                        <Skeleton className="h-4 w-36 mb-1" />
                        <div className="flex flex-wrap gap-1">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-28" />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <div className="space-y-2">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-6 w-20" />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Skeleton className="h-4 w-48" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-32" />
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

      <div className="mt-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>

              <Skeleton className="h-px w-full" />

              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-3/6" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
