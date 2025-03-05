import Header from "@/components/header/header";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

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
