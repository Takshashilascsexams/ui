"use server";

import { auth } from "@clerk/nextjs/server";

const getClerkToken = async () => {
  try {
    const { getToken } = await auth();
    const clerkToken = await getToken();
    return clerkToken;
  } catch (error) {
    // Fallback for static rendering
    console.log("Error getting Clerk token:", error);
    return null;
  }
};

export default getClerkToken;
