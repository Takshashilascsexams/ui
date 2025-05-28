import { getPerformanceData } from "@/services/dashboard.services";
import { AdvancedChart } from "@/components/dashboard/advanced-chart";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  bgColor: string;
  textColor: string;
}

function MetricCard({
  title,
  value,
  change,
  trend,
  bgColor,
  textColor,
}: MetricCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-3 border border-opacity-20`}>
      <p className={`text-xs ${textColor} font-medium`}>{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p
        className={`text-xs ${
          trend === "up" ? "text-green-600" : "text-red-600"
        }`}
      >
        {trend === "up" ? "↑" : "↓"} {change}
      </p>
    </div>
  );
}

async function PerformanceChartContent() {
  try {
    const performanceData = await getPerformanceData();
    const metrics = performanceData.currentMetrics;

    // Calculate changes (you might want to get these from the API)
    const averageScoreChange = "5.2%"; // This should come from your API
    const passRateChange = "3.8%";
    const participationChange = "2.1%";

    return (
      <div className="bg-white rounded-lg border border-gray-100 h-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Exam Performance</h2>
          <select className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="Average Score"
              value={`${Math.round(metrics?.averageScore || 0)}%`}
              change={averageScoreChange}
              trend="up"
              bgColor="bg-blue-50"
              textColor="text-blue-600"
            />
            <MetricCard
              title="Pass Rate"
              value={`${Math.round(metrics?.passRate || 0)}%`}
              change={passRateChange}
              trend="up"
              bgColor="bg-green-50"
              textColor="text-green-600"
            />
            <MetricCard
              title="Participation"
              value={`${Math.round(metrics?.completionRate || 0)}%`}
              change={participationChange}
              trend="down"
              bgColor="bg-amber-50"
              textColor="text-amber-600"
            />
          </div>

          <div className="h-64">
            <AdvancedChart data={performanceData} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering performance chart:", error);

    // Fallback UI
    return (
      <div className="bg-white rounded-lg border border-gray-100 h-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Exam Performance</h2>
          <select
            className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5"
            disabled
          >
            <option>Last 7 days</option>
          </select>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="Average Score"
              value="N/A"
              change="0%"
              trend="up"
              bgColor="bg-gray-50"
              textColor="text-gray-600"
            />
            <MetricCard
              title="Pass Rate"
              value="N/A"
              change="0%"
              trend="up"
              bgColor="bg-gray-50"
              textColor="text-gray-600"
            />
            <MetricCard
              title="Participation"
              value="N/A"
              change="0%"
              trend="up"
              bgColor="bg-gray-50"
              textColor="text-gray-600"
            />
          </div>

          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 mb-2">
                Unable to load performance data
              </p>
              <p className="text-sm text-gray-400">
                Please try refreshing the page
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export async function PerformanceChart() {
  return (
    <Suspense fallback={<DashboardSkeleton type="chart" />}>
      <PerformanceChartContent />
    </Suspense>
  );
}
