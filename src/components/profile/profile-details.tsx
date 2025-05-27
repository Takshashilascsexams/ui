import { convertToRedeableDate } from "@/lib/convertToReadableDate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Clock, Cake } from "lucide-react";
import ExamResultsSection from "./exam-results-section";

type ProfileDetailsProps = {
  fullName: string;
  email: string;
  phoneNumber: string;
  joined: number;
  dateOfBirth: string;
};

export default function ProfileDetails({
  fullName,
  email,
  phoneNumber,
  joined,
  dateOfBirth,
}: ProfileDetailsProps) {
  // Format phone number for display (hide part of it for privacy)
  const formatPhoneNumber = (phone: string) => {
    if (!phone || phone === "Not provided") return phone;
    // If phone has country code (starts with +), keep first 4 and last 4 digits
    if (phone.startsWith("+")) {
      return phone.slice(0, 4) + "••••" + phone.slice(-4);
    }
    // Otherwise just mask the middle
    return phone.slice(0, 3) + "••••" + phone.slice(-3);
  };

  // Format date of birth
  const formattedDOB =
    dateOfBirth !== "Not provided"
      ? convertToRedeableDate(dateOfBirth)
      : "Not provided";

  // Format join date
  const formattedJoinDate = convertToRedeableDate(joined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Personal Information
        </h2>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Basic Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-full">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Full Name</p>
                <p className="text-gray-900">{fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-full">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email</p>
                <p className="text-gray-900">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-full">
                <Phone className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Phone Number
                </p>
                <p className="text-gray-900">
                  {formatPhoneNumber(phoneNumber)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-full">
                <Cake className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Date of Birth
                </p>
                <p className="text-gray-900">{formattedDOB}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-full">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Member Since
                </p>
                <p className="text-gray-900">{formattedJoinDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exam Results Section */}
      <ExamResultsSection />
    </div>
  );
}
