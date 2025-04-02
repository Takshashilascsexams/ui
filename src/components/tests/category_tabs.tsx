import React from "react";
import { CategoryType } from "@/types/examTypes";
import { Button } from "../ui/button";

interface CategoryTabsProps {
  categories: CategoryType[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
