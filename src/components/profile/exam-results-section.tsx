"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { convertToRedeableDate } from "@/lib/convertToReadableDate";
import getClerkToken from "@/actions/client/getClerkToken";
import {
  Trophy,
  FileText,
  ChevronRight,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

// Types based on your controller response
interface ExamAttempt {
  attemptId: string;
  exam: {
    id: string;
    title: string;
    category: string;
    totalMarks: number;
    totalQuestions: number;
  };
  performance: {
    score: number;
    percentage: string;
    hasPassed: boolean;
  };
  ranking: {
    rank: number | null;
    percentile: number | null;
  };
  timing: {
    attemptedOn: string;
    completedOn: string;
  };
  status: string;
}

interface ExamAttemptsResponse {
  attempts: ExamAttempt[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export default function ExamResultsSection() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const fetchAttempts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = await getClerkToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/publications/user/attempts?page=${page}&limit=6&status=completed,timed-out`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam attempts");
      }

      const data: {
        status: string;
        data: ExamAttemptsResponse;
        fromCache?: boolean;
      } = await response.json();

      if (data.status !== "success") {
        throw new Error("Invalid response from server");
      }

      setAttempts(data.data.attempts);
      setCurrentPage(data.data.pagination.page);
      setTotalPages(data.data.pagination.pages);
      setTotalAttempts(data.data.pagination.total);
    } catch (err) {
      console.error("Error fetching exam attempts:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load exam attempts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchAttempts(page);
    }
  };

  const getStatusIcon = (status: string, hasPassed: boolean) => {
    if (status === "completed") {
      return hasPassed ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" />
      );
    }
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
  };

  const getStatusBadge = (status: string, hasPassed: boolean) => {
    if (status === "completed") {
      return (
        <Badge
          variant={hasPassed ? "default" : "destructive"}
          className={cn(
            "text-xs",
            hasPassed ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
          )}
        >
          {hasPassed ? "Passed" : "Failed"}
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="text-xs bg-orange-100 text-orange-800"
      >
        Timed Out
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return convertToRedeableDate(new Date(dateString).getTime());
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-5 w-5 text-indigo-600" />
            Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-6 sm:py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-sm sm:text-base text-gray-600">
              Loading your exam results...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-5 w-5 text-indigo-600" />
            Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-6 sm:py-8">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
            <Button
              onClick={() => fetchAttempts(currentPage)}
              variant="outline"
              size="sm"
              className="text-sm sm:text-base"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attempts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-5 w-5 text-indigo-600" />
            Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-6 sm:py-8">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2 text-sm sm:text-base">
              No exam attempts found
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Your completed exam results will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-5 w-5 text-indigo-600" />
            Exam Results
          </CardTitle>
          <Badge variant="secondary" className="text-xs w-fit">
            {totalAttempts} {totalAttempts === 1 ? "Attempt" : "Attempts"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt.attemptId}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-indigo-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
                <div className="flex-1 min-w-0">
                  {/* Exam Title and Category */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 sm:line-clamp-1 flex-1">
                      {attempt.exam.title}
                    </h3>
                    <Badge variant="outline" className="text-xs w-fit">
                      {attempt.exam.category}
                    </Badge>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {attempt.performance.score}/{attempt.exam.totalMarks}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Percentage</p>
                        <p className="text-xs sm:text-sm font-medium">
                          {attempt.performance.percentage}%
                        </p>
                      </div>
                    </div>

                    {attempt.ranking.rank && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-yellow-700">
                            #
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Rank</p>
                          <p className="text-xs sm:text-sm font-medium">
                            {attempt.ranking.rank}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 min-w-0 col-span-2 lg:col-span-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Attempted</p>
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {formatDate(attempt.timing.attemptedOn)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Percentile */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusIcon(
                        attempt.status,
                        attempt.performance.hasPassed
                      )}
                      {getStatusBadge(
                        attempt.status,
                        attempt.performance.hasPassed
                      )}
                      {attempt.ranking.percentile && (
                        <span className="text-xs text-gray-500">
                          {attempt.ranking.percentile}th percentile
                        </span>
                      )}
                    </div>

                    {/* View Result Button - Mobile positioned below status */}
                    <div className="sm:hidden">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="hover:bg-indigo-50 hover:border-indigo-300 w-full"
                      >
                        <Link href={`/results/${attempt.attemptId}`}>
                          View Result
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* View Result Button - Desktop positioned on the right */}
                <div className="hidden sm:block lg:ml-4 flex-shrink-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="hover:bg-indigo-50 hover:border-indigo-300"
                  >
                    <Link href={`/results/${attempt.attemptId}`}>
                      <span className="hidden md:inline">View Result</span>
                      <span className="md:hidden">Result</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 border-t">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing {attempts.length} of {totalAttempts} results
            </p>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(3, totalPages))].map((_, index) => {
                  const pageNum = Math.max(1, currentPage - 1) + index;
                  if (pageNum > totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {totalPages > 3 && currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && (
                      <span className="text-xs text-gray-400 px-1">...</span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
