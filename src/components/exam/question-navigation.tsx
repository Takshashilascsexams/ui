import { useState } from "react";
import { Question } from "@/context/exam.context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionNavigationProps {
  questions: Question[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onNavigate: (index: number) => void;
  allowNavigation: boolean;
  disabled?: boolean;
}

export default function QuestionNavigation({
  questions,
  currentIndex,
  onNext,
  onPrevious,
  onNavigate,
  allowNavigation,
  disabled = false,
}: QuestionNavigationProps) {
  // NEW CODE: State for search and filter functionality only
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "attempted" | "unattempted"
  >("all");

  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(
    (q) => q.selectedOption !== null
  ).length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  // NEW CODE: Calculate navigation states
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // NEW CODE: Determine if we should use scrollable layout for large question sets
  const shouldUseScrollableLayout = totalQuestions > 50;

  // NEW CODE: Filter questions based on search and status
  const getFilteredQuestions = () => {
    let filtered = questions.map((q, index) => ({
      ...q,
      originalIndex: index,
    }));

    // Filter by status
    if (filterStatus === "attempted") {
      filtered = filtered.filter((q) => q.selectedOption !== null);
    } else if (filterStatus === "unattempted") {
      filtered = filtered.filter((q) => q.selectedOption === null);
    }

    // Filter by search query
    if (searchQuery) {
      const query = parseInt(searchQuery);
      if (!isNaN(query)) {
        filtered = filtered.filter((q) => q.originalIndex + 1 === query);
      }
    }

    return filtered;
  };

  // NEW CODE: Jump to specific question
  const handleJumpToQuestion = (questionNumber: string) => {
    const num = parseInt(questionNumber);
    if (num >= 1 && num <= totalQuestions) {
      onNavigate(num - 1);
    }
  };

  const displayQuestions = getFilteredQuestions();

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4 space-y-6">
      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Progress</h3>
          <span className="text-sm text-gray-500">
            {answeredQuestions} of {totalQuestions} answered
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* NEW CODE: Instructions Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Instructions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-600 bg-green-50 rounded"></div>
            <span className="text-gray-600">Attempted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 bg-blue-50 rounded"></div>
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
            <span className="text-gray-600">Unattempted</span>
          </div>
        </div>
      </div>

      {/* NEW CODE: Search and Filter Controls */}
      {allowNavigation && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Jump to question number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleJumpToQuestion(searchQuery);
                      setSearchQuery("");
                    }
                  }}
                  className="pl-10 h-8 text-sm"
                />
              </div>
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value: "all" | "attempted" | "unattempted") =>
                setFilterStatus(value)
              }
            >
              <SelectTrigger className="w-full sm:w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="attempted">Attempted</SelectItem>
                <SelectItem value="unattempted">Unattempted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Question Grid Section */}
      {allowNavigation && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Questions</h3>

          {/* NEW CODE: Scrollable container for large question sets */}
          <div
            className={`${
              shouldUseScrollableLayout
                ? "max-h-64 overflow-y-auto border border-gray-100 rounded-lg p-3"
                : ""
            }`}
          >
            <div
              className={`grid gap-2 ${
                shouldUseScrollableLayout
                  ? "grid-cols-4 sm:grid-cols-6 lg:grid-cols-8"
                  : "grid-cols-5 sm:grid-cols-8 lg:grid-cols-10"
              }`}
            >
              {displayQuestions.map((question, index) => {
                const questionIndex =
                  "originalIndex" in question ? question.originalIndex : index;
                return (
                  <Button
                    key={question.id}
                    variant="outline"
                    size="sm"
                    className={`p-0 h-8 w-8 text-xs font-medium transition-all duration-200 ${
                      questionIndex === currentIndex
                        ? "border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : question.selectedOption
                        ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                        : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => onNavigate(questionIndex)}
                    disabled={disabled || !allowNavigation}
                    title={`Question ${questionIndex + 1}${
                      question.selectedOption ? " (Answered)" : " (Unanswered)"
                    }`}
                  >
                    {questionIndex + 1}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* NEW CODE: Show filter results info */}
          {(filterStatus !== "all" || searchQuery) && (
            <div className="text-xs text-gray-500 text-center">
              {displayQuestions.length === 0 ? (
                <span className="text-amber-600">
                  No questions match your filter
                </span>
              ) : (
                <span>
                  Showing {displayQuestions.length} of {totalQuestions}{" "}
                  questions
                  {filterStatus !== "all" && ` (${filterStatus})`}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Current Question Display with larger font */}
      <div className="text-center py-2 border-t border-gray-200">
        <div className="text-lg font-semibold text-gray-800">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstQuestion || disabled || !allowNavigation}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Button
          variant="outline"
          onClick={onNext}
          disabled={isLastQuestion || disabled}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Instructions */}
      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <div>• Previous button disabled on first question</div>
          <div>• Next button disabled on last question</div>
        </div>
        {shouldUseScrollableLayout && (
          <div className="text-blue-600 font-medium">
            • Use search to jump to specific questions • Scroll to view all
            questions
          </div>
        )}
        {!allowNavigation && (
          <div className="text-amber-600 font-medium">
            • Question navigation is disabled for this exam
          </div>
        )}
      </div>
    </div>
  );
}
