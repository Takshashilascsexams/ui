import { getStats } from "@/services/dashboard.services";

export async function DashboardStatsCards() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Total Exams",
      value: stats.totalExams,
      icon: "📝",
      bgColor: "bg-blue-500",
      change: "+15%",
      trend: "up",
    },
    {
      title: "Total Questions",
      value: stats.totalQuestions,
      icon: "❓",
      bgColor: "bg-pink-500",
      change: "+32%",
      trend: "up",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: "👥",
      bgColor: "bg-emerald-500",
      change: "+24%",
      trend: "up",
    },
    {
      title: "Average Pass Rate",
      value: `${stats.averagePassRate}%`,
      icon: "📊",
      bgColor: "bg-amber-500",
      change: "+3%",
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className="rounded-lg overflow-hidden">
          <div
            className={`${card.bgColor} p-4 text-white flex items-center justify-between`}
          >
            <div>
              <p className="text-sm opacity-90">{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <div className="text-2xl opacity-90">{card.icon}</div>
          </div>
          <div className="p-2 bg-gray-50 flex justify-between items-center border-x border-b border-gray-100 rounded-b-lg">
            <div
              className={`text-sm ${
                card.trend === "up" ? "text-green-600" : "text-red-600"
              } font-medium flex items-center`}
            >
              <span className="mr-1">{card.trend === "up" ? "↑" : "↓"}</span>
              {card.change}
            </div>
            <div className="text-xs text-gray-500">vs. last month</div>
          </div>
        </div>
      ))}
    </div>
  );
}
