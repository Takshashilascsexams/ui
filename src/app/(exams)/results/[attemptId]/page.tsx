"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import examService from "@/services/exam.services";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  HelpCircle,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  FileText,
  BarChart3,
  Home,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { formatTimeDuration } from "@/lib/formatTimeDuration";

// Interfaces for the results data
interface ExamDetails {
  id: string; // Added the missing 'id' property
  title: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
  passMarkPercentage: number;
  hasNegativeMarking: boolean;
  negativeMarkingValue: number;
}

interface ResultSummary {
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

interface Option {
  _id: string;
  optionText: string;
  isCorrect?: boolean;
}

interface Statement {
  statementNumber: number;
  statementText: string;
}

interface DetailedAnswer {
  questionId: string;
  questionText: string;
  type: string;
  statements?: Statement[];
  statementInstruction?: string;
  selectedOption: string | null;
  correctOptionId: string | null;
  isCorrect: boolean;
  marksEarned: number;
  negativeMarks: number;
  responseTime: number;
  options: Option[];
  explanation: string;
}

interface ResultData {
  attempt: {
    id: string;
    status: string;
  };
  exam: ExamDetails;
  summary: ResultSummary;
  detailedAnswers: DetailedAnswer[];
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultData | null>(null);
  const [selectedTab, setSelectedTab] = useState<"summary" | "detailed">(
    "summary"
  );

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add retry logic for critical API call
        let attempts = 0;
        let response;

        while (attempts < 3 && !response) {
          try {
            response = await examService.getAttemptResult(attemptId);
            break;
          } catch (err) {
            attempts++;
            if (attempts >= 3) throw err;

            // Exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
            );
          }
        }

        setResults(response.data);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load exam results. Please try again later."
        );
        toast.error("Failed to load exam results");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchResults();
    }
  }, [attemptId]);

  // Calculate performance metrics
  const getPerformanceGrade = (percentage: number): string => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Very Good";
    if (percentage >= 70) return "Good";
    if (percentage >= 60) return "Above Average";
    if (percentage >= 50) return "Average";
    return "Needs Improvement";
  };

  // Format date and time
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your exam results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Failed to load exam results. Please try again later."}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button
              onClick={() => router.push("/tests")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Tests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { exam, summary, detailedAnswers } = results;
  const performanceGrade = getPerformanceGrade(summary.scorePercentage);
  const timeTakenFormatted = formatTimeDuration(summary.timeTaken);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-blue-600" />
            Exam Results
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/tests")}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tests</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Exam Title & Status */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {exam.title}
          </h2>
          <p className="text-gray-600">{exam.description}</p>
        </div>

        {/* Result Summary Card */}
        <Card className="mb-6 overflow-hidden">
          <div
            className={`h-2 w-full ${
              summary.hasPassed ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Result Summary</CardTitle>
                <CardDescription>
                  Attempt completed on {formatDateTime(summary.endTime)}
                </CardDescription>
              </div>
              <div className="flex items-center">
                {summary.hasPassed ? (
                  <div className="flex items-center text-green-600 font-medium">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    Passed
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 font-medium">
                    <XCircle className="h-5 w-5 mr-1" />
                    Failed
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Score</div>
                <div className="text-2xl font-bold">
                  {summary.finalScore} / {exam.totalMarks}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {summary.scorePercentage.toFixed(2)}%
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Performance</div>
                <div className="text-2xl font-bold">{performanceGrade}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Pass mark: {exam.passMarkPercentage}%
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Time Taken</div>
                <div className="text-2xl font-bold">{timeTakenFormatted}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Duration: {exam.totalQuestions} questions
                </div>
              </div>

              {summary.rank && summary.percentile ? (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Ranking</div>
                  <div className="text-2xl font-bold">Rank {summary.rank}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Percentile: {summary.percentile.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">
                    Question Count
                  </div>
                  <div className="text-2xl font-bold">
                    {exam.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Total questions
                  </div>
                </div>
              )}
            </div>

            {/* Performance breakdown */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Performance Breakdown
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      Correct
                    </span>
                    <span className="text-sm font-medium">
                      {summary.correctAnswers} / {exam.totalQuestions}
                    </span>
                  </div>
                  <Progress
                    value={(summary.correctAnswers / exam.totalQuestions) * 100}
                    // className="h-2 bg-gray-200"
                    className="h-2 bg-gray-200 [&>div]:bg-green-500"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 flex items-center">
                      <X className="h-4 w-4 text-red-500 mr-1" />
                      Wrong
                    </span>
                    <span className="text-sm font-medium">
                      {summary.wrongAnswers} / {exam.totalQuestions}
                    </span>
                  </div>
                  <Progress
                    value={(summary.wrongAnswers / exam.totalQuestions) * 100}
                    // className="h-2 bg-gray-200"
                    className="h-2 bg-gray-200 [&>div]:bg-red-500"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 flex items-center">
                      <HelpCircle className="h-4 w-4 text-orange-500 mr-1" />
                      Unattempted
                    </span>
                    <span className="text-sm font-medium">
                      {summary.unattempted} / {exam.totalQuestions}
                    </span>
                  </div>
                  <Progress
                    value={(summary.unattempted / exam.totalQuestions) * 100}
                    // className="h-2 bg-gray-200"
                    className="h-2 bg-gray-200 [&>div]:bg-orange-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-blue-600 mr-1" />
                    <h4 className="text-sm font-medium text-blue-700">
                      Marks Breakdown
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Total Marks:</div>
                    <div className="font-medium">{summary.totalMarks}</div>
                    {exam.hasNegativeMarking && (
                      <>
                        <div className="text-gray-600">Negative Marks:</div>
                        <div className="font-medium text-red-600">
                          -{summary.negativeMarks}
                        </div>
                      </>
                    )}
                    <div className="text-gray-600">Final Score:</div>
                    <div className="font-medium">{summary.finalScore}</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-blue-600 mr-1" />
                    <h4 className="text-sm font-medium text-blue-700">
                      Time Analysis
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Started At:</div>
                    <div className="font-medium">
                      {formatDateTime(summary.startTime)}
                    </div>
                    <div className="text-gray-600">Completed At:</div>
                    <div className="font-medium">
                      {formatDateTime(summary.endTime)}
                    </div>
                    <div className="text-gray-600">Total Time:</div>
                    <div className="font-medium">{timeTakenFormatted}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Summary and Detailed Results */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                selectedTab === "summary"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedTab("summary")}
            >
              Summary
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                selectedTab === "detailed"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setSelectedTab("detailed")}
            >
              Detailed Analysis
            </button>
          </div>
        </div>

        {/* Detailed Questions and Answers */}
        {selectedTab === "detailed" && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
              Question Analysis
            </h3>

            {detailedAnswers.map((answer, index) => (
              <Card
                key={answer.questionId}
                className={`overflow-hidden ${
                  answer.isCorrect
                    ? "border-green-200"
                    : answer.selectedOption === null
                    ? "border-orange-200"
                    : "border-red-200"
                }`}
              >
                <div
                  className={`h-1 w-full ${
                    answer.isCorrect
                      ? "bg-green-500"
                      : answer.selectedOption === null
                      ? "bg-orange-400"
                      : "bg-red-500"
                  }`}
                ></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">
                      Question {index + 1}
                    </CardTitle>
                    <div className="flex items-center">
                      {answer.isCorrect ? (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <Check className="h-4 w-4 mr-1" />
                          Correct (+{answer.marksEarned})
                        </span>
                      ) : answer.selectedOption === null ? (
                        <span className="flex items-center text-orange-500 text-sm font-medium">
                          <HelpCircle className="h-4 w-4 mr-1" />
                          Not Attempted
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 text-sm font-medium">
                          <X className="h-4 w-4 mr-1" />
                          Wrong{" "}
                          {answer.negativeMarks > 0
                            ? `(-${answer.negativeMarks})`
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{answer.questionText}</p>

                  {/* For STATEMENT_BASED questions, display statements */}
                  {answer.type === "STATEMENT_BASED" && answer.statements && (
                    <div className="mb-4">
                      {answer.statements.map((statement) => (
                        <div
                          key={statement.statementNumber}
                          className="mb-2 p-3 bg-gray-50 rounded-md"
                        >
                          <span className="font-medium mr-1">
                            {statement.statementNumber}.
                          </span>
                          {statement.statementText}
                        </div>
                      ))}
                      {answer.statementInstruction && (
                        <p className="mt-2 font-medium text-gray-700">
                          {answer.statementInstruction}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Answer options */}
                  <div className="space-y-2 mb-4">
                    {answer.options.map((option, optIndex) => {
                      const isUserSelected =
                        answer.selectedOption === option._id;
                      const isCorrectOption =
                        option._id === answer.correctOptionId;

                      return (
                        <div
                          key={option._id}
                          className={`p-3 rounded-md flex items-start ${
                            isUserSelected && isCorrectOption
                              ? "bg-green-50 border border-green-200"
                              : isUserSelected && !isCorrectOption
                              ? "bg-red-50 border border-red-200"
                              : !isUserSelected && isCorrectOption
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="mr-3 mt-1">
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <div className="flex-1">{option.optionText}</div>
                          <div className="ml-2 flex items-center">
                            {isUserSelected && isCorrectOption && (
                              <Check className="h-5 w-5 text-green-600" />
                            )}
                            {isUserSelected && !isCorrectOption && (
                              <X className="h-5 w-5 text-red-600" />
                            )}
                            {!isUserSelected && isCorrectOption && (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {answer.explanation && (
                    <div className="mt-4 bg-yellow-50 p-4 rounded-md border border-yellow-100">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        Explanation
                      </h4>
                      <p className="text-sm text-yellow-800">
                        {answer.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary View (visible when summary tab is selected) */}
        {selectedTab === "summary" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  Overall performance in this exam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-8 border-blue-100 flex flex-col items-center justify-center bg-white">
                      <span className="text-3xl font-bold text-blue-600">
                        {summary.scorePercentage.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500">Score</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        {summary.correctAnswers}
                      </div>
                      <div className="text-xs text-gray-600">Correct</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-md">
                      <div className="text-2xl font-bold text-red-600">
                        {summary.wrongAnswers}
                      </div>
                      <div className="text-xs text-gray-600">Wrong</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-md">
                      <div className="text-2xl font-bold text-orange-500">
                        {summary.unattempted}
                      </div>
                      <div className="text-xs text-gray-600">Skipped</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium">
                        {summary.correctAnswers > 0 || summary.wrongAnswers > 0
                          ? (
                              (summary.correctAnswers /
                                (summary.correctAnswers +
                                  summary.wrongAnswers)) *
                              100
                            ).toFixed(2)
                          : "0.00"}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Attempt Rate</span>
                      <span className="font-medium">
                        {(
                          ((exam.totalQuestions - summary.unattempted) /
                            exam.totalQuestions) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Avg. Time Per Question
                      </span>
                      <span className="font-medium">
                        {(summary.timeTaken / exam.totalQuestions || 0).toFixed(
                          1
                        )}{" "}
                        seconds
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Based on your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {summary.hasPassed
                      ? "Congratulations on passing! Here are some recommendations to improve further:"
                      : "Here are some recommendations to help you improve:"}
                  </p>

                  <ul className="space-y-2">
                    {summary.unattempted > 0 && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">
                          <HelpCircle className="h-4 w-4" />
                        </span>
                        <span>
                          You skipped {summary.unattempted} questions. Work on
                          time management to attempt all questions.
                        </span>
                      </li>
                    )}

                    {summary.wrongAnswers > exam.totalQuestions * 0.3 && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">
                          <X className="h-4 w-4" />
                        </span>
                        <span>
                          Review the topics where you made the most mistakes.
                          Focus on understanding concepts rather than
                          memorizing.
                        </span>
                      </li>
                    )}

                    {summary.correctAnswers < exam.totalQuestions * 0.5 && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">
                          <BarChart3 className="h-4 w-4" />
                        </span>
                        <span>
                          Consider revising the fundamentals. Your score
                          indicates gaps in core concepts.
                        </span>
                      </li>
                    )}

                    {summary.timeTaken > exam.totalQuestions * 90 && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">
                          <Clock className="h-4 w-4" />
                        </span>
                        <span>
                          You spent considerable time on this exam. Practice
                          more timed tests to improve speed.
                        </span>
                      </li>
                    )}

                    {summary.hasPassed && summary.scorePercentage >= 70 && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">
                          <CheckCircle className="h-4 w-4" />
                        </span>
                        <span>
                          You performed well! Consider attempting more difficult
                          exams to challenge yourself.
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button
            onClick={() => router.push("/tests")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Tests
          </Button>

          <Button
            onClick={() => router.push(`/rules?examId=${results.exam.id}`)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Re-attempt Exam
          </Button>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
