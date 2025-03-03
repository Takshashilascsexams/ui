import { auth, clerkClient } from "@clerk/nextjs/server";
import Header from "@/components/header/header";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  const currentUser = userId
    ? await (await clerkClient()).users.getUser(userId)
    : null;

  return (
    <>
      <Header
        avatar={(currentUser?.imageUrl as string) || "/images/avatar.webp"}
        fullName={(currentUser?.publicMetadata?.fullName as string) || "user"}
      />
      {children}
    </>
  );
}
