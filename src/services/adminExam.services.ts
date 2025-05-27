import getClerkToken from "@/actions/client/getClerkToken";
import { revalidateCategorizedExams } from "@/actions/client/fetchCategorizedExams";
import { revalidateTestSeries } from "@/actions/client/fetchLatestExams";

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
   * Get a specific exam by ID
   * @param examId ID of the exam to fetch
   */
  async getExamById(examId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/exam/${examId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch exam details");
    }

    return await response.json();
  }

  /**
   * Update an exam
   * @param examId ID of the exam to update
   * @param examData Updated exam data
   */
  async updateExam(
    examId: string,
    examData: { title: string; description: string; isActive: boolean }
  ) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/exam/${examId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update exam");
    }

    // Revalidate caches
    await Promise.all([revalidateTestSeries(), revalidateCategorizedExams()]);

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

  /**
   * Fetch exam results with optional filtering, sorting, and pagination
   * @param {string} examId - ID of the exam
   * @param {string} queryString - Optional query parameters for filtering/sorting
   * @returns {Promise<Object>} - Results data with pagination
   */
  async getExamResults(examId: string, queryString = "") {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const url = queryString
      ? `${this.apiUrl}/exam-attempt/exam/${examId}/results?${queryString}`
      : `${this.apiUrl}/exam-attempt/exam/${examId}/results`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch exam results");
    }

    return await response.json();
  }

  /**
   * Get detailed student result by attempt ID
   * @param attemptId ID of the exam attempt
   */
  async getStudentDetailedResult(attemptId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/student-result/${attemptId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch student result");
    }

    return await response.json();
  }

  /**
   * Get exam publications
   * @param examId ID of the exam
   */
  async getExamPublications(examId: string) {
    try {
      const token = await getClerkToken();
      if (!token) throw new Error("Authentication token not available");

      const response = await fetch(
        `${this.apiUrl}/publications/exams/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch exam publications");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching exam publications:", error);
      throw error;
    }
  }

  /**
   * Generate new exam results
   * @param examId of the exam
   */
  async generateExamResults(examId: string) {
    try {
      const token = await getClerkToken();
      if (!token) throw new Error("Authentication token not available");

      const response = await fetch(
        `${this.apiUrl}/publications/exams/${examId}/generate-results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}), // Empty object as body instead of headers in body
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate exam results");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating exam results:", error);
      throw error;
    }
  }

  /**
   * Toggle publication status
   * @param publicationId and isPublished of the exam
   */
  async togglePublicationStatus(publicationId: string, isPublished: boolean) {
    try {
      const token = await getClerkToken();
      if (!token) throw new Error("Authentication token not available");

      const response = await fetch(
        `${this.apiUrl}/publications/${publicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPublished }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to toggle publication status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error toggling publication status:", error);
      throw error;
    }
  }

  /**
   * Get publication details by ID
   * @param publicationId ID of the publication to fetch
   */
  async getPublicationById(publicationId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/publications/${publicationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch publication details");
    }

    return await response.json();
  }

  /**
   * Recalculate exam attempt results for a specific student
   * @param attemptId ID of the exam attempt
   * @param studentId ID of the student
   */
  async recalculateExamAttempt(attemptId: string, studentId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/admin-recalculate/${attemptId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to recalculate exam attempt");
    }

    return await response.json();
  }
}

// Export as singleton
const examAdminService = new ExamAdminService();
export default examAdminService;
