import { useState, useEffect } from "react";
import { Question } from "@/context/exam.context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuestionDisplayProps {
  question: Question;
  onAnswerChange: (questionId: string, selectedOption: string | null) => void;
  disabled?: boolean;
}

export default function QuestionDisplay({
  question,
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500">
            {question.type === "MCQ"
              ? "Multiple Choice Question"
              : "Statement Based Question"}
          </div>
          <div className="text-sm font-medium text-gray-500">
            {question.marks} mark{question.marks > 1 ? "s" : ""}
          </div>
        </div>

        <h2 className="mt-2 text-lg font-medium text-gray-900">
          {question.questionText}
        </h2>
      </div>

      {/* Display statements for statement-based questions */}
      {question.type === "STATEMENT_BASED" &&
        question.statements &&
        question.statements.length > 0 && (
          <div className="mb-6 space-y-3">
            {question.statements.map((statement, index) => (
              <div key={index} className="flex gap-2 bg-gray-50 p-3 rounded-md">
                <div className="font-medium">{statement.statementNumber}.</div>
                <div>{statement.statementText}</div>
              </div>
            ))}

            {question.statementInstruction && (
              <div className="mt-4 font-medium text-gray-700">
                {question.statementInstruction}
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
            className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 p-3 rounded-md cursor-pointer"
          >
            <RadioGroupItem
              value={option._id}
              id={option._id}
              disabled={disabled}
              className="cursor-pointer"
            />
            <Label
              htmlFor={option._id}
              className="flex gap-2 cursor-pointer w-full"
            >
              <span className="font-medium">
                {String.fromCharCode(65 + index)}.
              </span>
              <span>{option.optionText}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
