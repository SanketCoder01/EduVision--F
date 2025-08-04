import { Skeleton } from "@/components/ui/skeleton"

export default function LibraryServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-[250px]" />
          </div>
          <Skeleton className="h-5 w-[350px] mt-1 ml-11" />
        </div>
      </div>

      <Skeleton className="h-10 w-[600px] mb-8" />

      <Skeleton className="h-[500px] w-full rounded-lg" />
    </div>
  )
}
