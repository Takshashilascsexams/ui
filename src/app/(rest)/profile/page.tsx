import { Metadata } from "next";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileDetails from "@/components/profile/profile-details";
import getClerkToken from "@/actions/client/getClerkToken";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "My Profile - Takshashila School of Civil Services",
  description:
    "Manage your account settings, view exam history, track progress and update personal information for your civil services preparation journey.",
};

async function fetchProfileData() {
  const token = await getClerkToken();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 300 }, // Cache for 5 minutes (300 seconds)
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }

  const data = await response.json();
  return data.data.user;
}

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 rounded-lg border border-slate-200 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  // Fetch user data from our API
  const userData = await fetchProfileData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">
          View and manage your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <ProfileHeader
            imageUrl={userData.imageUrl}
            fullName={userData.fullName}
            role={userData.role}
          />
        </div>
        <div className="lg:col-span-8">
          <ProfileDetails
            fullName={userData.fullName}
            email={userData.email}
            phoneNumber={userData.phoneNumber}
            joined={userData.joined}
            dateOfBirth={userData.dateOfBirth}
          />
        </div>
      </div>
    </div>
  );
}
