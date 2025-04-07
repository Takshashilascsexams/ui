// src/services/exam.service.ts
import { ExamType } from "@/types/examTypes";

// Navigate to exam rules page (client-side only)
export const navigateToExamRules = (examId: string): void => {
  if (typeof window !== "undefined") {
    window.location.href = `/rules?examId=${examId}`;
  }
};

// Mock fetch function for development (simulates API response)
// This works on both client and server
export const mockFetchExams = async (
  page = 1,
  limit = 20,
  categories: string[] = []
): Promise<{
  status: string;
  fromCache: boolean;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  data: {
    categorizedExams: Record<string, ExamType[]>;
  };
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockExams: Record<string, ExamType[]> = {};

      // Generate mock exams for each category with deterministic data
      // to avoid hydration mismatches
      categories.forEach((category) => {
        if (category === "all") return;

        const categoryName = category
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" ");

        // Use fixed values instead of random to ensure consistency
        const examCount =
          category === "TEST_SERIES"
            ? 4
            : category === "SCREENING_TEST"
            ? 3
            : category === "SCHOLARSHIP_TEST"
            ? 2
            : 1;

        mockExams[category] = Array(examCount)
          .fill(0)
          .map((_, i) => ({
            id: `${category}-${i}`,
            title: `${categoryName} ${i + 1}`,
            description:
              "A focused examination on current affairs and general knowledge required for civil services preparation.",
            category: category,
            duration: 60 + (i % 3) * 30, // Deterministic durations
            totalMarks: 50 + (i % 4) * 25, // Deterministic marks
            difficulty: ["EASY", "MEDIUM", "HARD"][i % 3] as
              | "EASY"
              | "MEDIUM"
              | "HARD", // Deterministic difficulty
            passPercentage: 45 + (i % 4) * 5, // Deterministic percentage
            date: "2025-05-20", // Fixed date
            isFeatured: false,
            participants: 500 + i * 100, // Deterministic participants
          }));
      });

      // Add featured exams with deterministic data
      mockExams["featured"] = Array(3)
        .fill(0)
        .map((_, i) => ({
          id: `featured-${i}`,
          title: `Featured Exam ${i + 1}`,
          description:
            "This comprehensive test covers key concepts in Indian Polity and Governance. Perfect for competitive exam preparation.",
          category: "TEST_SERIES",
          duration: 120,
          totalMarks: 100,
          difficulty: ["EASY", "MEDIUM", "HARD"][i % 3] as
            | "EASY"
            | "MEDIUM"
            | "HARD", // Deterministic difficulty
          passPercentage: 60,
          date: "2025-04-15", // Fixed date
          isFeatured: true,
          participants: 1240 + i * 100, // Deterministic participants
        }));

      resolve({
        status: "success",
        fromCache: false,
        pagination: {
          total: 45,
          page: page,
          pages: 3,
          limit: limit,
        },
        data: {
          categorizedExams: mockExams,
        },
      });
    }, 800);
  });
};

// Server-side (or client-side) fetch function for real API
export const fetchExams = async (page = 1, limit = 20): Promise<unknown> => {
  try {
    // Check if we're running on the server or client
    if (typeof window === "undefined") {
      // Server-side implementation (could use more direct methods)
      // For mock data in server components:
      return mockFetchExams(page, limit, [
        "TEST_SERIES",
        "SCREENING_TEST",
        "SCHOLARSHIP_TEST",
        "OTHER",
      ]);

      // For real API calls on server:
      // const response = await fetch(`${process.env.API_URL}/exams/categorized?page=${page}&limit=${limit}`);
      // if (!response.ok) throw new Error('Failed to fetch exams');
      // return await response.json();
    } else {
      // Client-side implementation
      const response = await fetch(
        `/api/exams/categorized?page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error("Failed to fetch exams");
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching exams:", error);
    // In case of error, return a consistent structure with empty data
    return {
      status: "error",
      data: {
        categorizedExams: {
          featured: [],
          TEST_SERIES: [],
          SCREENING_TEST: [],
          SCHOLARSHIP_TEST: [],
          OTHER: [],
        },
      },
      pagination: {
        total: 0,
        page: page,
        pages: 0,
        limit: limit,
      },
    };
  }
};
