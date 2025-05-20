import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/user.models";

// Define a type for the request body
interface UserRequestBody {
  clerkId: string;
  email: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  fullName: string;
  careOf: string;
  dateOfBirth: string | Date;
  gender: "Male" | "Female";
  category: string;
  address: string;
  district: string;
  highestEducation: string;
  collegeOrUniversityName?: string;
  previouslyAttempted: "Yes" | "No";
  currentlyEmployed: "Yes" | "No";
  avatar?: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const requestBody: UserRequestBody = await request.json();

    // Validate required fields
    const requiredFields = [
      "clerkId",
      "email",
      "phoneNumber",
      "fullName",
      "careOf",
      "dateOfBirth",
      "gender",
      "category",
      "address",
      "district",
      "highestEducation",
      "previouslyAttempted",
      "currentlyEmployed",
    ];

    const missingFields = requiredFields.filter(
      (field) => !requestBody[field as keyof UserRequestBody]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(requestBody.email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address", success: false },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(requestBody.phoneNumber)) {
      return NextResponse.json(
        { message: "Phone number must be exactly 10 digits", success: false },
        { status: 400 }
      );
    }

    // Validate alternate phone number if provided
    if (
      requestBody.alternatePhoneNumber &&
      !phoneRegex.test(requestBody.alternatePhoneNumber)
    ) {
      return NextResponse.json(
        {
          message: "Alternate phone number must be exactly 10 digits",
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate name length
    if (requestBody.fullName.length < 3 || requestBody.fullName.length > 100) {
      return NextResponse.json(
        {
          message: "Full name must be between 3 and 100 characters",
          success: false,
        },
        { status: 400 }
      );
    }

    // Validate address length
    if (requestBody.address.length < 10) {
      return NextResponse.json(
        { message: "Address must be at least 10 characters", success: false },
        { status: 400 }
      );
    }

    // Check if user already exists
    const user = await User.findOne({ clerkId: requestBody.clerkId });

    if (user) {
      return NextResponse.json(
        {
          message: `User with clerkId ${requestBody.clerkId} already exists in database.`,
          data: user,
          success: false,
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Check for email or phone duplicates
    const existingEmail = await User.findOne({ email: requestBody.email });
    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already in use", success: false },
        { status: 409 }
      );
    }

    const existingPhone = await User.findOne({
      phoneNumber: requestBody.phoneNumber,
    });
    if (existingPhone) {
      return NextResponse.json(
        { message: "Phone number already in use", success: false },
        { status: 409 }
      );
    }

    // Create new user with properly typed data
    const newUser = await User.create({
      ...requestBody,
      dateOfBirth: new Date(requestBody.dateOfBirth),
    });

    return NextResponse.json(
      {
        message: `User with clerkId ${requestBody.clerkId} has been successfully added to database.`,
        data: newUser,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user:", error);

    // Handle mongoose validation errors
    if (
      error instanceof Error &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 400 }
      );
    }

    // Define a custom interface for MongoDB errors
    interface MongoError extends Error {
      code?: number;
    }

    // Handle duplicate key errors
    if (
      error instanceof Error &&
      "code" in error &&
      (error as MongoError).code === 11000
    ) {
      return NextResponse.json(
        {
          message:
            "Duplicate entry found. Email or phone number already exists.",
          success: false,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: (error as Error).message,
        success: false,
      },
      { status: 500 }
    );
  }
}
