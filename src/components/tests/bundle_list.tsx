import React from "react";
import { ExamType } from "@/types/examTypes";
import { Package } from "lucide-react";
import BundleCard from "./bundle_card";

interface BundleProps {
  bundles: ExamType[];
  onOpenBundle: (examId: string) => void;
  onPurchaseExam: (examId: string) => void;
  processingExamIds?: string[];
}

export default function BundleList({
  bundles,
  onOpenBundle,
  onPurchaseExam,
  processingExamIds = [],
}: BundleProps) {
  if (bundles.length === 0) return null;

  return (
    <div className="mb-10 lg:mb-16">
      <h2 className="text-xl font-bold text-gray-800 mb-6 lg:mb-8 flex items-center">
        <Package className="mr-2 h-5 w-5 text-blue-600" />
        Exam Bundles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {bundles.map((bundle) => {
          return (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onOpenBundle={onOpenBundle}
              onPurchaseExam={onPurchaseExam}
              isProcessing={processingExamIds.includes(bundle.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
