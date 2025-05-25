import React from "react";
import { ExamType } from "@/types/examTypes";
import { getDifficultyColor } from "@/utils/tests.utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Clock,
  Award,
  BarChart3,
  Lock,
  CreditCard,
  Play,
  Ban,
  AlertTriangle,
} from "lucide-react";

interface ExamCardProps {
  exam: ExamType;
  hasAccess: boolean;
  onStartExam: (examId: string) => void;
  showDetailsButton?: boolean;
  onViewDetails?: (examId: string) => void;
  onPurchaseExam?: (examId: string) => void;
  isProcessing?: boolean;
}

export default function ExamCard({
  exam,
  hasAccess,
  onStartExam,
  showDetailsButton,
  onViewDetails = () => {},
  onPurchaseExam = () => {},
  isProcessing = false,
}: ExamCardProps) {
  // ✅ NEW: Determine if user can start the exam based on both payment and attempt access
  const canStartExam = hasAccess && (exam.hasAttemptAccess ?? true);

  // ✅ NEW: Get attempt information display text
  const getAttemptInfo = () => {
    const attemptCount = exam.attemptCount || 0;
    const maxAttempt = exam.maxAttempt || 1;
    const allowMultiple = exam.allowMultipleAttempts || false;

    if (attemptCount === 0) {
      return allowMultiple ? `0/${maxAttempt} attempts used` : "Not attempted";
    }

    if (allowMultiple) {
      return `${attemptCount}/${maxAttempt} attempts used`;
    }

    return "1/1 attempt used";
  };

  // ✅ NEW: Get the reason why exam can't be accessed
  const getAccessBlockReason = () => {
    if (!hasAccess && exam.isPremium) {
      return "Premium access required";
    }

    if (hasAccess && !(exam.hasAttemptAccess ?? true)) {
      const allowMultiple = exam.allowMultipleAttempts || false;
      if (!allowMultiple) {
        return "You have already attempted this exam";
      } else {
        return `All ${exam.maxAttempt || 1} attempts have been used`;
      }
    }

    return null;
  };

  return (
    <div
      id={exam.id}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="p-4 sm:p-5">
        <div className="h-[210px]">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 line-clamp-1">
                {exam.title}
              </h3>
              {exam.isPremium && !hasAccess && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {exam.isPremium && hasAccess && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  Premium
                </Badge>
              )}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(
                exam.difficulty
              )}`}
            >
              {exam.difficulty}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {exam.description}
          </p>

          <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 mb-4">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{exam.duration} mins</span>
            </div>
            <div className="flex items-center justify-end px-2">
              <Award className="h-3 w-3 mr-1" />
              <span>Total marks: {exam.totalMarks}</span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span>
                Pass marks:{" "}
                {Math.ceil((exam.passPercentage / 100) * exam.totalMarks)}
              </span>
            </div>
            {/* ✅ NEW: Show attempt information */}
            <div className="flex items-center justify-end px-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span className="text-xs">{getAttemptInfo()}</span>
            </div>
          </div>

          {exam.isPremium && !hasAccess && (
            <div className="mb-4 p-2 bg-amber-50 rounded-md text-sm">
              <div className="flex justify-between items-center">
                <div className="font-medium text-amber-800">
                  {exam.discountPrice && exam.discountPrice < exam.price ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg">₹{exam.discountPrice}</span>
                      <span className="line-through text-gray-500 text-xs">
                        ₹{exam.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg">₹{exam.price}</span>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  Access for {exam.accessPeriod || 30} days
                </div>
              </div>
            </div>
          )}

          {exam.isPremium && hasAccess && (
            <div className="mb-4 p-2 bg-green-50 rounded-md text-xs">
              <p className="text-green-700 font-medium">
                You have access to this premium exam
              </p>
            </div>
          )}

          {/* ✅ NEW: Show attempt access status */}
          {hasAccess && !(exam.hasAttemptAccess ?? true) && (
            <div className="mb-4 p-2 bg-red-50 rounded-md text-xs">
              <div className="flex items-center">
                <Ban className="h-3 w-3 mr-1 text-red-600" />
                <p className="text-red-700 font-medium">
                  {getAccessBlockReason()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showDetailsButton && typeof onViewDetails === "function" && (
            <Button
              onClick={() => onViewDetails(exam.id)}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full text-sm font-medium transition-colors"
            >
              View Details
            </Button>
          )}

          {/* ✅ UPDATED: Enhanced button logic with attempt access control */}
          {exam.isPremium && !hasAccess ? (
            <Button
              onClick={() => onPurchaseExam(exam.id)}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-amber-600 hover:bg-amber-700 rounded-full text-sm font-medium transition-colors flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Purchase
            </Button>
          ) : !canStartExam ? (
            <Button
              disabled={true}
              className="flex-1 py-2 px-4 bg-gray-400 cursor-not-allowed rounded-full text-sm font-medium transition-colors flex items-center justify-center"
              title={getAccessBlockReason() || "Cannot start exam"}
            >
              <Ban className="h-4 w-4 mr-1" />
              {!(exam.hasAttemptAccess ?? true)
                ? "No Attempts Left"
                : "Unavailable"}
            </Button>
          ) : (
            <Button
              onClick={() => onStartExam(exam.id)}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-900 rounded-full text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Play className="h-4 w-4 mr-1" />
              Start Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
