"use client";

import React from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import CustomImage from "../custom_image/custom_image";
import { UserRound, LogOut } from "lucide-react";
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

          {/* <DropdownMenuItem className="cursor-pointer">
            <Settings />
            Settings
          </DropdownMenuItem> */}
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
  // Handle the username with multiple approaches for better display
  const getDisplayName = () => {
    // Handle empty or undefined name
    if (!fullName || fullName.trim() === "") {
      return "User";
    }

    // Get first name
    const firstName = fullName.split(" ")[0];

    // For very long first names (over 15 chars), use initials instead
    if (firstName.length > 15) {
      // Create initials from the full name
      const initials = fullName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

      return initials;
    }

    // For moderately long names (10-15 chars), truncate with ellipsis
    if (firstName.length > 10) {
      return `${firstName.slice(0, 10)}...`;
    }

    // For normal length names, just use the first name
    return firstName;
  };

  const displayName = getDisplayName();

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
          <p className="text-sm" title={fullName}>
            Hello, {displayName}
          </p>

          <div className="flex items-center justify-center">
            <ProfileDropdownMenu>
              <button className="border-[1px] border-slate-300 rounded-full">
                <Avatar className="w-[30px] h-[30px]">
                  <AvatarImage src={avatar} alt="avatar" />
                  <AvatarFallback>
                    {fullName && fullName.trim() !== ""
                      ? fullName.charAt(0).toUpperCase()
                      : "U"}
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
