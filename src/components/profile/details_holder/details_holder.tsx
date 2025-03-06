"use client";

import ProfileInfoHolder from "./profile_information";
import ExamHistoryHolder from "./exam_history";

export type DetailsHolderPropType = {
  fullName: string;
  email: string;
  phoneNumber: string;
  joined: number;
  dateOfBirth: string;
};

export default function DetailsHolder(props: DetailsHolderPropType) {
  return (
    <div className="w-full lg:flex- px-6 py-5 border-[1px] border-slate-200 rounded-lg">
      {/* profile information */}
      <div className="w-full flex items-start justify-center">
        <ProfileInfoHolder {...props} />
      </div>

      {/* exam history */}
      <div className="w-full mt-5 flex flex-col items-start justify-center gap-4">
        <ExamHistoryHolder />
      </div>
    </div>
  );
}
