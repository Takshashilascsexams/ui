import React from "react";
import { Book } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  onReset: () => void;
}

export default function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-12 text-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <Book className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">No exams found</h3>
      <p className="text-gray-500 max-w-md mb-6">
        {
          "We couldn't find any exams matching your current filters. Try adjusting your search or browse a different category."
        }
      </p>
      <Button
        onClick={onReset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        View All Exams
      </Button>
    </div>
  );
}
