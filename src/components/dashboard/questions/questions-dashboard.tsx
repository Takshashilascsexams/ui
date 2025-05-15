"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, RefreshCw, Filter } from "lucide-react";
import { toast, Toaster } from "sonner";
import questionAdminService from "@/services/adminQuestions.services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionTable from "./questions-table";
import DashboardLoading from "../exams/dashboard-loading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types for question data
export interface QuestionData {
  _id: string;
  questionText: string;
  type: string;
  difficulty: string;
  category: string;
  marks: number;
  negativeMarks: number;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
  statements?: {
    statementNumber: number;
    statementText: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  createdAt: string;
}

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export default function QuestionsDashboard() {
  // State management
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

  // Create a reusable filter helper
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

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);

        // Filter params based on active tab
        const rawFilters = getActiveFilter();
        const filters: Record<string, string> = Object.fromEntries(
          Object.entries(rawFilters).filter(([, value]) => value !== undefined)
        );

        // Add search query if present
        if (searchQuery.trim()) {
          filters.search = searchQuery;
        }

        const response = await questionAdminService.getAllQuestions(
          pagination.page,
          pagination.limit,
          "createdAt",
          "desc",
          filters
        );

        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      } catch (error) {
        toast.error("Failed to load questions", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        console.error("Error fetching questions:", error);
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

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search query is already being tracked in state, so just prevent the default form submission
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on tab change
  };

  // Handle question deletion
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await questionAdminService.deleteQuestion(questionId);
      toast.success("Question deleted successfully");
      setRefreshTrigger((prev) => prev + 1); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete question", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Question Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, search and manage all questions in the system
          </p>
        </div>

        <Link
          href="/dashboard/questions/create-question"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Create Question
        </Link>
      </div>

      {/* Filters and Search */}
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
              <Button variant="outline" size="icon" title="Filter">
                <Filter size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>All Difficulty Levels</DropdownMenuItem>
                <DropdownMenuItem>Easy</DropdownMenuItem>
                <DropdownMenuItem>Medium</DropdownMenuItem>
                <DropdownMenuItem>Hard</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </div>

      {/* Questions Table */}
      {loading ? (
        <DashboardLoading />
      ) : (
        <QuestionTable
          questions={questions}
          pagination={pagination}
          onPageChange={handlePageChange}
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
