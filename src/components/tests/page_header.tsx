import React from "react";
import SearchBar from "./search_bar_component";

interface PageHeaderProps {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onFilterToggle?: () => void;
}

export default function PageHeader({
  searchQuery,
  onSearch,
  onClearSearch,
  onFilterToggle,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Exam Catalogue
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Browse and take exams to enhance your preparation
        </p>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearch={onSearch}
        onClear={onClearSearch}
        onFilterToggle={onFilterToggle}
      />
    </div>
  );
}
