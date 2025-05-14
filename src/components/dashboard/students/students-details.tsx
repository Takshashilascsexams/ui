"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import userAdminService from "@/services/adminUser.services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLoading from "../exams/dashboard-loading";

// Types
interface StudentsDetailsData {
  user: {
    _id: string;
    clerkId: string;
    email: string;
    phoneNumber: number;
    alternatePhoneNumber: number;
    fullName: string;
    careOf: string;
    dateOfBirth: string;
    gender: string;
    category: string;
    address: string;
    district: string;
    highestEducation: string;
    collegeOrUniversityName?: string;
    previouslyAttempted: string;
    currentlyEmployed: string;
    avatar?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface UserDetailsProps {
  userId: string;
}

export default function StudentsDetails({ userId }: UserDetailsProps) {
  const [userData, setUserData] = useState<StudentsDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await userAdminService.getUserById(userId);
        setUserData(response.data);
      } catch (error) {
        toast.error("Failed to load user details", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <Link
          href="/dashboard/users"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
        <DashboardLoading />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <Link
          href="/dashboard/users"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            User not found
          </h3>
          <p className="text-gray-600">
            The user you are looking for does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const { user } = userData;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Link
            href="/dashboard/students"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
          <p className="text-sm text-gray-600 mt-1">{user.email}</p>
        </div>
      </div>

      {/* User profile information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Basic personal details of the user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p>{user.fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Care Of</p>
                <p>{user.careOf}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Date of Birth
                </p>
                <p>{formatDate(user.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p>{user.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <p>{user.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p>{user.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>User contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Phone Number
                </p>
                <p>{user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Alternate Phone
                </p>
                <p>{user.alternatePhoneNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p>{user.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">District</p>
                <p>{user.district}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Educational Information</CardTitle>
            <CardDescription>{`User's educational background`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Highest Education
                </p>
                <p>{user.highestEducation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  College/University
                </p>
                <p>{user.collegeOrUniversityName || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Previously Attempted
                </p>
                <p>{user.previouslyAttempted}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Currently Employed
                </p>
                <p>{user.currentlyEmployed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>User account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="text-xs font-mono">{user._id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Clerk ID</p>
                <p className="text-xs font-mono">{user.clerkId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p>{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Last Updated
                </p>
                <p>{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}
