"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { toast, Toaster } from "sonner";
import examAdminService from "@/services/adminExam.services";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExamResultsTable from "./exam-results-table";
import ExamStatisticsCharts from "./exam-statistics-charts";
import DashboardLoading from "./dashboard-loading";
import ExamPublications from "./exam-publications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Types
interface ExamDetailsData {
  exam: {
    _id: string;
    title: string;
    description: string;
    category: string;
    duration: number;
    totalQuestions: number;
    totalMarks: number;
    isActive: boolean;
    isPremium: boolean;
    isFeatured: boolean;
    passMarkPercentage: number;
    difficultyLevel: string;
    hasNegativeMarking: boolean;
    negativeMarkingValue: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
  attempts: {
    total: number;
    byStatus: {
      "in-progress": number;
      completed: number;
      "timed-out": number;
      paused: number;
    };
  };
  results: {
    passed: {
      count: number;
      avgScore: number;
      maxScore: number;
      minScore: number;
    };
    failed: {
      count: number;
      avgScore: number;
      maxScore: number;
      minScore: number;
    };
  };
}

interface ExamDetailsProps {
  examId: string;
}

export default function ExamDetails({ examId }: ExamDetailsProps) {
  const [examDetails, setExamDetails] = useState<ExamDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        const response = await examAdminService.getExamDetails(examId);
        setExamDetails(response.data);
      } catch (error) {
        toast.error("Failed to load exam details", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        console.error("Error fetching exam details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [examId]);

  // Handle download of exam results
  const handleDownloadResults = () => {
    // This would be implemented with actual data export functionality
    toast.info("Downloading exam results...");
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <Link
          href="/dashboard/exams"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exams
        </Link>
        <DashboardLoading />
      </div>
    );
  }

  if (!examDetails) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
        <Link
          href="/dashboard/exams"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exams
        </Link>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Exam not found
          </h3>
          <p className="text-gray-600">
            The exam you are looking for does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const { exam, attempts, results } = examDetails;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <Link
            href="/dashboard/exams"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleDownloadResults}
        >
          <Download className="h-4 w-4" />
          Download Results
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Student Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="publications">Result Publications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attempts.total}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {attempts.byStatus.completed} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attempts.total > 0
                    ? `${Math.round(
                        (attempts.byStatus.completed / attempts.total) * 100
                      )}%`
                    : "0%"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {attempts.byStatus["timed-out"]} timed out
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pass Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attempts.byStatus.completed > 0
                    ? `${Math.round(
                        (results.passed.count / attempts.byStatus.completed) *
                          100
                      )}%`
                    : "0%"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {results.passed.count} of {attempts.byStatus.completed} passed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attempts.byStatus.completed > 0
                    ? `${Math.round(
                        (results.passed.count * results.passed.avgScore +
                          results.failed.count * results.failed.avgScore) /
                          attempts.byStatus.completed
                      )}%`
                    : "0%"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Highest: {results.passed.maxScore || 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <ExamStatisticsCharts examDetails={examDetails} />

          {/* Additional exam information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
                <CardDescription>
                  General information about the exam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Category
                    </p>
                    <p>{exam.category.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Difficulty
                    </p>
                    <p>{exam.difficultyLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Duration
                    </p>
                    <p>{exam.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Questions
                    </p>
                    <p>{exam.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Marks
                    </p>
                    <p>{exam.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Pass Mark
                    </p>
                    <p>{exam.passMarkPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Negative Marking
                    </p>
                    <p>
                      {exam.hasNegativeMarking
                        ? `Yes (${exam.negativeMarkingValue})`
                        : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p>{exam.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attempt Status Breakdown</CardTitle>
                <CardDescription>
                  Current state of all exam attempts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Completed</p>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {attempts.byStatus.completed}
                      </div>
                      <div className="text-xs text-gray-500">
                        (
                        {attempts.total > 0
                          ? Math.round(
                              (attempts.byStatus.completed / attempts.total) *
                                100
                            )
                          : 0}
                        %)
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          attempts.total > 0
                            ? (attempts.byStatus.completed / attempts.total) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">In Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {attempts.byStatus["in-progress"]}
                      </div>
                      <div className="text-xs text-gray-500">
                        (
                        {attempts.total > 0
                          ? Math.round(
                              (attempts.byStatus["in-progress"] /
                                attempts.total) *
                                100
                            )
                          : 0}
                        %)
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          attempts.total > 0
                            ? (attempts.byStatus["in-progress"] /
                                attempts.total) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Timed Out</p>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {attempts.byStatus["timed-out"]}
                      </div>
                      <div className="text-xs text-gray-500">
                        (
                        {attempts.total > 0
                          ? Math.round(
                              (attempts.byStatus["timed-out"] /
                                attempts.total) *
                                100
                            )
                          : 0}
                        %)
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{
                        width: `${
                          attempts.total > 0
                            ? (attempts.byStatus["timed-out"] /
                                attempts.total) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Paused</p>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {attempts.byStatus.paused}
                      </div>
                      <div className="text-xs text-gray-500">
                        (
                        {attempts.total > 0
                          ? Math.round(
                              (attempts.byStatus.paused / attempts.total) * 100
                            )
                          : 0}
                        %)
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${
                          attempts.total > 0
                            ? (attempts.byStatus.paused / attempts.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Student Results Tab */}
        <TabsContent value="results">
          <ExamResultsTable examId={examId} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {/* More detailed analytics would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>
                Advanced statistics and analysis for this exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Detailed analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results generation */}
        <TabsContent value="publications">
          <ExamPublications examId={examId} />
        </TabsContent>
      </Tabs>

      <Toaster position="top-center" richColors />
    </div>
  );
}
