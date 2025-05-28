import { getRecentActivity } from "@/services/dashboard.services";
import { formatDashboardDate } from "@/lib/formatDashboardDate";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { Activity } from "@/types/dashboardTypes";

// Icon mapping function
function getIcon(type: string): string {
  switch (type) {
    case "exam":
      return "📝";
    case "question":
      return "❓";
    case "student":
      return "👤";
    case "result":
      return "📊";
    default:
      return "📌";
  }
}

// Background color mapping function
function getBgColor(type: string): string {
  switch (type) {
    case "exam":
      return "bg-blue-100 text-blue-700";
    case "question":
      return "bg-pink-100 text-pink-700";
    case "student":
      return "bg-green-100 text-green-700";
    case "result":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

interface ActivityItemProps {
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="flex p-3 border-b last:border-0 border-gray-50 hover:bg-gray-50 transition-colors">
      <div
        className={`${getBgColor(
          activity.type
        )} h-8 w-8 rounded-full flex items-center justify-center text-lg shrink-0 shadow-sm`}
      >
        {getIcon(activity.type)}
      </div>
      <div className="ml-3 flex-1">
        <p className="font-medium text-gray-800 text-sm leading-tight">
          {activity.title}
        </p>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          {activity.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {formatDashboardDate(activity.timestamp)}
          </p>
          {activity.priority === "high" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              High Priority
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

async function RecentActivityContent() {
  try {
    const activities = await getRecentActivity();

    if (!activities || activities.length === 0) {
      return (
        <div className="bg-white rounded-lg border border-gray-100 h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <a
              href="/dashboard/activity"
              className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
            >
              View all
            </a>
          </div>

          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-3">📋</div>
            <div className="text-gray-500 font-medium mb-2">
              No recent activity
            </div>
            <p className="text-sm text-gray-400">
              Activity will appear here as users interact with the system
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-100 h-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest system updates</p>
          </div>
          <a
            href="/dashboard/activity"
            className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors flex items-center"
          >
            View all
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.id || `activity-${index}`}
              activity={activity}
            />
          ))}
        </div>

        {/* Activity summary footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Showing {activities.length} recent activities</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live updates
            </span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering recent activity:", error);

    // Fallback UI with retry option
    return (
      <div className="bg-white rounded-lg border border-red-200 h-full">
        <div className="flex justify-between items-center p-4 border-b border-red-100">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          <span className="text-red-500 text-sm font-medium">Unavailable</span>
        </div>

        <div className="p-8 text-center">
          <div className="text-red-400 text-4xl mb-3">⚠️</div>
          <div className="text-red-600 font-medium mb-2">
            Unable to load recent activity
          </div>
          <p className="text-sm text-red-500 mb-4">
            There was an error connecting to the activity service
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}

export async function RecentActivity() {
  return (
    <Suspense fallback={<DashboardSkeleton type="activity" />}>
      <RecentActivityContent />
    </Suspense>
  );
}
