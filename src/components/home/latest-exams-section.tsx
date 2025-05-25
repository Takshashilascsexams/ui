import Link from "next/link";
import { FetchLatestExamsType } from "@/actions/client/fetchLatestExams";
import { AlertTriangle, Ban, CheckCircle } from "lucide-react";

type LatestExamsSectionProps = {
  testSeries: FetchLatestExamsType[];
};

export default function LatestExamsSection({
  testSeries,
}: LatestExamsSectionProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`;
  };

  // ✅ NEW: Get attempt information display text
  const getAttemptInfo = (exam: FetchLatestExamsType) => {
    const attemptCount = exam.attemptCount || 0;
    const maxAttempt = exam.maxAttempt || 1;
    const allowMultiple = exam.allowMultipleAttempts || false;

    if (attemptCount === 0) {
      return {
        text: allowMultiple ? `0/${maxAttempt} attempts` : "Not attempted",
        color: "text-green-700",
        bgColor: "bg-green-50",
        icon: CheckCircle,
      };
    }

    if (allowMultiple) {
      const hasAttemptsLeft = exam.hasAttemptAccess ?? true;
      return {
        text: `${attemptCount}/${maxAttempt} attempts`,
        color: hasAttemptsLeft ? "text-blue-700" : "text-red-700",
        bgColor: hasAttemptsLeft ? "bg-blue-50" : "bg-red-50",
        icon: hasAttemptsLeft ? AlertTriangle : Ban,
      };
    }

    return {
      text: "Already attempted",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      icon: AlertTriangle,
    };
  };

  // ✅ NEW: Determine if exam can be accessed
  const canAccessExam = (exam: FetchLatestExamsType) => {
    return exam.hasAttemptAccess ?? true;
  };

  // ✅ NEW: Get appropriate button text and style
  const getButtonConfig = (exam: FetchLatestExamsType) => {
    const canAccess = canAccessExam(exam);
    const hasAttempted = exam.hasAttempted;
    const allowMultiple = exam.allowMultipleAttempts || false;

    if (!canAccess) {
      if (!allowMultiple) {
        return {
          text: "Already Attempted",
          disabled: true,
          className:
            "w-full block text-center py-2 text-sm font-medium rounded-full bg-gray-300 text-gray-500 cursor-not-allowed",
        };
      } else {
        return {
          text: "No Attempts Left",
          disabled: true,
          className:
            "w-full block text-center py-2 text-sm font-medium rounded-full bg-red-300 text-red-700 cursor-not-allowed",
        };
      }
    }

    if (hasAttempted && allowMultiple) {
      return {
        text: "View Details",
        disabled: false,
        className:
          "w-full block text-center py-2 text-sm font-medium rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300",
      };
    }

    return {
      text: "View Details",
      disabled: false,
      className:
        "w-full block text-center py-2 text-sm font-medium rounded-full bg-[#2E4057] text-white hover:bg-[#243244] transition-colors duration-300",
    };
  };

  // Filter to only show active test series
  const activeTestSeries = testSeries.filter(
    (series) => series.isActive === true
  );

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

        {activeTestSeries.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">
              No active test series available at the moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTestSeries.map((series) => {
              const attemptInfo = getAttemptInfo(series);
              const buttonConfig = getButtonConfig(series);
              const AttemptIcon = attemptInfo.icon;

              return (
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

                      {/* ✅ UPDATED: Enhanced attempt status display */}
                      <div
                        className={`px-3 py-1 ${attemptInfo.bgColor} ${attemptInfo.color} rounded-full text-xs font-medium flex items-center gap-1`}
                      >
                        <AttemptIcon className="h-3 w-3" />
                        {attemptInfo.text}
                      </div>
                    </div>

                    {/* ✅ UPDATED: Enhanced button logic with attempt access control */}
                    {buttonConfig.disabled ? (
                      <button
                        disabled
                        className={buttonConfig.className}
                        title={
                          !canAccessExam(series)
                            ? series.allowMultipleAttempts
                              ? "All attempts have been used"
                              : "You have already attempted this exam"
                            : "Cannot access exam"
                        }
                      >
                        {buttonConfig.text}
                      </button>
                    ) : (
                      <Link
                        href={`/tests/#${series._id}`}
                        className={buttonConfig.className}
                      >
                        {buttonConfig.text}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
