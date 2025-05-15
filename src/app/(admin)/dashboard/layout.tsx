import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app_sidebar/app_sidebar";
import DashboardHeader from "@/components/dashboard_header/dashboard_header";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  return (
    <SidebarProvider>
      <AppSidebar
        avatar={(currentUser?.imageUrl as string) || "/images/avatar.webp"}
        fullName={(currentUser?.publicMetadata?.fullName as string) || "user"}
      />
      <main className="flex-1 overflow-hidden flex flex-col">
        <DashboardHeader />
        {children}
      </main>
    </SidebarProvider>
  );
}
