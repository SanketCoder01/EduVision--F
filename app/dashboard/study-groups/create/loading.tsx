import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoadingCreateStudyGroups() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Skeleton className="h-10 w-10 rounded-md mr-4" />
        <Skeleton className="h-8 w-48" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
