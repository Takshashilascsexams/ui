"use client";

import { useEffect, useState } from "react";

export default function LoadingSkeleton() {
  const [skeletonCount, setSkeletonCount] = useState(4);

  useEffect(() => {
    // Only update the count after the component has mounted
    const width = window.innerWidth;
    if (width < 640) {
      setSkeletonCount(2); // Mobile
    } else if (width < 1024) {
      setSkeletonCount(4); // Tablet
    } else {
      setSkeletonCount(6); // Desktop
    }

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSkeletonCount(2); // Mobile
      } else if (width < 1024) {
        setSkeletonCount(4); // Tablet
      } else {
        setSkeletonCount(6); // Desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(skeletonCount)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
    </div>
  );
}
