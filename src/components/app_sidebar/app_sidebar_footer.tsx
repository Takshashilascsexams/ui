"use client";

import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import {
  UserRound,
  CircleUserRound,
  LogOut,
  Settings,
  ChevronUp,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";

type AppSidebarFooterPropType = {
  avatar: string;
  fullName: string;
};

export function AppSidebarFooter({ fullName }: AppSidebarFooterPropType) {
  const { signOut } = useClerk();
  const username = fullName.split(" ")[0].slice(0, 10);

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <CircleUserRound />
                {username}
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={"/profile"}>
                    <UserRound /> Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer">
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOut({ redirectUrl: "/sign-in" })}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>

        {/* <DropdownMenuSeparator className="bg-slate-200" />

        <SidebarMenuItem className="flex items-center justify-end">
          <SidebarTrigger />
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarFooter>
  );
}
