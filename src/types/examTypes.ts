// Category type
export type CategoryType = {
  id: string;
  name: string;
};

export interface BundledExam {
  _id: string;
  title: string;
  hasAccess: boolean;
  // ✅ NEW: Added attempt-related fields
  hasAttemptAccess: boolean;
  attemptCount: number;
  allowMultipleAttempts?: boolean;
  maxAttempt?: number;
}

export interface BundleDetailsBundledExam {
  id: string;
  // id: string; // For consistency with the ExamType
  title: string;
  description: string;
  category: string;
  duration: number;
  totalMarks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  passPercentage: number;
  date: string;
  isFeatured: boolean;
  isPremium: boolean;
  price: number;
  discountPrice?: number;
  accessPeriod?: number;
  hasAccess: boolean;
  // ✅ NEW: Added attempt-related fields
  hasAttemptAccess: boolean;
  attemptCount: number;
  allowMultipleAttempts?: boolean;
  maxAttempt: number;
}

// Bundle specific type
export type BundleType = ExamType & {
  isBundle: boolean;
  bundleTag: string;
  bundledExams: BundleDetailsBundledExam[];
};

// Exam type
export type ExamType = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  totalMarks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  passPercentage: number;
  date: string;
  isFeatured: boolean;
  isPremium: boolean;
  isPartOfBundle?: boolean;
  price: number;
  discountPrice?: number;
  accessPeriod?: number;
  participants?: number;
  hasAccess: boolean;
  bundledExams?: BundledExam[];
  // ✅ NEW: Added attempt-related fields
  hasAttemptAccess: boolean;
  attemptCount: number;
  allowMultipleAttempts?: boolean;
  maxAttempt?: number;
};

export type BundleExamType = {
  accessPeriod: number;
  bundleTag: string;
  bundledExams: BundledExam[];
  category: "TEST_SERIES" | "SCREENING_TEST" | "SCHOLARSHIP_TEST" | "OTHER";
  description: string;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  discountPrice: number;
  duration: number;
  hasAccess: boolean;
  isBundle: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  passPercentage: number;
  price: number;
  priority: number;
  title: string;
  totalMarks: number;
  _id: string;
  // ✅ NEW: Added attempt-related fields
  hasAttemptAccess: boolean;
  attemptCount: number;
  allowMultipleAttempts?: boolean;
  maxAttempt?: number;
};

// API response type for fetch categorized exams
export type ApiResponseExamType = {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  totalMarks: number;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  passMarkPercentage: number;
  createdAt: string;
  isActive: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  isPartOfBundle?: boolean;
  price: number;
  discountPrice: number;
  accessPeriod: number;
  hasAccess: boolean;
  bundledExams?: BundleExamType[];
  // ✅ NEW: Added attempt-related fields from API response
  hasAttemptAccess: boolean;
  attemptCount: number;
  allowMultipleAttempts?: boolean;
  maxAttempt?: number;
};

// API response type for fetch bundle details
export type ApiBundleResponseType = {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  totalMarks: number;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
  passMarkPercentage: number;
  createdAt: string;
  isActive: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  price: number;
  discountPrice: number;
  accessPeriod: number;
  isBundle: boolean;
  bundleTag: string;
  hasAccess: boolean;
  // ✅ NEW: Added attempt-related fields
  hasAttemptAccess: boolean;
  attemptCount: number;
  allowMultipleAttempts?: boolean;
  maxAttempt?: number;
  bundledExams: {
    _id: string;
    title: string;
    description: string;
    category: string;
    duration: number;
    totalMarks: number;
    difficultyLevel: "EASY" | "MEDIUM" | "HARD";
    passMarkPercentage: number;
    isFeatured: boolean;
    isPremium: boolean;
    isPartOfBundle?: boolean;
    discountPrice?: number;
    hasAccess: boolean;
    accessPeriod?: number;
    participants?: number;
    bundledExams?: BundleDetailsBundledExam[];
    // ✅ NEW: Added attempt-related fields for bundled exams
    hasAttemptAccess: boolean;
    attemptCount: number;
    allowMultipleAttempts?: boolean;
    maxAttempt?: number;
  }[];
};

// Pagination type
export type PaginationType = {
  total: number;
  page: number;
  pages: number;
  limit: number;
};
