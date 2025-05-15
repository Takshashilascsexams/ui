"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpenCheck, SquareLibrary, UsersRound } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Exams",
    url: "/dashboard/exams",
    icon: BookOpenCheck,
  },
  {
    title: "Questions",
    url: "/dashboard/questions",
    icon: SquareLibrary,
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: UsersRound,
  },
];

export default function AppSidebarContent() {
  const pathname = usePathname();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              // Determine if this item is active
              const isActive =
                (item.url === "/dashboard" && pathname === "/dashboard") ||
                (item.url !== "/dashboard" && pathname.includes(item.url));

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`py-3 ${
                      isActive
                        ? "bg-blue-50 text-indigo-600"
                        : "bg-transparent text-gray-700"
                    }`}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-4"
                    >
                      <item.icon
                        className={`h-5 w-5 ${
                          isActive ? "text-indigo-600" : "text-gray-500"
                        }`}
                      />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
