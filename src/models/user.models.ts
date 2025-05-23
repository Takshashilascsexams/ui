import mongoose from "mongoose";
import {
  gender,
  category,
  highestEducation,
  roles,
  districts,
} from "@/utils/arrays";

// Define the TypeScript interface with proper types
export interface UserInterface extends mongoose.Document {
  clerkId: string;
  email: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  fullName: string;
  careOf: string;
  dateOfBirth: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to clean, normalize spaces, and format text
const cleanAndFormatText = (str: string): string => {
  if (!str) return str;

  // First remove special characters except letters, numbers, spaces, and some basic punctuation
  const filteredStr = str.replace(/[^\w\s.,'-]/g, "");

  // Then normalize all whitespace (replace multiple spaces with single space)
  const normalizedStr = filteredStr.trim().replace(/\s+/g, " ");

  // Words that should be lowercase in title case (unless they're the first word)
  const lowerCaseWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "but",
    "or",
    "for",
    "nor",
    "as",
    "at",
    "by",
    "for",
    "from",
    "in",
    "into",
    "near",
    "of",
    "on",
    "onto",
    "to",
    "with",
    "is",
    "are",
    "was",
    "were",
  ]);

  // Check if a word is likely an acronym (all uppercase)
  const isAcronym = (word: string): boolean => {
    return word.length > 1 && word === word.toUpperCase();
  };

  const words = normalizedStr.split(" ");

  return words
    .map((word, index) => {
      // If it's an acronym, keep it as is
      if (isAcronym(word)) {
        return word;
      }

      // Handle hyphenated words
      if (word.includes("-")) {
        return word
          .split("-")
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join("-");
      }

      // First word or words that shouldn't be lowercase
      if (index === 0 || !lowerCaseWords.has(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Lowercase words like articles, prepositions, etc.
      return word.toLowerCase();
    })
    .join(" ");
};

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^\d{10}$/.test(v);
        },
        message: "Phone number must be exactly 10 digits.",
      },
    },
    alternatePhoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return (
            v === undefined || v === null || v === "" || /^\d{10}$/.test(v)
          );
        },
        message: "Alternate phone number must be exactly 10 digits.",
      },
      sparse: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      set: cleanAndFormatText,
      minlength: [3, "Full name must be at least 3 characters long"],
      maxlength: [40, "Full name must have less than 40 characters"],
    },
    careOf: {
      type: String,
      required: true,
      trim: true,
      set: cleanAndFormatText,
      minlength: [
        3,
        "Father's or mother's name must be at least 3 characters.",
      ],
      maxlength: [
        40,
        "Father's or mother's name must have less than 40 characters",
      ],
    },
    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (dob: Date) {
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();

          // Adjust if birthday hasn't occurred yet this year
          const hasBirthdayOccurred =
            today.getMonth() > dob.getMonth() ||
            (today.getMonth() === dob.getMonth() &&
              today.getDate() >= dob.getDate());

          if (!hasBirthdayOccurred) {
            age -= 1;
          }

          return age >= 18;
        },
        message: "Date of birth cannot be less than 18 years.",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: gender,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: category,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      set: cleanAndFormatText,
      minlength: [8, "Provide full address"],
      maxlength: [100, "Address must have less than 100 characters"],
    },
    district: {
      type: String,
      required: true,
      enum: districts,
      trim: true,
    },
    highestEducation: {
      type: String,
      required: true,
      enum: highestEducation,
      trim: true,
    },
    collegeOrUniversityName: {
      type: String,
      trim: true,
      set: cleanAndFormatText,
    },
    previouslyAttempted: {
      type: String,
      required: true,
      enum: ["Yes", "No"],
      trim: true,
    },
    currentlyEmployed: {
      type: String,
      required: true,
      enum: ["Yes", "No"],
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: roles,
      default: "Student",
      trim: true,
    },
  },
  { timestamps: true }
);

// Define optimized indexes with no duplications
UserSchema.index({ fullName: "text", address: "text" });
UserSchema.index({ district: 1, category: 1 }); // Covers queries for district and district+category
UserSchema.index({ role: 1, district: 1 }); // Covers queries for role and role+district
UserSchema.index({ dateOfBirth: 1 }); // Important for age-based queries
UserSchema.index({ createdAt: -1 }); // For sorting by newest first

// Use mongoose.models.User || mongoose.model pattern for Next.js to avoid model recompilation errors
const User =
  mongoose.models.User || mongoose.model<UserInterface>("User", UserSchema);

export default User;
