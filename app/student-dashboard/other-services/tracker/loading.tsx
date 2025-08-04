import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ApplicationTrackerLoading() {
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

      <div className="mb-8">
        <Skeleton className="h-10 w-[400px] mb-6" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72 mb-4" />
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Skeleton className="h-10 flex-1" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-[180px]" />
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
                        <div>
                          <div className="flex items-center">
                            <Skeleton className="h-5 w-32 mr-2" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-4 w-48 mt-1" />
                        </div>
                        <Skeleton className="h-6 w-24 mt-2 sm:mt-0" />
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-7 w-24" />
                        </div>
                        <div className="relative">
                          <div className="absolute top-0 left-0 ml-2 h-full w-0.5 bg-gray-200"></div>
                          <div className="space-y-4 relative">
                            {Array(4).fill(0).map((_, j) => (
                              <div key={j} className="ml-6 relative">
                                <div className="absolute -left-[18px] top-0 w-4 h-4 rounded-full bg-gray-100"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <Skeleton className="h-5 w-32" />
                                  <Skeleton className="h-5 w-20 mt-1 sm:mt-0" />
                                </div>
                                <Skeleton className="h-4 w-24 mt-1" />
                                <Skeleton className="h-4 w-48 mt-1" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
