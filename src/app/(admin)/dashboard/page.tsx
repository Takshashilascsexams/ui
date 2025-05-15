import { Suspense } from "react";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

export const metadata = {
  title: "Dashboard - Exam Portal",
  description: "Admin dashboard for exam management system",
};

export default async function DashboardPage() {
  return (
    <div className="p-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            {"Welcome back! Here's your exam portal overview"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 bg-blue-50 p-3 rounded-md border border-blue-100">
          <p className="text-sm font-medium text-blue-800">
            Today: <span className="font-bold">Thursday, May 15, 2025</span>
          </p>
        </div>
      </div>

      {/* Stats cards with proper spacing */}
      <div className="mb-6">
        <Suspense fallback={<DashboardSkeleton type="cards" />}>
          <DashboardStatsCards />
        </Suspense>
      </div>

      {/* Main content area with proper grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <Suspense fallback={<DashboardSkeleton type="chart" />}>
            <PerformanceChart />
          </Suspense>
        </div>

        <div className="xl:col-span-1">
          <Suspense fallback={<DashboardSkeleton type="activity" />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>

      {/* Action buttons */}
      <div>
        <Suspense fallback={<DashboardSkeleton type="actions" />}>
          <QuickActions />
        </Suspense>
      </div>
    </div>
  );
}
