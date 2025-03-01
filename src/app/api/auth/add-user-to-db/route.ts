import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/user.models";

export async function POST(request: NextRequest) {
  try {
    connectDB();

    const requestBody = await request.json();
    const {
      clerkId,
      email,
      phoneNumber,
      alternatePhoneNumber,
      fullName,
      careOf,
      dateOfBirth,
      gender,
      category,
      address,
      district,
      highestEducation,
      collegeOrUniversityName,
      previouslyAttempted,
      currentlyEmployed,
      avatar,
      role,
    } = requestBody;

    if (
      [
        clerkId,
        email,
        phoneNumber,
        alternatePhoneNumber,
        fullName,
        careOf,
        dateOfBirth,
        gender,
        category,
        address,
        district,
        highestEducation,
        previouslyAttempted,
        currentlyEmployed,
        avatar,
        role,
      ].some((field) => !field)
    ) {
      return NextResponse.json(
        { message: "Please provide all the fields", success: false },
        { status: 400 }
      );
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = await User.create({
        clerkId,
        email,
        phoneNumber: parseInt(phoneNumber),
        alternatePhoneNumber: parseInt(alternatePhoneNumber),
        fullName,
        careOf,
        dateOfBirth,
        gender,
        category,
        address,
        district,
        highestEducation,
        collegeOrUniversityName,
        previouslyAttempted,
        currentlyEmployed,
        avatar,
        role,
      });
    }

    return NextResponse.json(
      {
        message: `User with clerkId ${clerkId} has been successfully added to database.`,
        data: user,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { error: "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
