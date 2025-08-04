import { Skeleton } from "@/components/ui/skeleton"

export default function OtherServicesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-5 w-[350px]" />
        </div>
      </div>

      <Skeleton className="h-10 w-[400px] mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                {Math.random() > 0.5 && <Skeleton className="h-6 w-16 rounded-full" />}
              </div>
              <Skeleton className="h-7 w-[180px] mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-[80%] mb-6" />
              <Skeleton className="h-[1px] w-full mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-9 w-[100px]" />
                <Skeleton className="h-9 w-[80px]" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
