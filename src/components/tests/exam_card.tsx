import React from "react";
import { Clock, Award, BarChart3, Calendar } from "lucide-react";
import { ExamType } from "@/types/examTypes";
import { getDifficultyColor, formatDate } from "@/utils/tests.utils";
import { Button } from "../ui/button";

interface ExamCardProps {
  exam: ExamType;
  onStartExam: (examId: string) => void;
  onViewDetails?: (examId: string) => void;
}

export default function ExamCard({
  exam,
  onStartExam,
  onViewDetails = () => {},
}: ExamCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-gray-900 line-clamp-1">{exam.title}</h3>
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

        <div className="flex items-center gap-3">
          <Button
            onClick={() => onViewDetails(exam.id)}
            className="flex-1 py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            View Details
          </Button>
          <Button
            onClick={() => onStartExam(exam.id)}
            className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-900 rounded-lg text-sm font-medium transition-colors"
          >
            Start Exam
          </Button>
        </div>
      </div>
    </div>
  );
}
