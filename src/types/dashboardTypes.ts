export interface DashboardStats {
  totalExams: number;
  totalQuestions: number;
  totalStudents: number;
  averagePassRate: number;
}

export interface Activity {
  type: "exam" | "question" | "student";
  title: string;
  description: string;
  timestamp: string;
}

export interface PerformanceData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}
