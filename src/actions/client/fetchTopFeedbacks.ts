"use server";

export type FetchTopFeedbacksType = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type FetchTopFeedbacksResponse = {
  status: string;
  fromCache: boolean;
  data: {
    feedbacks: FetchTopFeedbacksType[];
  };
};

export async function fetchTopFeedbacks(
  limit: number = 4,
  anonymous: boolean = false
): Promise<FetchTopFeedbacksType[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = new URL(`${baseUrl}/feedback/top`);

    // Add query parameters
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("anonymous", anonymous.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure fresh data on each request
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch top feedbacks:",
        response.status,
        response.statusText
      );
      return [];
    }

    const result: FetchTopFeedbacksResponse = await response.json();

    if (result.status === "success" && result.data?.feedbacks) {
      return result.data.feedbacks;
    }

    return [];
  } catch (error) {
    console.error("Error fetching top feedbacks:", error);
    return [];
  }
}
