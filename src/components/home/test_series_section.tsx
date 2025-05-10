import Link from "next/link";
import { TestSeriesType } from "@/actions/client/fetchTestSeries";

type TestSeriesSectionProps = {
  testSeries: TestSeriesType[];
};

export default function TestSeriesSection({
  testSeries,
}: TestSeriesSectionProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`;
  };

  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#2E4057] relative">
            Latest Test Series
          </h2>
          <Link
            href="/tests"
            className="px-3 py-2 text-sm text-[#2E4057] font-semibold opacity-80 hover:opacity-100 rounded-full hover:bg-slate-100"
          >
            View All
          </Link>
        </div>

        {testSeries.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">
              No test series available at the moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testSeries.map((series) => (
              <div
                key={series._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:translate-y-[-8px] transition-all duration-300 border border-slate-200"
              >
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#2E4057] mb-3 line-clamp-2">
                    {series.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {series.description}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {formatDuration(series.duration)} Duration
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                      {series.totalMarks} Marks
                    </div>
                  </div>

                  <Link
                    href={`/test-series/${series._id}`}
                    className={`w-full block text-center py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                      series.isActive
                        ? "bg-[#2E4057] text-white hover:bg-[#243244]"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                  >
                    {series.isActive ? "View Details" : "Not Available"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
