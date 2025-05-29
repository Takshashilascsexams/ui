"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, RefreshCw, Filter } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionTable from "./questions-table";
import DashboardLoading from "../exams/dashboard-loading";
import questionAdminService, {
  QuestionData,
  ApiResponse,
  QuestionsListResponseFlat,
} from "@/services/adminQuestions.services";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export default function QuestionsDashboard() {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });

  const getActiveFilter = useCallback(() => {
    switch (activeTab) {
      case "mcq":
        return { type: "MCQ" };
      case "statement":
        return { type: "STATEMENT_BASED" };
      default:
        return {};
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);

        const rawFilters = getActiveFilter();
        const filters: Record<string, string> = Object.fromEntries(
          Object.entries(rawFilters).filter(([, value]) => value !== undefined)
        );

        if (searchQuery.trim()) {
          filters.search = searchQuery;
        }

        const response: ApiResponse<QuestionsListResponseFlat> =
          await questionAdminService.getAllQuestions(
            pagination.page,
            pagination.limit,
            "createdAt",
            "desc",
            filters
          );

        if (response.status === "success" && response.data) {
          setQuestions(response.data.questions);

          // ✅ NEW CODE: Handle pagination like the old working version
          if (response.data.pagination) {
            // If pagination object exists (matches old API structure)
            setPagination({
              total: response.data.pagination.total,
              page: response.data.pagination.page,
              pages: response.data.pagination.pages,
              limit: response.data.pagination.limit,
            });
          } else {
            // If flat structure (new API structure)
            setPagination({
              total: response.data.totalCount,
              page: response.data.currentPage,
              pages: response.data.totalPages,
              limit: pagination.limit,
            });
          }
        } else {
          throw new Error(response.message || "Failed to fetch questions");
        }
      } catch (error) {
        toast.error("Failed to load questions", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        console.error("Error fetching questions:", error);

        setQuestions([]);
        setPagination({
          total: 0,
          page: 1,
          pages: 1, // ✅ NEW CODE: Reset to 1 instead of 0 to match old behavior
          limit: pagination.limit,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [
    pagination.page,
    pagination.limit,
    activeTab,
    searchQuery,
    refreshTrigger,
    getActiveFilter,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success("Questions refreshed");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const success = await questionAdminService.deleteQuestion(questionId);

      if (success) {
        toast.success("Question deleted successfully");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        throw new Error("Delete operation failed");
      }
    } catch (error) {
      toast.error("Failed to delete question", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleDifficultyFilter = (difficulty: string) => {
    console.log("Difficulty filter selected:", difficulty);
    toast.info(`Filtering by ${difficulty} difficulty (Coming soon)`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Question Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, search and manage all questions in the system
          </p>
          {!loading && (
            <p className="text-xs text-gray-500 mt-1">
              {pagination.total} total questions
              {searchQuery && ` matching "${searchQuery}"`}
              {activeTab !== "all" && ` (${activeTab.toUpperCase()} only)`}
            </p>
          )}
        </div>

        <Link
          href="/dashboard/questions/create-question"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Create Question
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full md:w-auto"
        >
          <TabsList className="w-full md:w-auto bg-white border">
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="mcq">MCQ</TabsTrigger>
            <TabsTrigger value="statement">Statement Based</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1 flex items-center gap-2">
          <form
            onSubmit={handleSearch}
            className="flex-1 relative flex items-center"
          >
            <Search className="absolute left-3 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Filter by Difficulty"
              >
                <Filter size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleDifficultyFilter("all")}>
                  All Difficulty Levels
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDifficultyFilter("EASY")}
                >
                  Easy
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDifficultyFilter("MEDIUM")}
                >
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDifficultyFilter("HARD")}
                >
                  Hard
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {loading ? (
        <DashboardLoading />
      ) : questions.length > 0 ? (
        <QuestionTable
          questions={questions}
          pagination={pagination}
          onPageChange={handlePageChange}
          onDeleteQuestion={handleDeleteQuestion}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <Search size={48} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No questions found
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            {searchQuery
              ? `No questions match your search "${searchQuery}". Try adjusting your search terms.`
              : activeTab !== "all"
              ? `No ${activeTab.toUpperCase()} questions found. Try switching to "All Questions" or create a new question.`
              : "Get started by creating your first question."}
          </p>
          {!searchQuery && (
            <Link
              href="/dashboard/questions/create-question"
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} />
              Create First Question
            </Link>
          )}
        </div>
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
