export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      {/* Analytics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-4 w-4 bg-gray-100 rounded-full"></div>
            </div>
            <div className="mt-4">
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
              <div className="mt-2 h-3 w-32 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-100 rounded mb-6"></div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="h-10 w-64 bg-gray-100 rounded"></div>
            <div className="flex space-x-2">
              <div className="h-10 w-32 bg-gray-100 rounded"></div>
              <div className="h-10 w-48 bg-gray-100 rounded"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="h-16 w-full bg-gray-50 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
