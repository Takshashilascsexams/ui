import getClerkToken from "@/actions/client/getClerkToken";
import {
  DashboardStats,
  Activity,
  PerformanceData,
  DashboardOverview,
  PerformanceMetrics,
  RecentActivityResponse,
  SystemHealth,
  DashboardStatsResponse,
  DashboardAnalyticsResponse,
} from "@/types/dashboardTypes";

/**
 * Service to interact with dashboard-related API endpoints
 */
class DashboardService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const token = await getClerkToken();
      if (!token) throw new Error("Authentication token not available");

      const response = await fetch(`${this.apiUrl}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch dashboard stats");
      }

      const responseData = await response.json();

      // Handle both wrapped and direct API responses
      const data: DashboardStatsResponse = responseData.data || responseData;

      return {
        totalExams: data.overview?.totalExams || 0,
        totalQuestions: data.overview?.totalQuestions || 0,
        totalStudents: data.overview?.totalStudents || 0,
        averagePassRate: data.overview?.averagePassRate || 0,
        growth: {
          exams: data.growth?.exams || { percentage: 0, trend: "up" },
          questions: data.growth?.questions || { percentage: 0, trend: "up" },
          students: data.growth?.students || { percentage: 0, trend: "up" },
          passRate: data.growth?.passRate || { percentage: 0, trend: "up" },
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return fallback data
      return {
        totalExams: 0,
        totalQuestions: 0,
        totalStudents: 0,
        averagePassRate: 0,
        growth: {
          exams: { percentage: 0, trend: "up" },
          questions: { percentage: 0, trend: "up" },
          students: { percentage: 0, trend: "up" },
          passRate: { percentage: 0, trend: "up" },
        },
      };
    }
  }

  /**
   * Get recent activity
   * @param limit Number of activities to fetch
   */
  async getRecentActivity(limit = 5): Promise<Activity[]> {
    try {
      const token = await getClerkToken();
      if (!token) throw new Error("Authentication token not available");

      const response = await fetch(
        `${this.apiUrl}/dashboard/activity?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch recent activity");
      }

      const responseData = await response.json();

      // Handle both wrapped and direct API responses
      const data: RecentActivityResponse = responseData.data || responseData;

      return (data.activities || []).map((activity) => ({
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        priority: activity.priority || "normal",
        id: activity.id,
        details: activity.details,
      }));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return [];
    }
  }

  /**
   * Get performance data
   * @param timeRange Time range for performance data (default: 7d)
   */
  async getPerformanceData(timeRange = "7d"): Promise<PerformanceData> {
    try {
      const token = await getClerkToken();
      if (!token) throw new Error("Authentication token not available");

      const response = await fetch(
        `${this.apiUrl}/dashboard/performance?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch performance data");
      }

      const responseData = await response.json();

      // Handle both wrapped and direct API responses
      const data: PerformanceMetrics = responseData.data || responseData;

      // Transform the API data to match chart requirements
      const labels =
        data.trends?.map((trend) => {
          const date = new Date(trend.date);
          return date.toLocaleDateString("en-US", { weekday: "short" });
        }) || [];

      const passRateData = data.trends?.map((trend) => trend.passRate) || [];
      const participationData =
        data.trends?.map((trend) => trend.completionRate) || [];

      return {
        labels,
        datasets: [
          {
            label: "Pass Rate (%)",
            data: passRateData,
          },
          {
            label: "Student Participation",
            data: participationData,
          },
        ],
        currentMetrics: data.overview || {
          averageScore: 0,
          passRate: 0,
          completionRate: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching performance data:", error);
      // Return fallback data
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Pass Rate (%)",
            data: [0, 0, 0, 0, 0, 0, 0],
          },
          {
            label: "Student Participation",
            data: [0, 0, 0, 0, 0, 0, 0],
          },
        ],
        currentMetrics: {
          averageScore: 0,
          passRate: 0,
          completionRate: 0,
        },
      };
    }
  }

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/dashboard/overview`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch dashboard overview");
    }

    const responseData = await response.json();

    // Handle both wrapped and direct API responses
    const data = responseData.data || responseData;

    // Ensure dataTimestamp is provided
    return {
      ...data,
      dataTimestamp: data.dataTimestamp || new Date().toISOString(),
    };
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/dashboard/health`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch system health");
    }

    const responseData = await response.json();

    // Handle both wrapped and direct API responses
    return responseData.data || responseData;
  }

  /**
   * Get dashboard analytics with optional parameters
   * @param params Optional analytics parameters
   */
  async getDashboardAnalytics(params?: {
    timeRange?: string;
    compareWith?: string;
    includeForecasts?: boolean;
  }): Promise<DashboardAnalyticsResponse> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const queryParams = new URLSearchParams();
    if (params?.timeRange) queryParams.set("timeRange", params.timeRange);
    if (params?.compareWith) queryParams.set("compareWith", params.compareWith);
    if (params?.includeForecasts) queryParams.set("includeForecasts", "true");

    const endpoint = `/dashboard/analytics${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch dashboard analytics");
    }

    const responseData = await response.json();

    // Handle both wrapped and direct API responses
    return responseData.data || responseData;
  }
}

// Export as singleton
const dashboardService = new DashboardService();
export default dashboardService;

// Export individual methods for backward compatibility
export const getStats = () => dashboardService.getStats();
export const getRecentActivity = (limit?: number) =>
  dashboardService.getRecentActivity(limit);
export const getPerformanceData = (timeRange?: string) =>
  dashboardService.getPerformanceData(timeRange);
export const getDashboardOverview = () =>
  dashboardService.getDashboardOverview();
export const getSystemHealth = () => dashboardService.getSystemHealth();
export const getDashboardAnalytics = (params?: {
  timeRange?: string;
  compareWith?: string;
  includeForecasts?: boolean;
}) => dashboardService.getDashboardAnalytics(params);
