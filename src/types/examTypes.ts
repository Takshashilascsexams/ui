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
  participants?: number;
};

// Pagination type
export type PaginationType = {
  total: number;
  page: number;
  pages: number;
  limit: number;
};
