"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { PanelLeft } from "lucide-react";

export default function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const segment = pathname.split("/").pop();
  const formattedSegment = segment
    ? segment[0].toUpperCase() + segment.slice(1)
    : "";

  return (
    <div className="w-full h-[60px] px-4 lg:px-5 flex items-center justify-start border-b-[1px] border-slate-200">
      <div className="flex items-center justify-center gap-2">
        <Button
          data-sidebar="trigger"
          variant="ghost"
          size="icon"
          onClick={() => toggleSidebar()}
        >
          <PanelLeft />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <p className="text-lg font-medium">{formattedSegment}</p>
      </div>
    </div>
  );
}
