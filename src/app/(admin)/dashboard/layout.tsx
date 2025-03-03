import { auth, clerkClient } from "@clerk/nextjs/server";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app_sidebar/app_sidebar";

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
    <SidebarProvider>
      <AppSidebar
        avatar={(currentUser?.imageUrl as string) || "/images/avatar.webp"}
        fullName={(currentUser?.publicMetadata?.fullName as string) || "user"}
      />
      <main className="flex-1 h-screen overflow-hidden">{children}</main>
    </SidebarProvider>
  );
}
