import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { TestSeriesType } from "@/actions/fetchTestSeries";

const colorClasses = {
  blue: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500",
  green: "bg-green-600 hover:bg-green-700 disabled:bg-green-500",
  red: "bg-red-600 hover:bg-red-700 disabled:bg-red-500",
  yellow: "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-500",
};

interface TestSeriesSectionProps {
  testSeries: TestSeriesType[];
}

export default function TestSeriesSection({
  testSeries,
}: TestSeriesSectionProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`;
  };

  return (
    <div className="w-full px-4 md:px-7 lg:px-44 mt-10 md:mt-20 flex flex-col items-start justify-center gap-5">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
          Latest Test Series
        </h2>
        <Link
          href="/all-test-series"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {testSeries.length === 0 && (
        <div className="w-full p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">
            No test series available at the moment
          </p>
        </div>
      )}

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {testSeries.map((series) => (
          <div
            key={series._id}
            className="relative w-full h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            {!series.isActive && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-bl-lg">
                Inactive
              </div>
            )}
            <div className="p-5 flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {series.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {series.description}
              </p>

              <div className="flex flex-wrap mt-auto gap-3">
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {formatDuration(series.duration)} Duration
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  {series.totalMarks} Marks
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
              {series.isActive ? (
                <Link
                  href={`/test-series/${series._id}`}
                  className={twMerge(
                    "w-full block text-center py-2 text-sm text-white font-medium rounded-md transition-colors duration-300",
                    colorClasses.blue
                  )}
                >
                  View Details
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full block text-center py-2 text-sm text-white font-medium rounded-md bg-gray-400 cursor-not-allowed"
                >
                  Not Available
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
