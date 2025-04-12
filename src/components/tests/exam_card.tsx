import React from "react";
import { ExamType } from "@/types/examTypes";
import { getDifficultyColor, formatDate } from "@/utils/tests.utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Clock,
  Award,
  BarChart3,
  Calendar,
  Lock,
  CreditCard,
  Play,
} from "lucide-react";

interface ExamCardProps {
  exam: ExamType;
  hasAccess: boolean; // Flag to indicate if user has access
  onStartExam: (examId: string) => void;
  onViewDetails?: (examId: string) => void;
  onPurchaseExam?: (examId: string) => void;
}

export default function ExamCard({
  exam,
  hasAccess,
  onStartExam,
  onViewDetails = () => {},
  onPurchaseExam = () => {},
}: ExamCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
      <div className="p-4 sm:p-5">
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
          <div className="flex items-center">
            <Award className="h-3 w-3 mr-1" />
            <span>{exam.totalMarks} marks</span>
          </div>
          <div className="flex items-center">
            <BarChart3 className="h-3 w-3 mr-1" />
            <span>Pass: {exam.passPercentage}%</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Available until: {formatDate(exam.date)}</span>
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
          <div className="mb-4 p-2 bg-green-50 rounded-md text-sm">
            <p className="text-green-700 font-medium">
              You have access to this premium exam
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={() => onViewDetails(exam.id)}
            className="flex-1 py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            View Details
          </Button>

          {exam.isPremium && !hasAccess ? (
            <Button
              onClick={() => onPurchaseExam(exam.id)}
              className="flex-1 py-2 px-4 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Purchase
            </Button>
          ) : (
            <Button
              onClick={() => onStartExam(exam.id)}
              className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-900 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
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
