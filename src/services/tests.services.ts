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

      // Generate mock exams for each category
      categories.forEach((category) => {
        if (category === "all") return;

        const categoryName = category
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" ");

        mockExams[category] = Array(Math.floor(Math.random() * 5) + 1)
          .fill(0)
          .map((_, i) => ({
            id: `${category}-${i}`,
            title: `${categoryName} ${i + 1}`,
            description:
              "A focused examination on current affairs and general knowledge required for civil services preparation.",
            category: category,
            duration: 60 + Math.floor(Math.random() * 6) * 10,
            totalMarks: 50 + Math.floor(Math.random() * 6) * 10,
            difficulty: ["EASY", "MEDIUM", "HARD"][
              Math.floor(Math.random() * 3)
            ] as "EASY" | "MEDIUM" | "HARD",
            passPercentage: 45 + Math.floor(Math.random() * 4) * 5,
            date: "2025-05-20",
            isFeatured: false,
            participants: Math.floor(Math.random() * 1000) + 500,
          }));
      });

      // Add featured exams
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
          difficulty: ["EASY", "MEDIUM", "HARD"][
            Math.floor(Math.random() * 3)
          ] as "EASY" | "MEDIUM" | "HARD",
          passPercentage: 60,
          date: "2025-04-15",
          isFeatured: true,
          participants: 1240 + i * 100,
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
