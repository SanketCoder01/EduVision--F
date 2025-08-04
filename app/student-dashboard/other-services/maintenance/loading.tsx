import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MaintenanceLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-64 mt-2 ml-11" />
        </div>
      </div>

      <Tabs defaultValue="complaints" className="mb-8">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="complaints" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="new" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="faq" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="complaints" className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Skeleton className="h-10 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-[130px]" />
                  <Skeleton className="h-10 w-[130px]" />
                </div>
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
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-5 w-20 mb-2" />
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="h-4 w-full mt-2 mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-48 mt-3" />
                        
                        <div className="mt-4">
                          <Skeleton className="h-px w-full mb-2" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-6 rounded-full" />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <Skeleton className="h-3 w-16 mr-2" />
                                  <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-3 w-full mt-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Skeleton className="h-8 w-24 mr-2" />
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
