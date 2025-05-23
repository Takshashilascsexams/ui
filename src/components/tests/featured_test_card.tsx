import React from "react";
import { ExamType } from "@/types/examTypes";
import { getDifficultyColor } from "@/utils/tests.utils";
import { Button } from "../ui/button";
import {
  Clock,
  Award,
  BarChart3,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";

interface FeaturedExamProps {
  exam: ExamType;
  hasAccess: boolean;
  onViewDetails?: (examId: string) => void;
  onStartExam: (examId: string) => void;
  onPurchaseExam?: (examId: string) => void;
  isProcessing?: boolean;
}

export default function FeaturedTestCard({
  exam,
  hasAccess,
  onViewDetails,
  onStartExam,
  onPurchaseExam = () => {},
  isProcessing = false,
}: FeaturedExamProps) {
  return (
    <div
      id={exam.id}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden transition-all hover:shadow-md"
    >
      <div className="p-4 sm:p-5">
        {/* Description */}
        <div className="h-[170px] lg:h-[160px]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-blue-800 line-clamp-1">
              {exam.title}
            </h3>
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

          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center mr-3 mb-2 sm:mb-0">
              <Clock className="h-3 w-3 mr-1" />
              <span>{exam.duration} mins</span>
            </div>
            <div className="flex items-center mr-3 mb-2 sm:mb-0">
              <Award className="h-3 w-3 mr-1" />
              <span>{exam.totalMarks} marks</span>
            </div>
            {exam.participants && (
              <div className="flex items-center mb-2 sm:mb-0">
                <BarChart3 className="h-3 w-3 mr-1" />
                <span>{exam.participants}+ attempts</span>
              </div>
            )}
          </div>

          {/* Premium info with pricing for non-accessible exams */}
          {exam.isPremium && !hasAccess && (
            <div className="mb-4 p-2 bg-amber-50 rounded-md text-xs">
              <div className="flex justify-between items-center">
                <div className="font-medium text-amber-800">
                  {exam.discountPrice && exam.discountPrice < exam.price ? (
                    <span className="text-lg">
                      ₹{exam.discountPrice}{" "}
                      <span className="line-through text-gray-500 text-xs">
                        ₹{exam.price}
                      </span>
                    </span>
                  ) : (
                    <span>₹{exam.price}</span>
                  )}
                </div>
                <div className="text-gray-600">
                  {exam.accessPeriod || 30} days access
                </div>
              </div>
            </div>
          )}

          {/* Access granted message for premium exams */}
          {exam.isPremium && hasAccess && (
            <div className="mb-4 p-2 bg-green-50 rounded-md text-xs">
              <p className="text-green-700 font-medium text-start">
                You have access to this exam
              </p>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col items-center jus gap-3">
          {/* View details button */}
          <Button
            onClick={() => onViewDetails && onViewDetails(exam.id)}
            disabled={isProcessing}
            className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-gray-50 text-gray-700 rounded-full text-sm font-medium transition-colors"
          >
            View Details
          </Button>

          {/* Exam access button */}
          {exam.isPremium && !hasAccess ? (
            <Button
              onClick={() => onPurchaseExam(exam.id)}
              disabled={isProcessing}
              className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-medium transition-colors flex items-center justify-center"
            >
              <CreditCard className="ml-1 h-4 w-4 mr-1" />
              Purchase
            </Button>
          ) : (
            <Button
              onClick={() => onStartExam(exam.id)}
              disabled={isProcessing}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors flex items-center justify-center"
            >
              Start Exam
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
