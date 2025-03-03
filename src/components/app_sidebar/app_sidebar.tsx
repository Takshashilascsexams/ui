import { AppSidebarFooter } from "./app_sidebar_footer";
import CustomImage from "../customImage/customImage";
import { Home, BookOpenCheck, SquareLibrary, UsersRound } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

type AppSidebarPropType = {
  avatar: string;
  fullName: string;
};

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Tests",
    url: "/tests",
    icon: BookOpenCheck,
  },
  {
    title: "Questions",
    url: "/questions",
    icon: SquareLibrary,
  },
  {
    title: "Students",
    url: "/students",
    icon: UsersRound,
  },
];

function AppSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="py-4">
          <SidebarMenuButton className="w-[70px] h-[70px] relative">
            <CustomImage
              src={"/images/logo.webp"}
              alt="logo"
              sizes="(max-width: 768px) 70px, (min-width: 769px) 70px"
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function AppSidebarContent() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="py-1">
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

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
