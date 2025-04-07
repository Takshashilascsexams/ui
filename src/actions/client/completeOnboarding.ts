"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { OnboardingDataType } from "@/types/dataTypes";

export const completeOnboarding = async (
  onboardingData: OnboardingDataType
) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No Logged In User");
  }

  const client = await clerkClient();
  const userCount = await client.users.getCount();

  try {
    await client.users.updateUser(userId, {
      publicMetadata: {
        ...onboardingData,
        onboardingComplete: true,
        role: userCount === 1 ? "Admin" : "Student",
      },
    });

    return { message: "Onboarding completed successfully" };
  } catch (error) {
    console.log("error in onboarding:", error);
    throw new Error("Could not complete onboarding at the moment");
  }
};
