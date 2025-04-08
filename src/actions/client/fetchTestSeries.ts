"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import getClerkToken from "@/actions/client/getClerkToken";
import { unstable_noStore } from "next/cache";

export type TestSeriesType = {
  _id: string;
  isActive: boolean;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
};

export async function fetchTestSeries(): Promise<TestSeriesType[]> {
  unstable_noStore();

  try {
    const token = await getClerkToken();

    if (!token) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/exam/test-series`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // This ensures we always get fresh data
        cache: "no-store",
        next: { tags: ["testSeries"] },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch test series");
    }

    const data = await response.json();
    return data.data.exams || [];
  } catch (error) {
    console.error("Error fetching test series:", error);
    return [];
  }
}

// Call this function whenever a new test series is created
export async function revalidateTestSeries() {
  revalidateTag("testSeries"); // Revalidate test series data
  revalidatePath("/exams"); // Revalidate exams page if you have one
}
