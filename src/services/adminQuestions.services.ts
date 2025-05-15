import getClerkToken from "@/actions/client/getClerkToken";

interface QuestionOption {
  optionText: string;
  isCorrect: boolean;
}

interface QuestionStatement {
  statementNumber: number;
  statementText: string;
  isCorrect: boolean;
}

// Common properties for all question types
interface BaseQuestionData {
  questionText: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  marks: number;
  negativeMarks: number;
  explanation: string;
}

// MCQ specific properties
interface MCQQuestionData extends BaseQuestionData {
  type: "MCQ";
  options: QuestionOption[];
}

// Statement based question properties
interface StatementQuestionData extends BaseQuestionData {
  type: "STATEMENT_BASED";
  options: QuestionOption[];
  statements: QuestionStatement[];
  statementInstructions: string;
}

// Union type for both question types
type QuestionData = MCQQuestionData | StatementQuestionData;

/**
 * Service to interact with admin question-related API endpoints
 */
class QuestionAdminService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  /**
   * Get all questions for admin dashboard
   * @param page Page number
   * @param limit Items per page
   * @param sortBy Field to sort by
   * @param sortOrder Sort order (asc or desc)
   * @param filters Optional filters
   */
  async getAllQuestions(
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
      `${this.apiUrl}/question?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to fetch questions (${response.status})`
      );
    }

    return await response.json();
  }

  /**
   * Get a specific question by ID
   * @param questionId ID of the question to fetch
   */
  async getQuestionById(questionId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/question/${questionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch question details");
    }

    return await response.json();
  }

  /**
   * Update a question
   * @param questionId ID of the question to update
   * @param questionData Updated question data
   */
  async updateQuestion(questionId: string, questionData: QuestionData) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/question/${questionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update question");
    }

    return await response.json();
  }

  /**
   * Delete a question
   * @param questionId ID of the question to delete
   */
  async deleteQuestion(questionId: string) {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/question/${questionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete question");
    }

    return true;
  }
}

// Export as singleton
const questionAdminService = new QuestionAdminService();
export default questionAdminService;
