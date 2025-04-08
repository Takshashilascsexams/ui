// src/components/tests/exam_list.tsx
import React from "react";
import { ExamType } from "@/types/examTypes";
import ExamCard from "./exam_card";

interface ExamListProps {
  exams: ExamType[];
  examAccess: Record<string, boolean>;
  isLoadingAccess: boolean;
  currentPage: number;
  itemsPerPage: number;
  onStartExam: (examId: string) => void;
  onViewDetails?: (examId: string) => void;
  onPurchaseExam?: (examId: string) => void;
}

export default function ExamList({
  exams,
  examAccess,
  isLoadingAccess,
  currentPage,
  itemsPerPage,
  onStartExam,
  onViewDetails = () => {},
  onPurchaseExam = () => {},
}: ExamListProps) {
  // Get current page items
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return exams.slice(startIndex, endIndex);
  };

  const currentExams = getCurrentItems();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {currentExams.map((exam) =>
        isLoadingAccess && exam.isPremium ? (
          <div
            key={exam.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5"
          >
            <div className="animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="w-2/3 h-6 bg-gray-200 rounded"></div>
                <div className="w-1/5 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="w-full h-12 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          </div>
        ) : (
          <ExamCard
            key={exam.id}
            exam={exam}
            hasAccess={exam.isPremium ? !!examAccess[exam.id] : true}
            onStartExam={onStartExam}
            onViewDetails={onViewDetails}
            onPurchaseExam={onPurchaseExam}
          />
        )
      )}
    </div>
  );
}
