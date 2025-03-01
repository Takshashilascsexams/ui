import mongoose from "mongoose";
import {
  gender,
  category,
  highestEducation,
  roles,
  districts,
} from "@/utils/arrays";

export interface UserInterface extends mongoose.Document {
  clerkId: string;
  email: string;
  phoneNumber: number;
  alternatePhoneNumber: number;
  fullName: string;
  careOf: string;
  dateOfBirth: Date;
  gender: typeof gender;
  category: typeof category;
  address: string;
  district: typeof districts;
  highestEducation: typeof highestEducation;
  collegeOrUniversityName?: string;
  previouslyAttempted: ["Yes", "No"];
  currentlyEmployed: ["Yes", "No"];
  avatar: string;
  role: typeof roles;
}

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true, unique: true },
    alternatePhoneNumber: { type: Number, required: true },
    fullName: { type: String, required: true },
    careOf: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: gender },
    category: {
      type: String,
      required: true,
      enum: category,
    },
    address: { type: String, required: true },
    district: { type: String, required: true, enum: districts },
    highestEducation: {
      type: String,
      required: true,
      enum: highestEducation,
    },
    collegeOrUniversityName: { type: String },
    previouslyAttempted: { type: String, required: true, enum: ["Yes", "No"] },
    currentlyEmployed: { type: String, required: true, enum: ["Yes", "No"] },
    avatar: { type: String },
    role: {
      type: String,
      enum: roles,
      default: "Student",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
