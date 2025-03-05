import { cache } from "react";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await (await clerkClient()).users.getUser(userId);
  return user;
});
