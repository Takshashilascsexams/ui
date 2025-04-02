import React from "react";
import { ExamType } from "@/types/examTypes";
import ExamCard from "./exam_card";

interface ExamListProps {
  exams: ExamType[];
  currentPage: number;
  itemsPerPage: number;
  onStartExam: (examId: string) => void;
  onViewDetails?: (examId: string) => void;
}

export default function ExamList({
  exams,
  currentPage,
  itemsPerPage,
  onStartExam,
  onViewDetails,
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
      {currentExams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          onStartExam={onStartExam}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
