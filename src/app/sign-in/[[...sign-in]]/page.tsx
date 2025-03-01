import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full h-screen pt-20 flex items-start justify-center">
      <SignIn />
    </div>
  );
}
