import getClerkToken from "@/actions/client/getClerkToken";

export interface QuestionOption {
  _id?: string;
  optionText: string;
  isCorrect: boolean;
}

export interface QuestionStatement {
  _id?: string;
  statementNumber: number;
  statementText: string;
  isCorrect: boolean;
}

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
  isActive?: boolean;
  createdBy?: string;
  examId?: string;
  createdAt?: string;
  updatedAt?: string;
  _id?: string;
}

export interface MCQQuestionData extends BaseQuestionData {
  type: "MCQ";
  options: QuestionOption[];
  statements?: never;
  statementInstruction?: never;
}

export interface StatementQuestionData extends BaseQuestionData {
  type: "STATEMENT_BASED";
  options: QuestionOption[];
  statements: QuestionStatement[];
  statementInstruction: string;
}

export type QuestionData = MCQQuestionData | StatementQuestionData;

export interface QuestionFormValues {
  questionText: string;
  type: "MCQ" | "STATEMENT_BASED";
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  subject: string;
  marks: string;
  hasNegativeMarking: "Yes" | "No";
  negativeMarks: string;
  correctAnswer: string;
  questionCode?: string;
  explanation: string;
  image?: string;
  options: QuestionOption[];
  statements?: QuestionStatement[];
  statementInstruction?: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
  fromCache?: boolean;
}

export interface QuestionResponse {
  question: QuestionData;
}

export interface QuestionsListResponseFlat {
  questions: QuestionData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

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

class QuestionAdminService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  async getAllQuestions(
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    filters: Record<string, string> = {}
  ): Promise<ApiResponse<QuestionsListResponseFlat>> {
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

    const result = await response.json();

    // ✅ CORRECTED: Enhanced response handling to support both old and new API structures
    let normalizedData: QuestionsListResponseFlat;

    // Check if the API returns the old structure with pagination object
    if (result.data && result.data.pagination) {
      // Old structure: { data: { questions: [], pagination: { ... } } }
      normalizedData = {
        questions: result.data.questions || [],
        totalCount: result.data.pagination.total || 0,
        currentPage: result.data.pagination.page || page,
        totalPages: result.data.pagination.pages || 1,
        pagination: result.data.pagination, // Preserve old pagination object
      };
    } else if (result.data && Array.isArray(result.data.questions)) {
      // New flat structure: { data: { questions: [], totalCount: 0, ... } }
      const totalCount = result.data.totalCount || 0;
      const totalPages = Math.ceil(totalCount / limit);
      normalizedData = {
        questions: result.data.questions,
        totalCount,
        currentPage: result.data.currentPage || page,
        totalPages: result.data.totalPages || totalPages,
        // ✅ CORRECTED: Create pagination object for backward compatibility
        pagination: {
          total: totalCount,
          page: result.data.currentPage || page,
          pages: result.data.totalPages || totalPages,
          limit: limit,
        },
      };
    } else if (Array.isArray(result.questions)) {
      // Direct structure: { questions: [], totalCount: 0, ... }
      const totalCount = result.totalCount || result.total || 0;
      const totalPages =
        result.totalPages || result.pages || Math.ceil(totalCount / limit);
      normalizedData = {
        questions: result.questions,
        totalCount,
        currentPage: result.currentPage || result.page || page,
        totalPages,
        // ✅ CORRECTED: Create pagination object for backward compatibility
        pagination: {
          total: totalCount,
          page: result.currentPage || result.page || page,
          pages: totalPages,
          limit: limit,
        },
      };
    } else {
      // ✅ CORRECTED: Fallback with comprehensive pagination object creation
      const totalCount =
        result.data?.totalCount ||
        result.totalCount ||
        result.total ||
        (result.data?.questions || result.questions || []).length;
      const totalPages =
        result.data?.totalPages ||
        result.totalPages ||
        result.pages ||
        Math.ceil(totalCount / limit);
      const currentPage =
        result.data?.currentPage || result.currentPage || result.page || page;

      normalizedData = {
        questions: result.data?.questions || result.questions || [],
        totalCount,
        currentPage,
        totalPages,
        // ✅ CORRECTED: Always create pagination object for backward compatibility
        pagination: result.data?.pagination || {
          total: totalCount,
          page: currentPage,
          pages: totalPages,
          limit: limit,
        },
      };
    }

    return {
      status: "success",
      message: "Questions retrieved successfully",
      data: normalizedData,
    };
  }

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

  async updateQuestion(
    questionId: string,
    formValues: QuestionFormValues
  ): Promise<ApiResponse<QuestionResponse>> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

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

  async createQuestion(
    formValues: QuestionFormValues & { examId: string }
  ): Promise<ApiResponse<QuestionResponse>> {
    const token = await getClerkToken();
    if (!token) throw new Error("Authentication token not available");

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

const questionAdminService = new QuestionAdminService();
export default questionAdminService;
