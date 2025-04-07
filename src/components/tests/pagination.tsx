import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [isMounted] = React.useState(false);

  // For a responsive design, we'll show fewer page numbers on small screens
  const getPageNumbers = () => {
    // Before mount, use a consistent simplified version for SSR
    if (!isMounted) {
      // Simple pagination for SSR to ensure consistency
      if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
        return [1, 2, 3, "...", totalPages];
      }
    }

    // After mount, we can use window to determine responsive behavior
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 768;

    // On mobile, show fewer numbers
    if (isMobile && totalPages > 3) {
      // Always show current page and one page before/after when possible
      if (currentPage === 1) {
        return [1, 2, "...", totalPages];
      } else if (currentPage === totalPages) {
        return [1, "...", totalPages - 1, totalPages];
      } else {
        return [1, currentPage, totalPages];
      }
    }

    // On tablet, show a moderate amount
    if (isTablet && totalPages > 5) {
      if (currentPage <= 2) {
        return [1, 2, 3, "...", totalPages];
      } else if (currentPage >= totalPages - 1) {
        return [1, "...", totalPages - 2, totalPages - 1, totalPages];
      } else {
        return [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return [];
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-sm text-gray-500"
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => typeof page === "number" && onPageChange(page)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
