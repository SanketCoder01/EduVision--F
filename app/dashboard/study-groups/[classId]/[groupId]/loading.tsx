import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudyGroupDetailsLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-10 rounded-full mr-2" />
        <Skeleton className="h-8 w-48" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-7 w-1/3 mb-2" />
          <Skeleton className="h-5 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="flex -space-x-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-full" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-6 w-1/2" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24 mr-2" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members" disabled>
            <Skeleton className="h-5 w-24" />
          </TabsTrigger>
          <TabsTrigger value="tasks" disabled>
            <Skeleton className="h-5 w-24" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
