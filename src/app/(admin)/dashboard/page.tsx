export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { DashboardErrorBoundary } from "@/components/dashboard/error-boundary";

export const metadata = {
  title: "Dashboard - Exam Portal",
  description: "Admin dashboard for exam management system",
};

function getCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const currentDate = getCurrentDate();

  return (
    <div className="p-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here&apos;s your exam portal overview
          </p>
        </div>
        <div className="mt-4 sm:mt-0 bg-blue-50 p-3 rounded-md border border-blue-100">
          <p className="text-sm font-medium text-blue-800">
            Today: <span className="font-bold">{currentDate}</span>
          </p>
        </div>
      </div>

      {/* Stats cards with error boundary */}
      <div className="mb-6">
        <DashboardErrorBoundary
          fallback={
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">
                Unable to load dashboard statistics
              </p>
            </div>
          }
        >
          <Suspense fallback={<DashboardSkeleton type="cards" />}>
            <DashboardStatsCards />
          </Suspense>
        </DashboardErrorBoundary>
      </div>

      {/* Main content area with proper grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <DashboardErrorBoundary
            fallback={
              <div className="bg-white rounded-lg border border-gray-100 h-64 flex items-center justify-center">
                <p className="text-gray-500">
                  Unable to load performance chart
                </p>
              </div>
            }
          >
            <Suspense fallback={<DashboardSkeleton type="chart" />}>
              <PerformanceChart />
            </Suspense>
          </DashboardErrorBoundary>
        </div>

        <div className="xl:col-span-1">
          <DashboardErrorBoundary
            fallback={
              <div className="bg-white rounded-lg border border-gray-100 h-64 flex items-center justify-center">
                <p className="text-gray-500">Unable to load recent activity</p>
              </div>
            }
          >
            <Suspense fallback={<DashboardSkeleton type="activity" />}>
              <RecentActivity />
            </Suspense>
          </DashboardErrorBoundary>
        </div>
      </div>

      {/* Action buttons */}
      <div>
        <DashboardErrorBoundary
          fallback={
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <p className="text-gray-500">Unable to load quick actions</p>
            </div>
          }
        >
          <Suspense fallback={<DashboardSkeleton type="actions" />}>
            <QuickActions />
          </Suspense>
        </DashboardErrorBoundary>
      </div>

      {/* Optional footer with system info */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              All systems operational
            </span>
          </div>
          <div className="mt-2 sm:mt-0">
            <span>Exam Portal v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
