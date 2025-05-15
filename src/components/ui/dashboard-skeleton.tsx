interface DashboardSkeletonProps {
  type: "cards" | "activity" | "chart" | "actions";
}

export function DashboardSkeleton({ type }: DashboardSkeletonProps) {
  switch (type) {
    case "cards":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              <div className="bg-gray-200 p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-3 w-20 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 w-16 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                </div>
              </div>
              <div className="p-2 bg-gray-100 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-12 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "activity":
      return (
        <div className="bg-white rounded-lg border border-gray-100 h-full animate-pulse">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="p-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex p-3 border-b border-gray-50">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "chart":
      return (
        <div className="bg-white rounded-lg border border-gray-100 h-full animate-pulse">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-6 w-28 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="rounded-lg p-3 bg-gray-200">
                  <div className="h-3 w-20 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 w-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      );

    case "actions":
      return (
        <div className="bg-white rounded-lg border border-gray-100 animate-pulse">
          <div className="p-4 border-b border-gray-100">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center rounded-lg border border-gray-100 p-4"
                >
                  <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
      );
  }
}
