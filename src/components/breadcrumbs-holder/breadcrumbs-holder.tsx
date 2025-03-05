"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function BreadcrumbsHolder() {
  const pathname = usePathname();
  const segments = pathname.split("/").splice(1);

  return (
    <div className="w-full px-8 lg:px-8 py-5 flex items-center justify-start">
      <div className="flex items-center justify-center gap-1">
        {segments.length > 0 &&
          segments.map((segment, index) => {
            return (
              <div
                key={index}
                className="flex items-center justify-center gap-1 text-gray-500"
              >
                <p className="text-sm">
                  {segment[0].toUpperCase() + segment.slice(1)}
                </p>
                {index < segments.length - 1 && <ChevronRight size={14} />}
              </div>
            );
          })}
      </div>
    </div>
  );
}
