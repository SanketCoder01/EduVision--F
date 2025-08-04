import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RecommendationLetterLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-96 mt-2 ml-11" />
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
          <TabsTrigger value="guidelines" disabled>
            <Skeleton className="h-4 w-28" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Skeleton className="h-10 w-full sm:w-96" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-10 w-24" />
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
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-3 w-20 ml-2" />
                        </div>
                        <Skeleton className="h-6 w-20 mt-2 sm:mt-0" />
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-40" />
                          <Skeleton className="h-3 w-36" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Skeleton className="h-3 w-40" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-24" />
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
