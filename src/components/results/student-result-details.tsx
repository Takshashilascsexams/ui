"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { ArrowLeft, Clock, FileText, User, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import examAdminService from "@/services/adminExam.services";
import { format } from "date-fns";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface StudentResultDetailsProps {
  attemptId: string;
}

interface StudentDetailedResult {
  attempt: {
    id: string;
    status: string;
    startTime: string;
    endTime: string;
    timeRemaining: number;
    timeTaken: number;
    timeTakenFormatted: string;
  };
  exam: {
    id: string;
    title: string;
    description: string;
    totalQuestions: number;
    totalMarks: number;
    duration: number;
    passMarkPercentage: number;
  };
  student: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  performance: {
    totalMarks: number;
    negativeMarks: number;
    finalScore: number;
    percentage: string;
    correctAnswers: number;
    wrongAnswers: number;
    unattempted: number;
    hasPassed: boolean;
    rank: number;
    percentile?: number;
  };
}

export default function StudentResultDetails({
  attemptId,
}: StudentResultDetailsProps) {
  const router = useRouter();
  const [result, setResult] = useState<StudentDetailedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentResult = async () => {
      try {
        setLoading(true);
        const response = await examAdminService.getStudentDetailedResult(
          attemptId
        );

        if (response?.status === "success") {
          setResult(response.data);
        } else {
          setError("Failed to load student result");
          toast.error("Failed to load student result");
        }
      } catch (error) {
        console.error("Error fetching student result:", error);
        setError("Unable to load the student result");
        toast.error("Unable to load the student result");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentResult();
  }, [attemptId]);

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} className="text-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner className="h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading student result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} className="text-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Result Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {`The student result you are looking for does not exist or you don't
                have permission to view it.`}
              </p>
              <Button onClick={goBack}>Return to Results</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP p"); // Format: Aug 23, 2024, 2:30 PM
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "timed-out":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "paused":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Button
            variant="ghost"
            onClick={goBack}
            className="mb-2 text-gray-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {result.exam.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(
                result.attempt.status
              )}`}
            >
              {result.attempt.status}
            </span>
            <span className="text-sm text-gray-600">
              Attempt ID: {result.attempt.id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Student Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <User className="mr-2 h-5 w-5 text-blue-500" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Name:</span>
                <span>{result.student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Student ID:</span>
                <span className="font-mono text-xs">{result.student.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Exam Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">
                  Total Questions:
                </span>
                <span>{result.exam.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Total Marks:</span>
                <span>{result.exam.totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Duration:</span>
                <span>{result.exam.duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Pass Mark:</span>
                <span>{result.exam.passMarkPercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attempt Timing */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Attempt Timing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Started:</span>
                <span>{formatDate(result.attempt.startTime)}</span>
              </div>
              {result.attempt.endTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Ended:</span>
                  <span>{formatDate(result.attempt.endTime)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Time Taken:</span>
                <span>{result.attempt.timeTakenFormatted}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Total Marks:</span>
                <span>{result.performance.totalMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">
                  Negative Marks:
                </span>
                <span>-{result.performance.negativeMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Percentage:</span>
                <span>{result.performance.percentage}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">
                  Correct Answers:
                </span>
                <span className="text-green-600">
                  {result.performance.correctAnswers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">
                  Wrong Answers:
                </span>
                <span className="text-red-600">
                  {result.performance.wrongAnswers}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Unattempted:</span>
                <span className="text-gray-600">
                  {result.performance.unattempted}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Rank:</span>
                <span className="font-medium">{result.performance.rank}</span>
              </div>
              {result.performance.percentile && (
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Percentile:</span>
                  <span>{result.performance.percentile}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Result:</span>
                <span
                  className={
                    result.performance.hasPassed
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {result.performance.hasPassed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32 flex flex-col items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  {/* Progress circle - we calculate the dash offset based on percentage */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={
                      result.performance.hasPassed ? "#22c55e" : "#ef4444"
                    }
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      40 *
                      (1 - parseFloat(result.performance.percentage) / 100)
                    }
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">
                    {result.performance.percentage}%
                  </span>
                  <span className="text-xs text-gray-500">Score</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Toaster position="top-center" richColors />
    </div>
  );
}
