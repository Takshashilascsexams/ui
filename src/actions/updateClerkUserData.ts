"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

type updateClerkUserDataPropType = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export const updateClerkUserData = async ({
  fullName,
  email,
  phoneNumber,
}: updateClerkUserDataPropType) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No Logged In User");
  }

  const client = await clerkClient();
  const currentUser = await client.users.getUser(userId);
  console.log(currentUser);

  try {
    await client.users.updateUser(userId, {
      publicMetadata: {
        fullName,
      },
    });

    return { message: "Onboarding completed successfully" };
  } catch (error) {
    console.log("error in onboarding:", error);
    throw new Error("Could not complete onboarding at the moment");
  }
};
