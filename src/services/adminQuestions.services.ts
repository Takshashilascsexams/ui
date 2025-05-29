import getClerkToken from "@/actions/client/getClerkToken";

// ============= SHARED TYPE DEFINITIONS =============
// Supporting interfaces for nested objects
export interface QuestionOption {
  _id?: string; // MongoDB ObjectId (optional for new options)
  optionText: string;
  isCorrect: boolean;
}

export interface QuestionStatement {
  _id?: string; // MongoDB ObjectId (optional for new statements)
  statementNumber: number;
  statementText: string;
  isCorrect: boolean;
}

// Base question data interface - matches backend model exactly
export interface BaseQuestionData {
  questionText: string;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  subject: string;
  marks: number;
  hasNegativeMarking: boolean;
  negativeMarks: number;
  correctAnswer: string;
  questionCode?: string;
  image?: string;
  explanation: string;
  // Administrative fields (optional for frontend, but present in backend)
  isActive?: boolean;
  createdBy?: string; // ObjectId as string
  examId?: string; // ObjectId as string
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  _id?: string; // MongoDB ObjectId
}

// MCQ specific properties
export interface MCQQuestionData extends BaseQuestionData {
  type: "MCQ";
  options: QuestionOption[];
  // MCQ questions don't have statements or statement instructions
  statements?: never;
  statementInstruction?: never;
}

// Statement based question properties
export interface StatementQuestionData extends BaseQuestionData {
  type: "STATEMENT_BASED";
  options: QuestionOption[];
  statements: QuestionStatement[];
  statementInstruction: string;
}

// Union type for both question types
export type QuestionData = MCQQuestionData | StatementQuestionData;

// Form-specific interfaces
export interface QuestionFormValues {
  questionText: string;
  type: "MCQ" | "STATEMENT_BASED";
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  subject: string;
  marks: string; // Form values are strings initially
  hasNegativeMarking: "Yes" | "No"; // Form values are string enums
  negativeMarks: string; // Form values are strings initially
  correctAnswer: string;
  questionCode?: string;
  explanation: string;
  image?: string;
  options: QuestionOption[];
  statements?: QuestionStatement[];
  statementInstruction?: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
  fromCache?: boolean;
}

export interface QuestionResponse {
  question: QuestionData;
}

export interface QuestionsListResponse {
  questions: QuestionData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Type transformation utilities
export function isStatementBasedQuestion(
  question: QuestionData
): question is StatementQuestionData {
  return question.type === "STATEMENT_BASED";
}

export function isMCQQuestion(
  question: QuestionData
): question is MCQQuestionData {
  return question.type === "MCQ";
}

// Transform form values to API payload
export function transformFormToApiPayload(
  values: QuestionFormValues
): Omit<
  QuestionData,
  "_id" | "createdAt" | "updatedAt" | "createdBy" | "examId"
> {
  const basePayload = {
    questionText: values.questionText,
    type: values.type,
    difficultyLevel: values.difficultyLevel,
    subject: values.subject,
    marks: parseInt(values.marks),
    hasNegativeMarking: values.hasNegativeMarking === "Yes",
    negativeMarks: parseFloat(values.negativeMarks),
    correctAnswer: values.correctAnswer,
    questionCode: values.questionCode || "",
    explanation: values.explanation,
    image: values.image || "",
    options: values.options,
    isActive: true,
  };

  if (values.type === "STATEMENT_BASED") {
    return {
      ...basePayload,
      type: "STATEMENT_BASED",
      statements: values.statements || [],
      statementInstruction: values.statementInstruction || "",
    } as StatementQuestionData;
  } else {
    return {
      ...basePayload,
      type: "MCQ",
    } as MCQQuestionData;
  }
}

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
   */
  async getAllQuestions(
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filters: Record<string, string> = {}
  ): Promise<ApiResponse<QuestionsListResponse>> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await fetch(
      `${this.apiUrl}/questions?${queryParams.toString()}`,
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
   */
  async getQuestionById(
    questionId: string
  ): Promise<ApiResponse<QuestionResponse>> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/questions/${questionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch question details");
    }

    return await response.json();
  }

  /**
   * Update a question using form values
   */
  async updateQuestion(
    questionId: string,
    formValues: QuestionFormValues
  ): Promise<ApiResponse<QuestionResponse>> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    // Transform form values to API payload
    const questionData = transformFormToApiPayload(formValues);

    const response = await fetch(`${this.apiUrl}/questions/${questionId}`, {
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
   * Create a new question using form values
   */
  async createQuestion(
    formValues: QuestionFormValues & { examId: string }
  ): Promise<ApiResponse<QuestionResponse>> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    // Transform form values to API payload and add examId
    const basePayload = transformFormToApiPayload(formValues);
    const questionData = {
      ...basePayload,
      examId: formValues.examId,
    };

    const response = await fetch(`${this.apiUrl}/questions/single-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create question");
    }

    return await response.json();
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: string): Promise<boolean> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

    const response = await fetch(`${this.apiUrl}/questions/${questionId}`, {
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
