"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import examService from "@/services/exam.services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import {
  CheckCircle,
  XCircle,
  Clock,
  BarChart2,
  ArrowLeft,
  FileText,
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatTimeDuration } from "@/lib/formatTimeDuration";

interface ExamResultSummary {
  totalMarks: number;
  negativeMarks: number;
  finalScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  hasPassed: boolean;
  scorePercentage: number;
  startTime: string;
  endTime: string;
  timeTaken: number;
  rank?: number;
  percentile?: number;
}

interface ExamDetails {
  title: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
  passMarkPercentage: number;
  hasNegativeMarking: boolean;
  negativeMarkingValue: number;
}

interface QuestionAnswer {
  questionId: string;
  questionText: string;
  type: string;
  selectedOption: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  marksEarned: number;
  negativeMarks: number;
  options: {
    _id: string;
    optionText: string;
  }[];
  explanation: string;
  statements?: {
    statementNumber: number;
    statementText: string;
  }[];
  statementInstruction?: string;
}

interface ExamResult {
  attempt: {
    id: string;
    status: string;
  };
  exam: ExamDetails;
  summary: ExamResultSummary;
  detailedAnswers: QuestionAnswer[];
}

export default function ExamResultPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const router = useRouter();
  const { attemptId } = params;

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswerExplanations, setShowAnswerExplanations] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await examService.getAttemptResult(attemptId);

        // Transform API response to our format
        const { attempt, exam, summary, detailedAnswers } = response.data;

        setResult({
          attempt,
          exam,
          summary,
          detailedAnswers,
        });
      } catch (err) {
        console.error("Error fetching result:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch exam result"
        );
        toast.error("Failed to load exam result");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading exam results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Failed to load exam result. Please try again later."}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/tests")}>Back to Tests</Button>
        </div>
      </div>
    );
  }

  const { exam, summary, detailedAnswers } = result;

  // Calculate grades and messages
  const getGradeColor = () => {
    if (summary.hasPassed) {
      if (summary.scorePercentage >= 80) return "text-green-600";
      if (summary.scorePercentage >= 60) return "text-blue-600";
      return "text-amber-600";
    }
    return "text-red-600";
  };

  const getGradeMessage = () => {
    if (summary.hasPassed) {
      if (summary.scorePercentage >= 80)
        return "Excellent! You've mastered this subject.";
      if (summary.scorePercentage >= 60)
        return "Good job! You have a solid understanding of the material.";
      return "You've passed, but there's room for improvement.";
    }
    return "You didn't pass this time. Review the material and try again.";
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="mb-8 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-2xl">{exam.title} - Results</CardTitle>
          </div>
          <CardDescription className="text-base">
            {exam.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Score Summary */}
          <div className="text-center mb-8">
            <h2 className={`text-4xl font-bold ${getGradeColor()}`}>
              {Math.round(summary.scorePercentage)}%
            </h2>
            <p className="text-xl mt-2">
              {summary.hasPassed ? (
                <span className="flex items-center justify-center gap-1 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Passed
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Failed
                </span>
              )}
            </p>
            <p className="mt-2 text-gray-600">{getGradeMessage()}</p>

            <div className="mt-6">
              <div className="flex items-center justify-center gap-1 text-sm text-gray-700 mb-2">
                <span>Score:</span>
                <span className="font-medium">
                  {summary.finalScore} / {exam.totalMarks}
                </span>
              </div>
              <Progress
                value={summary.scorePercentage}
                className="h-2 w-full max-w-md mx-auto"
              />
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col items-center">
              <div className="flex items-center text-green-600 mb-2">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="font-medium">Correct</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {summary.correctAnswers}
              </p>
              <p className="text-sm text-gray-600">questions</p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col items-center">
              <div className="flex items-center text-red-600 mb-2">
                <XCircle className="h-5 w-5 mr-1" />
                <span className="font-medium">Incorrect</span>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {summary.wrongAnswers}
              </p>
              <p className="text-sm text-gray-600">questions</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex flex-col items-center">
              <div className="flex items-center text-gray-600 mb-2">
                <Clock className="h-5 w-5 mr-1" />
                <span className="font-medium">Time Taken</span>
              </div>
              <p className="text-2xl font-bold text-gray-700">
                {formatTimeDuration(summary.timeTaken)}
              </p>
              <p className="text-sm text-gray-600">hh:mm:ss</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Unattempted</p>
              <p className="text-lg font-medium">{summary.unattempted}</p>
            </div>

            {summary.negativeMarks > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Negative Marks</p>
                <p className="text-lg font-medium">-{summary.negativeMarks}</p>
              </div>
            )}

            {summary.rank && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Rank</p>
                <p className="text-lg font-medium">{summary.rank}</p>
              </div>
            )}

            {summary.percentile !== undefined && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Percentile</p>
                <p className="text-lg font-medium">
                  {summary.percentile.toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Detailed Answer Review */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Question Analysis</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setShowAnswerExplanations(!showAnswerExplanations)
                }
              >
                {showAnswerExplanations ? "Hide" : "Show"} Explanations
              </Button>
            </div>

            <div className="space-y-6">
              {detailedAnswers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className={`p-4 rounded-lg border ${
                    answer.isCorrect
                      ? "bg-green-50 border-green-200"
                      : answer.selectedOption === null
                      ? "bg-gray-50 border-gray-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <span className="font-medium">Q{index + 1}.</span>
                      <span>{answer.questionText}</span>
                    </div>
                    <div className="flex items-center">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : answer.selectedOption === null ? (
                        <span className="text-gray-600 text-sm">
                          Not attempted
                        </span>
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* Statements for statement-based questions */}
                  {answer.statements && answer.statements.length > 0 && (
                    <div className="mt-2 mb-3 space-y-2">
                      {answer.statements.map((statement) => (
                        <div
                          key={statement.statementNumber}
                          className="flex gap-2"
                        >
                          <span className="font-medium">
                            {statement.statementNumber}.
                          </span>
                          <span>{statement.statementText}</span>
                        </div>
                      ))}
                      {answer.statementInstruction && (
                        <div className="mt-1 font-medium text-gray-700">
                          {answer.statementInstruction}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {answer.options.map((option, optIndex) => {
                      const isSelected = option._id === answer.selectedOption;
                      const isCorrect = option._id === answer.correctOptionId;

                      return (
                        <div
                          key={option._id}
                          className={`p-2 rounded ${
                            isCorrect
                              ? "bg-green-100 border border-green-200"
                              : isSelected && !isCorrect
                              ? "bg-red-100 border border-red-200"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className="flex-1">{option.optionText}</span>
                            {isSelected && !isCorrect && (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            )}
                            {isCorrect && (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {showAnswerExplanations && answer.explanation && (
                    <div className="mt-3 bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-blue-800">
                        Explanation:
                      </p>
                      <p className="text-sm text-blue-900 mt-1">
                        {answer.explanation}
                      </p>
                    </div>
                  )}

                  <div className="mt-2 flex justify-between text-xs text-gray-600">
                    <div>
                      Marks: {answer.isCorrect ? `+${answer.marksEarned}` : "0"}
                      {answer.negativeMarks > 0 &&
                        ` (−${answer.negativeMarks})`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 pt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.push("/tests")}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Tests
          </Button>

          <Button onClick={() => router.push(`/rankings/${exam.id}`)}>
            <BarChart2 className="mr-1 h-4 w-4" />
            View Rankings
          </Button>
        </CardFooter>
      </Card>

      <Toaster position="top-center" richColors />
    </div>
  );
}
