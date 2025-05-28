import { getStats } from "@/services/dashboard.services";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  bgColor: string;
  change: string;
  trend: "up" | "down";
}

function StatCard({
  title,
  value,
  icon,
  bgColor,
  change,
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-lg overflow-hidden">
      <div
        className={`${bgColor} p-4 text-white flex items-center justify-between`}
      >
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-2xl opacity-90">{icon}</div>
      </div>
      <div className="p-2 bg-gray-50 flex justify-between items-center border-x border-b border-gray-100 rounded-b-lg">
        <div
          className={`text-sm ${
            trend === "up" ? "text-green-600" : "text-red-600"
          } font-medium flex items-center`}
        >
          <span className="mr-1">{trend === "up" ? "↑" : "↓"}</span>
          {change}
        </div>
        <div className="text-xs text-gray-500">vs. last month</div>
      </div>
    </div>
  );
}

async function DashboardStatsCardsContent() {
  try {
    const stats = await getStats();

    const statCards = [
      {
        title: "Total Exams",
        value: stats.totalExams,
        icon: "📝",
        bgColor: "bg-blue-500",
        change: stats.growth?.exams?.percentage
          ? `${Math.abs(stats.growth.exams.percentage)}%`
          : "0%",
        trend: stats.growth?.exams?.trend || "up",
      },
      {
        title: "Total Questions",
        value: stats.totalQuestions,
        icon: "❓",
        bgColor: "bg-pink-500",
        change: stats.growth?.questions?.percentage
          ? `${Math.abs(stats.growth.questions.percentage)}%`
          : "0%",
        trend: stats.growth?.questions?.trend || "up",
      },
      {
        title: "Total Students",
        value: stats.totalStudents,
        icon: "👥",
        bgColor: "bg-emerald-500",
        change: stats.growth?.students?.percentage
          ? `${Math.abs(stats.growth.students.percentage)}%`
          : "0%",
        trend: stats.growth?.students?.trend || "up",
      },
      {
        title: "Average Pass Rate",
        value: `${stats.averagePassRate}%`,
        icon: "📊",
        bgColor: "bg-amber-500",
        change: stats.growth?.passRate?.percentage
          ? `${Math.abs(stats.growth.passRate.percentage)}%`
          : "0%",
        trend: stats.growth?.passRate?.trend || "up",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            bgColor={card.bgColor}
            change={card.change}
            trend={card.trend as "up" | "down"}
          />
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error rendering dashboard stats cards:", error);

    // Fallback UI in case of error
    const fallbackCards = [
      {
        title: "Total Exams",
        value: "N/A",
        icon: "📝",
        bgColor: "bg-gray-400",
        change: "0%",
        trend: "up",
      },
      {
        title: "Total Questions",
        value: "N/A",
        icon: "❓",
        bgColor: "bg-gray-400",
        change: "0%",
        trend: "up",
      },
      {
        title: "Total Students",
        value: "N/A",
        icon: "👥",
        bgColor: "bg-gray-400",
        change: "0%",
        trend: "up",
      },
      {
        title: "Average Pass Rate",
        value: "N/A",
        icon: "📊",
        bgColor: "bg-gray-400",
        change: "0%",
        trend: "up",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {fallbackCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            bgColor={card.bgColor}
            change={card.change}
            trend={card.trend as "up" | "down"}
          />
        ))}
        <div className="col-span-full text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Unable to load dashboard statistics. Please try refreshing the page.
        </div>
      </div>
    );
  }
}

export async function DashboardStatsCards() {
  return (
    <Suspense fallback={<DashboardSkeleton type="cards" />}>
      <DashboardStatsCardsContent />
    </Suspense>
  );
}
