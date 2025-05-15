"use client";

import { useRouter } from "next/navigation";
import CustomImage from "../custom_image/custom_image";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

export default function AppSidebarHeader() {
  const router = useRouter();

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="py-2 flex items-center justify-between">
          <SidebarMenuButton
            className="w-[90px] h-[60px] relative flex items-center justify-start"
            onClick={() => router.push("/")}
          >
            <CustomImage
              src={"/images/logo.webp"}
              alt="logo"
              sizes="(max-width: 768px) 60px, (min-width: 769px) 60px"
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
