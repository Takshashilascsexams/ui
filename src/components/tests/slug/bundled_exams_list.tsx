"use client";

import { Layers } from "lucide-react";
import ExamCard from "@/components/tests/exam_card";
import { ExamType } from "@/types/examTypes";
import { navigateToExamRules } from "@/services/tests.services";
import { toast } from "sonner";

interface BundledExamsListProps {
  bundledExams: ExamType[];
  hasAccess: boolean;
}

export default function BundledExamsList({
  bundledExams,
  hasAccess,
}: BundledExamsListProps) {
  // Handle starting an exam
  const handleStartExam = (examId: string) => {
    const exam = bundledExams.find((e) => e.id === examId || e.id === examId);

    if (!exam) {
      toast.error("Exam not found");
      return;
    }

    if (hasAccess) {
      // User has access through bundle
      navigateToExamRules(examId);
    } else {
      // User needs to purchase the bundle
      // Instead of showing purchase modal for individual exam, redirect to bundle purchase
      toast.info("You need to purchase the bundle to access this exam", {
        description:
          "The bundle gives you access to all exams at a discounted price",
        action: {
          label: "Got it",
          onClick: () => {},
        },
      });
    }
  };

  if (!bundledExams || bundledExams.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
        <p className="text-gray-500">No exams found in this bundle</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 lg:mb-8">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Layers className="mr-2 h-5 w-5 text-indigo-500" />
          Exams in this Bundle
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundledExams.map((exam) => {
          return (
            <ExamCard
              key={exam.id}
              exam={{
                ...exam,
                id: exam.id,
                // Set hasAccess based on parent bundle access
                hasAccess: hasAccess,
              }}
              hasAccess={hasAccess}
              showDetailsButton={false}
              onStartExam={handleStartExam}
            />
          );
        })}
      </div>
    </div>
  );
}
