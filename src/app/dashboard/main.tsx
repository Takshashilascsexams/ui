"use client";

import { SignedIn, UserButton, useUser } from "@clerk/nextjs";

export default function Main() {
  const { user } = useUser();

  return (
    <div>
      Hello, {user?.id}!.
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
