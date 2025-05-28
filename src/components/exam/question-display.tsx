import { useState, useEffect } from "react";
import { Question } from "@/context/exam.context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  onAnswerChange: (questionId: string, selectedOption: string | null) => void;
  disabled?: boolean;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  onAnswerChange,
  disabled = false,
}: QuestionDisplayProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    question.selectedOption
  );

  // Update local state when question changes
  useEffect(() => {
    setSelectedOptionId(question.selectedOption);
  }, [question]);

  const handleOptionChange = (optionId: string) => {
    if (disabled) return;

    setSelectedOptionId(optionId);
    onAnswerChange(question.id, optionId);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-4 sm:mb-6">
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
          Question {questionNumber}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <div className="text-xs sm:text-sm font-medium text-gray-500">
            {question.type === "MCQ"
              ? "Multiple Choice Question"
              : "Statement Based Question"}
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-500">
            {question.marks} mark{question.marks > 1 ? "s" : ""}
          </div>
        </div>

        {/* NEW CODE: Improved alignment for question text */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
            {question.questionText}
          </h2>
        </div>
      </div>

      {/* Display statements for statement-based questions */}
      {question.type === "STATEMENT_BASED" &&
        question.statements &&
        question.statements.length > 0 && (
          <div className="mb-6 space-y-3">
            {question.statements.map((statement, index) => (
              <div key={index} className="flex gap-3 bg-gray-50 p-4 rounded-md">
                {/* NEW CODE: Better alignment for statement numbers */}
                <div className="font-medium text-gray-700 min-w-[24px]">
                  {statement.statementNumber}.
                </div>
                <div className="flex-1 text-gray-800">
                  {statement.statementText}
                </div>
              </div>
            ))}

            {question.statementInstruction && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="font-medium text-blue-800">
                  {question.statementInstruction}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Display options */}
      <RadioGroup
        value={selectedOptionId || ""}
        onValueChange={handleOptionChange}
        className="space-y-3"
        disabled={disabled}
      >
        {question.options.map((option, index) => (
          <div
            key={option._id}
            className="flex items-start space-x-3 bg-gray-50 hover:bg-gray-100 p-4 rounded-md cursor-pointer transition-colors"
          >
            <RadioGroupItem
              value={option._id}
              id={option._id}
              disabled={disabled}
              className="cursor-pointer mt-0.5"
            />
            <Label
              htmlFor={option._id}
              className="flex gap-3 cursor-pointer w-full leading-relaxed"
            >
              {/* NEW CODE: Better alignment for option letters */}
              <span className="font-medium text-gray-700 min-w-[24px]">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="flex-1 text-gray-800">{option.optionText}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
