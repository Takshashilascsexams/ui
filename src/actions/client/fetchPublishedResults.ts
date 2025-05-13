"use server";

import getClerkToken from "./getClerkToken";

export async function fetchPublishedResults() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    // Get authentication token
    const token = await getClerkToken();

    // Call the API to get published results
    const response = await fetch(`${API_URL}/publications/active`, {
      method: "GET",
      cache: "no-store", // Don't cache results
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error fetching published results:", response.statusText);
      return [];
    }

    const data = await response.json();

    // Make sure we're returning the expected format
    return data.data.publications || [];
  } catch (error) {
    console.error("Error fetching published results:", error);
    return [];
  }
}
