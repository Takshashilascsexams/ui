import { Question } from "@/context/exam.context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter(
    (q) => q.selectedOption !== null
  ).length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Progress</h3>
          <span className="text-sm text-gray-500">
            {answeredQuestions} of {totalQuestions} answered
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {allowNavigation && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Questions</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((question, index) => (
              <Button
                key={question.id}
                variant="outline"
                size="sm"
                className={`p-0 h-8 w-8 ${
                  index === currentIndex
                    ? "border-blue-600 bg-blue-50"
                    : question.selectedOption
                    ? "border-green-600 bg-green-50"
                    : ""
                }`}
                onClick={() => onNavigate(index)}
                disabled={disabled || !allowNavigation}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentIndex === 0 || disabled || !allowNavigation}
          className="flex items-center"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        <div className="text-sm font-medium">
          Question {currentIndex + 1} of {totalQuestions}
        </div>

        <Button
          variant="outline"
          onClick={onNext}
          disabled={currentIndex === totalQuestions - 1 || disabled}
          className="flex items-center"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
