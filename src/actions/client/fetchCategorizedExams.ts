"use server";

import { revalidateTag } from "next/cache";
import getClerkToken from "@/actions/client/getClerkToken";
import { unstable_noStore } from "next/cache";
import { ApiResponseExamType, PaginationType } from "@/types/examTypes";

export type CategorizedExamsResponse = {
  status: string;
  fromCache: boolean;
  pagination: PaginationType;
  data: {
    categorizedExams: Record<string, ApiResponseExamType[]>;
  };
};

/**
 * Fetches categorized exams from the backend
 *
 * @param page Page number (defaults to 1)
 * @param limit Number of items per page (defaults to 6)
 * @returns Categorized exams with pagination information
 */

export async function fetchCategorizedExams(): Promise<CategorizedExamsResponse> {
  unstable_noStore();

  try {
    // Get authentication token
    const token = await getClerkToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    // Construct the URL with query parameters
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/exam/categorized`);
    // url.searchParams.append("page", page.toString());
    // url.searchParams.append("limit", limit.toString());

    // Make the fetch request
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Use Next.js caching with tags for revalidation
      next: {
        tags: ["exams-categorized"],
        // Optional: Set revalidation period in seconds
        // revalidate: 60 * 10, // 10 minutes
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch exams");
    }

    const data: CategorizedExamsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categorized exams:", error);

    // Return a minimal response structure so UI doesn't break
    return {
      status: "error",
      fromCache: false,
      pagination: {
        total: 0,
        page: 0,
        pages: 0,
        limit: 0,
      },
      data: {
        categorizedExams: {},
      },
    };
  }
}

/**
 * Manually revalidate the exam data when needed
 * (e.g., after creating or updating an exam)
 */
export async function revalidateCategorizedExams(): Promise<void> {
  revalidateTag("exams-categorized");
}
