import { getPerformanceData } from "@/services/dashboard.services";

import { AdvancedChart } from "@/components/dashboard/advanced-chart";

export async function PerformanceChart() {
  const performanceData = await getPerformanceData();

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
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-gray-800">76%</p>
            <p className="text-xs text-green-600">↑ 5.2%</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <p className="text-xs text-green-600 font-medium">Pass Rate</p>
            <p className="text-2xl font-bold text-gray-800">82%</p>
            <p className="text-xs text-green-600">↑ 3.8%</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-amber-600 font-medium">Participation</p>
            <p className="text-2xl font-bold text-gray-800">68%</p>
            <p className="text-xs text-red-600">↓ 2.1%</p>
          </div>
        </div>

        <div className="h-64">
          <AdvancedChart data={performanceData} />
        </div>
      </div>
    </div>
  );
}
