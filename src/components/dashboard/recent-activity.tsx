import { getRecentActivity } from "@/services/dashboard.services";
import { formatDashboardDate } from "@/lib/formatDashboardDate";

export async function RecentActivity() {
  const activities = await getRecentActivity();

  // Icon mapping
  const getIcon = (type: string) => {
    switch (type) {
      case "exam":
        return "📝";
      case "question":
        return "❓";
      case "student":
        return "👤";
      default:
        return "📌";
    }
  };

  // Background color mapping
  const getBgColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-blue-100 text-blue-700";
      case "question":
        return "bg-pink-100 text-pink-700";
      case "student":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 h-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
        <a
          href="#"
          className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
        >
          View all
        </a>
      </div>

      <div className="p-2 max-h-[400px] overflow-auto">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex p-3 border-b last:border-0 border-gray-50"
          >
            <div
              className={`${getBgColor(
                activity.type
              )} h-8 w-8 rounded-full flex items-center justify-center text-lg shrink-0`}
            >
              {getIcon(activity.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-800">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDashboardDate(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
