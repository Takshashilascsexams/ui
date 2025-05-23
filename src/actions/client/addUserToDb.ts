"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { OnboardingDataType } from "@/types/dataTypes";

export const addUserToDb = async (onboardingData: OnboardingDataType) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No Logged In User");
  }

  const client = await clerkClient();
  const userCount = await client.users.getCount();
  const currentUser = await client.users.getUser(userId);

  const { id, imageUrl, emailAddresses } = currentUser;

  const userObject = {
    clerkId: id,
    email: emailAddresses[0].emailAddress,
    role: userCount === 1 ? "Admin" : "Student",
    avatar: imageUrl,
    ...onboardingData,
  };

  const Url = `${process.env.NEXT_PUBLIC_URL}/api/auth/add-user-to-db`;
  const body = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userObject),
  };

  const response = await fetch(Url, body);
  // const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to add user to database");
  }

  return { message: "User was successfully added to database" };
};
