import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

type ProfileHeaderProps = {
  imageUrl: string;
  fullName: string;
  role: string;
};

export default function ProfileHeader({
  imageUrl,
  fullName,
  role,
}: ProfileHeaderProps) {
  // Extract first name to display in greeting
  const firstName = fullName.split(" ")[0];

  // Get initials for the avatar fallback
  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      <div className="px-6 pb-6 -mt-12">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 border-4 border-white rounded-full">
            <AvatarImage src={imageUrl} alt={fullName} />
            <AvatarFallback className="bg-indigo-600 text-white text-xl font-semibold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-sm text-gray-600">{role}</span>
              {role === "Admin" && (
                <Shield className="h-4 w-4 text-indigo-600" />
              )}
            </div>
          </div>

          <div className="w-full mt-6">
            {role === "Admin" && (
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                asChild
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>

          <div className="mt-6 w-full pt-4 border-t border-slate-200">
            <div className="text-sm text-gray-700 text-center">
              <p className="mb-2 font-medium">Welcome back, {firstName}!</p>
              <p className="text-gray-500">
                Manage your account and view your profile details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
