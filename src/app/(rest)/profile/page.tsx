import { auth, clerkClient } from "@clerk/nextjs/server";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileDetails from "@/components/profile/profile-details";
// import { convertToRedeableDate } from "@/lib/convertToReadableDate";

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

  const currentUser = await (
    await clerkClient()
  ).users.getUser(userId as string);

  // Format user data for display
  const userData = {
    imageUrl: currentUser.imageUrl,
    fullName: (currentUser.publicMetadata.fullName as string) || "User",
    role: (currentUser.publicMetadata.role as string) || "Student",
    email: currentUser.emailAddresses[0]?.emailAddress || "Not provided",
    phoneNumber: currentUser.phoneNumbers[0]?.phoneNumber || "Not provided",
    dateOfBirth:
      (currentUser.publicMetadata.dateOfBirth as string) || "Not provided",
    joined: currentUser.createdAt || Date.now(),
  };

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
