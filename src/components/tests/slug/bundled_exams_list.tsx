"use client";

import React, { useState } from "react";
import { Layers, Info } from "lucide-react";
import ExamCard from "@/components/tests/exam_card";
import { ExamType } from "@/types/examTypes";
import { navigateToExamRules } from "@/services/tests.services";
import { toast } from "sonner";
import PurchaseModal from "@/components/tests/purchase_modal";

interface BundledExamsListProps {
  bundledExams: ExamType[];
  bundleId: string;
  hasAccess: boolean;
}

export default function BundledExamsList({
  bundledExams,
  // bundleId,
  hasAccess,
}: BundledExamsListProps) {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [processingExamIds, setProcessingExamIds] = useState<string[]>([]);

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

  // View exam details (placeholder function)
  const viewExamDetails = (examId: string) => {
    console.log(`View details for exam ${examId}`);
    // This could open a modal with exam details or navigate to a details page
  };

  // Handle purchase of the bundle
  const handlePurchaseBundle = () => {
    // In a real implementation, you would use the bundleId here
    // Set a selected exam for the purchase modal
    if (bundledExams.length > 0) {
      setSelectedExam(bundledExams[0]);
      setIsPurchaseModalOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Bundle purchased successfully!");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
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

        {!hasAccess && (
          <button
            onClick={handlePurchaseBundle}
            className="text-sm text-indigo-600 font-medium flex items-center"
          >
            <Info className="h-4 w-4 mr-1" />
            Purchase Bundle to Access All Exams
          </button>
        )}
      </div>

      {!hasAccess && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-700 text-sm">
            You need to purchase the bundle to access these exams. Purchasing
            the bundle gives you access to all {bundledExams.length} exams for a
            discounted price.
          </p>
        </div>
      )}

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
              onStartExam={handleStartExam}
              onViewDetails={viewExamDetails}
              isProcessing={processingExamIds.includes(
                exam.id || exam.id || ""
              )}
            />
          );
        })}
      </div>

      {/* Purchase Modal would be for the whole bundle */}
      {selectedExam && (
        <PurchaseModal
          exam={selectedExam}
          isOpen={isPurchaseModalOpen}
          onOpenChange={setIsPurchaseModalOpen}
          onPaymentSuccess={handlePaymentSuccess}
          setProcessingExamIds={setProcessingExamIds}
        />
      )}
    </div>
  );
}
