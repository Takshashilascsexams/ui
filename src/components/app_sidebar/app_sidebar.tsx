import AppSidebarHeader from "./app_sidebar_header";
import AppSidebarContent from "./app_sidebar_content";
import { AppSidebarFooter } from "./app_sidebar_footer";
import { Sidebar, SidebarSeparator } from "@/components/ui/sidebar";

type AppSidebarPropType = {
  avatar: string;
  fullName: string;
};

export default function AppSidebar(props: AppSidebarPropType) {
  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <AppSidebarContent />
      <SidebarSeparator className="bg-slate-200" />
      <AppSidebarFooter {...props} />
    </Sidebar>
  );
}
