import {
  DashboardStats,
  Activity,
  PerformanceData,
} from "@/types/dashboardTypes";

export async function getStats(): Promise<DashboardStats> {
  // In a real implementation, this would fetch from your API
  return {
    totalExams: 32,
    totalQuestions: 248,
    totalStudents: 156,
    averagePassRate: 78,
  };
}

export async function getRecentActivity(): Promise<Activity[]> {
  // In a real implementation, this would fetch from your API
  return [
    {
      type: "exam",
      title: "Sample Test Created",
      description: "New screening exam created with 30 questions",
      timestamp: new Date().toISOString(),
    },
    {
      type: "question",
      title: "MCQ Questions Added",
      description:
        "Questions about Indian politics and environmental science added",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      type: "student",
      title: "New Student Registration",
      description: "Zakir Hussain from Kamrup Metropolitan district joined",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    },
    {
      type: "exam",
      title: "Exam Results Published",
      description: "Geography exam results are now available to students",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    },
    {
      type: "question",
      title: "Question Bank Updated",
      description: "Science question bank updated with 25 new questions",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    },
  ];
}

export async function getPerformanceData(): Promise<PerformanceData> {
  // In a real implementation, this would fetch from your API
  return {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Pass Rate (%)",
        data: [65, 72, 78, 75, 83, 82, 85],
      },
      {
        label: "Student Participation",
        data: [42, 53, 60, 62, 64, 75, 80],
      },
    ],
  };
}
