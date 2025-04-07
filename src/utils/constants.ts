import { CategoryType } from "@/types/examTypes";

// Categories for exams
export const CATEGORIES: CategoryType[] = [
  { id: "all", name: "All Exams" },
  { id: "TEST_SERIES", name: "Test Series" },
  { id: "SCREENING_TEST", name: "Screening Tests" },
  { id: "SCHOLARSHIP_TEST", name: "Scholarship" },
  { id: "OTHER", name: "Others" },
];

// Items to display per page
export const ITEMS_PER_PAGE = 6;
