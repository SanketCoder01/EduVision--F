import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ClassStudyGroupsLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-10 rounded-full mr-2" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-5 w-24" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Tabs defaultValue="groups" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups" disabled>
            <Skeleton className="h-5 w-24" />
          </TabsTrigger>
          <TabsTrigger value="students" disabled>
            <Skeleton className="h-5 w-24" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-1/2 mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="w-8 h-8 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
