"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/connectDB";
import { OnboardingDataType } from "@/types/dataTypes";

export const addUserToDb = async (onboardingData: OnboardingDataType) => {
  connectDB();

  const { userId } = await auth();

  if (!userId) {
    throw new Error("No Logged In User");
  }

  const client = await clerkClient();
  const userCount = await client.users.getCount();
  const currentUser = await client.users.getUser(userId);

  const { id, imageUrl, emailAddresses, phoneNumbers } = currentUser;

  const userObject = {
    ...onboardingData,
    clerkId: id,
    email: emailAddresses[0].emailAddress,
    phoneNumber: phoneNumbers[0].phoneNumber,
    role: userCount === 1 ? "Admin" : "Student",
    avatar: imageUrl,
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

  return { message: "User was successfully to database" };
};
