"use client";

import React from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import CustomImage from "../custom_image/custom_image";
import { UserRound, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderPropType = {
  avatar: string;
  fullName: string;
};

type DropDownMenuPropType = {
  children: React.ReactNode;
};

function ProfileDropdownMenu({ children }: DropDownMenuPropType) {
  const { signOut } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header({ avatar, fullName }: HeaderPropType) {
  const username = fullName.split(" ")[0].slice(0, 10);

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1 flex items-center justify-between">
        <Link
          href={"/"}
          className="w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] relative"
        >
          <CustomImage
            src={"/images/logo.webp"}
            alt="logo"
            sizes="(max-width: 768px) 100px, (min-width: 769px) 120px"
          />
        </Link>

        <div className="flex items-center justify-center gap-5">
          <p className="text-sm">Hello, {username}</p>

          <div className="flex items-center justify-center">
            <ProfileDropdownMenu>
              <button className="border-[1px] border-slate-300 rounded-full">
                <Avatar className="w-[30px] h-[30px]">
                  <AvatarImage src={avatar} alt="avatar" />
                  <AvatarFallback>
                    {fullName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </ProfileDropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
