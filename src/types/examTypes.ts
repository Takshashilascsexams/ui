// Category type
export type CategoryType = {
  id: string;
  name: string;
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
  price: number;
  discountPrice?: number;
  accessPeriod?: number;
  participants?: number;
  hasAccess: boolean;
};

// Pagination type
export type PaginationType = {
  total: number;
  page: number;
  pages: number;
  limit: number;
};
