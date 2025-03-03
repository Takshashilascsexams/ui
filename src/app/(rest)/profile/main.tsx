"use client";

import Link from "next/link";

type MainPropType = {
  userData: {
    role: string;
    fullName: string;
  };
};

export default function Main({ userData }: MainPropType) {
  const { role, fullName } = userData;

  return (
    <div>
      <p>Hello, {fullName}!</p>
      {role === "Admin" && (
        <Link
          href={"/dashboard"}
          className="px-2 py-1 bg-indigo-600 rounded-md text-white"
        >
          Go to admin dashboard
        </Link>
      )}
    </div>
  );
}
