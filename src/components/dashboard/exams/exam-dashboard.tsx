"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import examAdminService from "@/services/adminExam.services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExamTable from "./exam-table";
import DashboardLoading from "./dashboard-loading";

// Types for exam data
export interface ExamData {
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
  isPartOfBundle?: boolean;
  bundleTag?: string;
  createdAt: string;
  analytics: {
    totalAttempted: number;
    completed: number;
    passed: number;
    failed: number;
    averageScore: number;
    highestScore: number;
  };
}

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export default function ExamDashboard() {
  // State management
  const [exams, setExams] = useState<ExamData[]>([]);
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
      case "active":
        return { active: "true" };
      case "inactive":
        return { active: "false" };
      case "premium":
        return { premium: "true" };
      case "featured":
        return { featured: "true" };
      case "bundle":
        return { bundle: "true" };
      default:
        return {};
    }
  }, [activeTab]);

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
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

        const response = await examAdminService.getAllExams(
          pagination.page,
          pagination.limit,
          "createdAt",
          "desc",
          filters
        );
        console.log(response);

        setExams(response.data.exams);
        setPagination(response.data.pagination);
      } catch (error) {
        toast.error("Failed to load exams", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
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

  // Handle exam status toggle
  const handleToggleExamStatus = async (
    examId: string,
    currentStatus: boolean
  ) => {
    try {
      await examAdminService.updateExamStatus(examId, !currentStatus);
      toast.success("Exam status updated successfully");

      // Update local state to avoid refetching
      setExams((prev) =>
        prev.map((exam) =>
          exam._id === examId ? { ...exam, isActive: !currentStatus } : exam
        )
      );
    } catch (error) {
      toast.error("Failed to update exam status", {
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
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            View, search and manage all exams in the system
          </p>
        </div>

        <Link
          href="/dashboard/exams/create-exam"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Create Exam
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
            <TabsTrigger value="all">All Exams</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="bundle">Bundle</TabsTrigger>
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
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>

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

      {/* Exams Table */}
      {loading ? (
        <DashboardLoading />
      ) : (
        <ExamTable
          exams={exams}
          pagination={pagination}
          onPageChange={handlePageChange}
          onToggleStatus={handleToggleExamStatus}
        />
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
