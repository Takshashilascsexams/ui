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
  // ✅ UPDATED: Enhanced handleStartExam with attempt access control
  const handleStartExam = (examId: string) => {
    const exam = bundledExams.find((e) => e.id === examId);

    if (!exam) {
      toast.error("Exam not found");
      return;
    }

    // Check bundle access first
    if (!hasAccess) {
      // User needs to purchase the bundle
      toast.info("You need to purchase the bundle to access this exam", {
        description:
          "The bundle gives you access to all exams at a discounted price",
        action: {
          label: "Got it",
          onClick: () => {},
        },
      });
      return;
    }

    // ✅ NEW: Check attempt access for individual exam within bundle
    if (!(exam.hasAttemptAccess ?? true)) {
      const allowMultiple = exam.allowMultipleAttempts || false;
      const maxAttempt = exam.maxAttempt || 1;
      const attemptCount = exam.attemptCount || 0;

      if (!allowMultiple) {
        toast.error("You have already attempted this exam", {
          description: "This exam allows only one attempt per user.",
          action: {
            label: "Understood",
            onClick: () => {},
          },
        });
      } else {
        toast.error(
          `All attempts have been used (${attemptCount}/${maxAttempt})`,
          {
            description:
              "You have reached the maximum number of attempts for this exam.",
            action: {
              label: "Understood",
              onClick: () => {},
            },
          }
        );
      }
      return;
    }

    // User has both bundle access and attempt access
    navigateToExamRules(examId);
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
        {/* ✅ NEW: Show attempt summary for bundle */}
        <div className="text-sm text-gray-600">
          {bundledExams.length} exam{bundledExams.length !== 1 ? "s" : ""} •{" "}
          {bundledExams.filter((exam) => exam.hasAttemptAccess ?? true).length}{" "}
          available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundledExams.map((exam) => {
          return (
            <ExamCard
              key={exam.id}
              exam={{
                ...exam,
                id: exam.id,
                // ✅ UPDATED: Pass through all attempt-related fields
                hasAccess: hasAccess,
                hasAttemptAccess: exam.hasAttemptAccess ?? true,
                attemptCount: exam.attemptCount ?? 0,
                allowMultipleAttempts: exam.allowMultipleAttempts ?? false,
                maxAttempt: exam.maxAttempt ?? 1,
              }}
              hasAccess={hasAccess}
              showDetailsButton={false}
              onStartExam={handleStartExam}
            />
          );
        })}
      </div>

      {/* ✅ NEW: Show bundle-level attempt summary */}
      {hasAccess && (
        <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Bundle Attempt Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-blue-600 font-medium">Total Exams:</span>
              <span className="text-blue-700">{bundledExams.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-600 font-medium">
                Available to Attempt:
              </span>
              <span className="text-green-700 font-medium">
                {
                  bundledExams.filter((exam) => exam.hasAttemptAccess ?? true)
                    .length
                }
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-600 font-medium">
                Attempts Exhausted:
              </span>
              <span className="text-red-700 font-medium">
                {
                  bundledExams.filter(
                    (exam) => !(exam.hasAttemptAccess ?? true)
                  ).length
                }
              </span>
            </div>
          </div>

          {/* ✅ NEW: Show detailed attempt breakdown */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="text-xs text-blue-600 space-y-1">
              <div>
                <span className="font-medium">Single Attempt Exams:</span>{" "}
                {
                  bundledExams.filter(
                    (exam) => !(exam.allowMultipleAttempts ?? false)
                  ).length
                }
              </div>
              <div>
                <span className="font-medium">Multiple Attempt Exams:</span>{" "}
                {
                  bundledExams.filter(
                    (exam) => exam.allowMultipleAttempts ?? false
                  ).length
                }
              </div>
              <div>
                <span className="font-medium">Total Attempts Used:</span>{" "}
                {bundledExams.reduce(
                  (sum, exam) => sum + (exam.attemptCount ?? 0),
                  0
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
