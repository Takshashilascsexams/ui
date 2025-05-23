"use client";

import React from "react";
import { ExamType } from "@/types/examTypes";
import { getDifficultyColor } from "@/utils/tests.utils";
import { navigateToExamRules } from "@/services/tests.services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  Award,
  CheckCircle,
  Calendar,
  Play,
  CreditCard,
  User,
  TimerIcon,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface ExamDetailsDialogProps {
  exam: ExamType | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseExam?: (examId: string) => void;
  isProcessing?: boolean;
}

export default function ExamDetailsDialog({
  exam,
  isOpen,
  onOpenChange,
  onPurchaseExam,
  isProcessing = false,
}: ExamDetailsDialogProps) {
  if (!exam) return null;

  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}hrs ` : ""}${mins > 0 ? `${mins}mins` : ""}`;
  };

  // Format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  //Calculate pass mark
  const calculatePassMark = (totalMarks: number, passPercentage: number) => {
    return (passPercentage / 100) * totalMarks;
  };

  // Handle start exam action
  const handleStartExam = () => {
    onOpenChange(false);
    navigateToExamRules(exam.id);
  };

  // Handle purchase exam action
  const handlePurchaseExam = () => {
    if (onPurchaseExam) {
      onPurchaseExam(exam.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] md:w-[85%] lg:w-3/4 xl:w-2/3 max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-bold">
              {exam.title}
            </DialogTitle>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(
                exam.difficulty
              )}`}
            >
              {exam.difficulty}
            </span>
          </div>
          <DialogDescription className="text-base text-start">
            {exam.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Key Information Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Clock className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-xs text-gray-500">Duration</span>
              <span className="font-medium">
                {formatDuration(exam.duration)}
              </span>
            </div>

            <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Award className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-xs text-gray-500">Total Marks</span>
              <span className="font-medium">{exam.totalMarks}</span>
            </div>

            <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <CheckCircle className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-xs text-gray-500">Pass Mark</span>
              <span className="font-medium">
                {calculatePassMark(exam.totalMarks, exam.passPercentage)}{" "}
              </span>
            </div>

            <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Calendar className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-xs text-gray-500">Added On</span>
              <span className="font-medium text-xs">
                {formatDate(exam.date)}
              </span>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Exam Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-gray-500 min-w-[80px]">Category:</span>
                  <span className="font-medium">
                    {exam.category.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-gray-500 min-w-[80px]">Type:</span>
                  <span className="font-medium">
                    {exam.isPremium ? "Premium" : "Free"}
                  </span>
                </div>
                {exam.isPremium && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-gray-500 min-w-[120px]">
                        Access Period:
                      </span>
                      <span className="font-medium">
                        {exam.accessPeriod || 30} days
                      </span>
                    </div>
                    {exam.participants && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span className="text-gray-500 min-w-[80px]">
                          Attempts:
                        </span>
                        <span className="font-medium">
                          {exam.participants}+ students
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Preparation Tips */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-700">
                <TimerIcon className="h-4 w-4" />
                Preparation Tips
              </h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                <li>
                  Allocate {formatDuration(exam.duration)} to complete this test
                </li>
                <li>
                  You need to score at least {exam.passPercentage}% or{" "}
                  {calculatePassMark(exam.totalMarks, exam.passPercentage)}{" "}
                  marks to pass
                </li>
                <li>Review the subject material before attempting the test</li>
              </ul>
            </div>

            {/* Premium Exam Info */}
            {exam.isPremium && !exam.hasAccess && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Premium Exam Access
                </h3>
                <p className="text-xs text-amber-700 mb-3">
                  This is a premium exam that requires purchase to access. Your
                  access will be valid for {exam.accessPeriod || 30} days after
                  purchase.
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Price:</p>
                    {exam.discountPrice && exam.discountPrice < exam.price ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-amber-700">
                          ₹{exam.discountPrice}
                        </span>
                        <span className="line-through text-gray-500 text-xs">
                          ₹{exam.price}
                        </span>
                        <Badge className="bg-green-100 text-green-800 border-0">
                          {Math.round(
                            100 - (exam.discountPrice / exam.price) * 100
                          )}
                          % OFF
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-amber-700">
                        ₹{exam.price}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <User className="h-3 w-3 mr-1" />
                    {exam.participants ? exam.participants : "10"}+ students
                    enrolled
                  </div>
                </div>
              </div>
            )}

            {/* Access Granted Info */}
            {exam.isPremium && exam.hasAccess && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-sm font-medium flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  You have access to this premium exam
                </h3>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-4">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          {exam.isPremium && !exam.hasAccess ? (
            <Button
              onClick={handlePurchaseExam}
              disabled={isProcessing}
              className="bg-amber-600 hover:bg-amber-700 rounded-full"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Purchase (
              {exam.discountPrice ? `₹${exam.discountPrice}` : `₹${exam.price}`}
              )
            </Button>
          ) : (
            <Button
              onClick={handleStartExam}
              disabled={isProcessing}
              className="bg-gray-800 hover:bg-gray-900 rounded-full"
            >
              <Play className="h-4 w-4 mr-1" />
              Start Exam Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
