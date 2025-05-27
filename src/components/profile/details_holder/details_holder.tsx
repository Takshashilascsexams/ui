"use client";

import ProfileInfoHolder from "./profile_information";
import ExamResultsSection from "../exam-results-section";

export type DetailsHolderPropType = {
  fullName: string;
  email: string;
  phoneNumber: string;
  joined: number;
  dateOfBirth: string;
};

export default function DetailsHolder(props: DetailsHolderPropType) {
  return (
    <div className="w-full space-y-6">
      {/* Profile Information */}
      <div className="w-full">
        <ProfileInfoHolder {...props} />
      </div>

      {/* Exam Results Section */}
      <div className="w-full">
        <ExamResultsSection />
      </div>
    </div>
  );
}
