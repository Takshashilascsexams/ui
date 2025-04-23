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
    <div className="mb-10 lg:mb-16">
      <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
        {categories.map((category) => {
          return (
            <Button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors shadow-sm ${
                activeCategory === category.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-[1px] border-slate-200"
              }`}
            >
              {category.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
