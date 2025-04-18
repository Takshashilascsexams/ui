import React from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "../ui/input";

interface SearchBarProps {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onFilterToggle?: () => void;
  showFilter?: boolean;
}

export default function SearchBar({
  searchQuery,
  onSearch,
  onClear,
  onFilterToggle,
  showFilter = true,
}: SearchBarProps) {
  return (
    <div className="relative w-full md:w-auto">
      <div className="flex items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            size={30}
            type="text"
            placeholder="Search exams..."
            className="pl-10 pr-8 py-2 w-full rounded-full"
            value={searchQuery}
            onChange={onSearch}
            aria-label="Search exams"
          />
          {searchQuery && (
            <button
              onClick={onClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {showFilter && onFilterToggle && (
          <button
            className="ml-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onFilterToggle}
            aria-label="Show filters"
          >
            <Filter className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
