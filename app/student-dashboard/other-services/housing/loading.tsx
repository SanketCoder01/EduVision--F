import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HousingAccommodationLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-72 mt-2 ml-11" />
        </div>
      </div>

      <Tabs defaultValue="housing" className="mb-8">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <Skeleton className="h-10 w-full" />
        </TabsList>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-10 w-full mt-4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array(2).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/4 mb-4 md:mb-0">
                        <Skeleton className="h-48 w-full rounded-lg" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-5 w-24 mt-1 sm:mt-0" />
                        </div>
                        <Skeleton className="h-4 w-64 mb-2" />
                        <Skeleton className="h-4 w-full mb-3" />
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                          <div>
                            <Skeleton className="h-3 w-24 mb-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div>
                            <Skeleton className="h-3 w-24 mb-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div>
                            <Skeleton className="h-3 w-24 mb-1" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                          <div>
                            <Skeleton className="h-3 w-24 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4">
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
        </div>
      </Tabs>
    </div>
  )
}
