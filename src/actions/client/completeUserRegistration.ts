"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { OnboardingDataType } from "@/types/dataTypes";
import User from "@/models/user.models";
import { connectDB } from "@/lib/connectDB";

export const completeUserRegistration = async (
  onboardingData: OnboardingDataType
) => {
  // Get the authenticated user
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No logged in user");
  }

  // Initialize Clerk client
  const client = await clerkClient();
  const userCount = await client.users.getCount();
  const currentUser = await client.users.getUser(userId);

  // Extract user data from Clerk
  const { id, imageUrl, emailAddresses } = currentUser;

  // Determine role (first user becomes Admin)
  const role = userCount === 1 ? "Admin" : "Student";

  try {
    // Connect to database
    await connectDB();

    // Handle empty alternatePhoneNumber
    const sanitizedOnboardingData = { ...onboardingData };
    if (sanitizedOnboardingData.alternatePhoneNumber === "") {
      sanitizedOnboardingData.alternatePhoneNumber = undefined;
    }

    // Create user object with all needed data
    const userObject = {
      clerkId: id,
      email: emailAddresses[0].emailAddress,
      role,
      avatar: imageUrl,
      ...sanitizedOnboardingData,
    };

    // Check if user already exists in database
    const existingUser = await User.findOne({ clerkId: id });

    let dbUser;
    if (existingUser) {
      // Update existing user if found
      dbUser = await User.findOneAndUpdate({ clerkId: id }, userObject, {
        new: true,
        runValidators: true,
      });
    } else {
      // Create new user if not found
      dbUser = await User.create(userObject);
    }

    // Update Clerk metadata with minimal data
    await client.users.updateUser(userId, {
      publicMetadata: {
        userId: dbUser._id.toString(),
        fullName: dbUser.fullName,
        role,
        onboardingComplete: true,
      },
    });

    // Convert Mongoose document to plain object before returning
    const plainUser = JSON.parse(JSON.stringify(dbUser));

    return {
      success: true,
      message: "Registration completed successfully",
      user: plainUser,
    };
  } catch (error) {
    console.error("Registration error:", error);

    // Handle database validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      throw new Error(`${error.message}`);
    }

    // Handle duplicate key errors
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new Error("A user with this email or phone number already exists");
    }

    // Attempt to clean up if the first operation succeeded but the second failed
    if (error instanceof Error && error.message.includes("Clerk")) {
      // If the error is from Clerk but we already created the DB user,
      // we could potentially delete the DB user here
      try {
        await User.findOneAndDelete({ clerkId: id });
      } catch (cleanupError) {
        console.error("Failed to clean up after error:", cleanupError);
      }
    }

    throw new Error(
      `Failed to complete registration: ${(error as Error).message}`
    );
  }
};
