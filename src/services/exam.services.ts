import getClerkToken from "@/actions/client/getClerkToken";

/**
 * Service to interact with exam-related API endpoints
 * Optimized for high concurrency and performance
 */
class ExamService {
  private apiUrl: string;
  private cache: Map<
    string,
    { data: Record<string, unknown>; timestamp: number }
  >;
  private cacheTTL: number; // milliseconds

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    this.cache = new Map();
    this.cacheTTL = 60 * 1000; // 1 minute cache
  }

  /**
   * Get exam rules before starting
   */
  async getExamRules(examId: string) {
    const cacheKey = `rules-${examId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/rules/${examId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch exam rules");
    }

    const data = await response.json();
    this.setToCache(cacheKey, data);
    return data;
  }

  /**
   * Start a new exam attempt
   */
  async startExam(examId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/start/${examId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to start exam");
    }

    return await response.json();
  }

  /**
   * Check exam status
   */
  async checkExamStatus(attemptId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/status/${attemptId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to check exam status");
    }

    return await response.json();
  }

  /**
   * Get questions for an active exam attempt
   */
  async getExamQuestions(attemptId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/questions/${attemptId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch exam questions");
    }

    return await response.json();
  }

  /**
   * Save an answer for a question
   */
  async saveAnswer(
    attemptId: string,
    questionId: string,
    data: { selectedOption: string; responseTime: number }
  ) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/answer/${attemptId}/${questionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save answer");
    }

    return await response.json();
  }

  /**
   * Update time remaining for an exam attempt
   */
  async updateTimeRemaining(attemptId: string, timeRemaining: number) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/time/${attemptId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timeRemaining }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update time");
    }

    return await response.json();
  }

  /**
   * Submit an exam
   */
  async submitExam(attemptId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/submit/${attemptId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit exam");
    }

    return await response.json();
  }

  /**
   * Get the result of a completed exam attempt
   */
  async getAttemptResult(attemptId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(
      `${this.apiUrl}/exam-attempt/result/${attemptId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch result");
    }

    return await response.json();
  }

  // Cache helpers
  private getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setToCache(key: string, data: Record<string, unknown>) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

// Export as singleton
const examService = new ExamService();
export default examService;
