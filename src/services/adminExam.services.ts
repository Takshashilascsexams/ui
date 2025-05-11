import getClerkToken from "@/actions/client/getClerkToken";

/**
 * Service to interact with admin exam-related API endpoints
 */
class ExamAdminService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  /**
   * Get all exams for admin dashboard
   * @param page Page number
   * @param limit Items per page
   * @param sortBy Field to sort by
   * @param sortOrder Sort order (asc or desc)
   * @param filters Optional filters
   */
  async getAllExams(
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filters: Record<string, string> = {}
  ) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    // Build query string from filters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    // Add any additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await fetch(
      `${this.apiUrl}/exam?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch exams");
    }

    return await response.json();
  }

  /**
   * Get detailed exam statistics
   * @param examId ID of the exam
   */
  async getExamDetails(examId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/exam/${examId}/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        tags: [`exam-details-${examId}`],
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch exam details");
    }

    return await response.json();
  }

  /**
   * Update exam active status
   * @param examId ID of the exam
   * @param isActive New active status
   */
  async updateExamStatus(examId: string, isActive: boolean) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/exam/${examId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update exam status");
    }

    return await response.json();
  }

  /**
   * Delete an exam
   * @param examId ID of the exam to delete
   */
  async deleteExam(examId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/exam/${examId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete exam");
    }

    return true;
  }
}

// Export as singleton
const examAdminService = new ExamAdminService();
export default examAdminService;
