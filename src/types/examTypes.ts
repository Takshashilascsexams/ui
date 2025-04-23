// Category type
export type CategoryType = {
  id: string;
  name: string;
};

export interface BundledExam {
  _id: string;
  title: string;
  hasAccess: boolean;
}

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
};

// Pagination type
export type PaginationType = {
  total: number;
  page: number;
  pages: number;
  limit: number;
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
};
