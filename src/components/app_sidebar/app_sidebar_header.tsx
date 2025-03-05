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
        <SidebarMenuItem className="py-4 flex items-center justify-between">
          <SidebarMenuButton
            className="w-[70px] h-[70px] relative"
            onClick={() => router.push("/")}
          >
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
