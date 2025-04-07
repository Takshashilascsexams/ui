// src/utils/exam.utils.ts
import { ExamType } from "@/types/examTypes";

// Get difficulty color based on level
export const getDifficultyColor = (level?: string) => {
  switch (level?.toUpperCase()) {
    case "EASY":
      return "bg-green-50 text-green-700 border-green-200";
    case "MEDIUM":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "HARD":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

// Format date to readable format
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Use a fixed format that will be consistent between server and client
    // Format: YYYY-MM-DD
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  } catch (error) {
    console.log(error);
    return dateString;
  }
};

// Apply filters to exam list
export const applyFilters = (
  examList: ExamType[],
  category: string,
  query: string
): ExamType[] => {
  let filtered = [...examList];

  // Filter by category
  if (category !== "all") {
    filtered = filtered.filter((exam) => {
      return exam.category === category;
    });
  }

  // Filter by search query
  if (query) {
    filtered = filtered.filter(
      (exam) =>
        exam.title.toLowerCase().includes(query.toLowerCase()) ||
        exam.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  return filtered;
};

// Get query parameter
export const getQueryParam = (param: string): string => {
  if (typeof window === "undefined") return "";
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || "";
};

// Update URL with new page number
export const updateUrlWithPage = (page: number): void => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("page", page.toString());
  window.history.pushState({}, "", url);
};
