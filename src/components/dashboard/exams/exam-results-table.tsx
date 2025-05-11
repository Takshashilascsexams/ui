"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Search,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock student results data - this would normally come from an API
interface StudentResult {
  id: string;
  userId: string;
  studentName: string;
  startedAt: string;
  completedAt: string | null;
  status: "completed" | "in-progress" | "timed-out" | "paused";
  score: number | null;
  hasPassed: boolean | null;
  totalQuestions: number;
  questionsAttempted: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeSpent: number; // in seconds
}

// This is a mock implementation - you would replace this with actual API calls
const mockFetchStudentResults = async (
  examId: string,
  search: string = "",
  sortBy: string = "startedAt",
  sortOrder: string = "desc",
  status: string = "all",
  page: number = 1,
  limit: number = 10
): Promise<{
  results: StudentResult[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate some mock data based on the exam ID
  const mockStudents = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Alice Johnson" },
    { id: "4", name: "Bob Williams" },
    { id: "5", name: "Charlie Brown" },
    { id: "6", name: "Diana Prince" },
    { id: "7", name: "Ethan Hunt" },
    { id: "8", name: "Fiona Green" },
    { id: "9", name: "George Taylor" },
    { id: "10", name: "Hannah Moore" },
    { id: "11", name: "Ian Wright" },
    { id: "12", name: "Jessica Lee" },
    { id: "13", name: "Kevin Chen" },
    { id: "14", name: "Laura Wilson" },
    { id: "15", name: "Michael Scott" },
  ];

  // Generate random results for each student
  const allResults: StudentResult[] = mockStudents.map((student) => {
    const totalQuestions = 50; // Example
    const questionsAttempted = Math.floor(Math.random() * (totalQuestions + 1));
    const correctAnswers = Math.floor(Math.random() * (questionsAttempted + 1));
    const wrongAnswers = questionsAttempted - correctAnswers;
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Create dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days

    // Determine status
    let status: "completed" | "in-progress" | "timed-out" | "paused";
    let completedAt: string | null = null;
    let hasPassed: boolean | null = null;

    // Weight distribution: 60% completed, 20% in-progress, 10% timed-out, 10% paused
    const rand = Math.random();
    if (rand < 0.6) {
      status = "completed";
      const completeDate = new Date(startDate);
      completeDate.setHours(
        completeDate.getHours() + Math.floor(Math.random() * 3)
      );
      completedAt = completeDate.toISOString();
      hasPassed = score >= 60; // Pass threshold at 60%
    } else if (rand < 0.8) {
      status = "in-progress";
    } else if (rand < 0.9) {
      status = "timed-out";
    } else {
      status = "paused";
    }

    return {
      id: `${examId}-${student.id}`,
      userId: student.id,
      studentName: student.name,
      startedAt: startDate.toISOString(),
      completedAt,
      status,
      score: status === "completed" ? score : null,
      hasPassed,
      totalQuestions,
      questionsAttempted,
      correctAnswers,
      wrongAnswers,
      unanswered: totalQuestions - questionsAttempted,
      timeSpent: Math.floor(Math.random() * 3600), // Random time between 0 and 1 hour
    };
  });

  // Filter by search query
  let filteredResults = allResults;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredResults = filteredResults.filter(
      (result) =>
        result.studentName.toLowerCase().includes(searchLower) ||
        result.userId.includes(searchLower)
    );
  }

  // Filter by status
  if (status !== "all") {
    filteredResults = filteredResults.filter(
      (result) => result.status === status
    );
  }

  // Sort results
  filteredResults.sort((a, b) => {
    let valA: string | number | Date, valB: string | number | Date;

    switch (sortBy) {
      case "studentName":
        valA = a.studentName;
        valB = b.studentName;
        break;
      case "score":
        valA = a.score || 0;
        valB = b.score || 0;
        break;
      case "startedAt":
        valA = new Date(a.startedAt).getTime();
        valB = new Date(b.startedAt).getTime();
        break;
      case "completedAt":
        valA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        valB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        break;
      default:
        valA =
          typeof a[sortBy as keyof StudentResult] === "boolean"
            ? Number(a[sortBy as keyof StudentResult])
            : (a[sortBy as keyof StudentResult] as string | number | Date) ||
              "";
        valB =
          typeof b[sortBy as keyof StudentResult] === "boolean"
            ? Number(b[sortBy as keyof StudentResult])
            : (b[sortBy as keyof StudentResult] as string | number | Date) ||
              "";
    }

    // Apply sort order
    return sortOrder === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
  });

  // Pagination
  const total = filteredResults.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  return {
    results: paginatedResults,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  };
};

function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${remainingSeconds}s`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
          Completed
        </Badge>
      );
    case "in-progress":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
          In Progress
        </Badge>
      );
    case "timed-out":
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200">
          Timed Out
        </Badge>
      );
    case "paused":
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">
          Paused
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200">
          {status}
        </Badge>
      );
  }
}

interface ExamResultsTableProps {
  examId: string;
}

export default function ExamResultsTable({ examId }: ExamResultsTableProps) {
  // State for search, sort, filter, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("startedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // State for student results and loading
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);

  // Fetch results based on current filters and pagination
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await mockFetchStudentResults(
          examId,
          searchQuery,
          sortBy,
          sortOrder,
          statusFilter,
          currentPage,
          limit
        );

        setStudentResults(response.results);
        setPagination(response.pagination);
      } catch (error) {
        toast.error("Failed to load student results", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
        console.error("Error fetching student results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [
    examId,
    searchQuery,
    sortBy,
    sortOrder,
    statusFilter,
    currentPage,
    limit,
  ]);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to descending order
      setSortBy(column);
      setSortOrder("desc");
    }

    // Reset to first page when changing sort
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.pages) {
      setCurrentPage(page);
    }
  };

  // Loading state
  if (loading && studentResults.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (studentResults.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No results found
        </h3>
        <p className="text-gray-600">
          {searchQuery || statusFilter !== "all"
            ? "Try adjusting your search or filter criteria."
            : "There are no student attempts for this exam yet."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="timed-out">Timed Out</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleSort("studentName")}
                  className="flex justify-between"
                >
                  <span>Student Name</span>
                  {sortBy === "studentName" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("score")}
                  className="flex justify-between"
                >
                  <span>Score</span>
                  {sortBy === "score" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("startedAt")}
                  className="flex justify-between"
                >
                  <span>Start Date</span>
                  {sortBy === "startedAt" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("completedAt")}
                  className="flex justify-between"
                >
                  <span>Completion Date</span>
                  {sortBy === "completedAt" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("studentName")}
              >
                <div className="flex items-center gap-1">
                  Student
                  {sortBy === "studentName" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer text-center"
                onClick={() => handleSort("score")}
              >
                <div className="flex items-center justify-center gap-1">
                  Score
                  {sortBy === "score" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </div>
              </TableHead>
              <TableHead className="text-center">Progress</TableHead>
              <TableHead
                className="cursor-pointer text-center"
                onClick={() => handleSort("startedAt")}
              >
                <div className="flex items-center justify-center gap-1">
                  Started
                  {sortBy === "startedAt" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </div>
              </TableHead>
              <TableHead className="text-center">Time Spent</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{result.studentName}</div>
                    <div className="text-xs text-gray-500">
                      ID: {result.userId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(result.status)}</TableCell>
                <TableCell className="text-center">
                  {result.score !== null ? (
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          result.hasPassed
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {result.score.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {result.correctAnswers}/{result.totalQuestions}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full ${
                          result.status === "completed"
                            ? result.hasPassed
                              ? "bg-green-600"
                              : "bg-red-600"
                            : "bg-blue-600"
                        }`}
                        style={{
                          width: `${
                            (result.questionsAttempted /
                              result.totalQuestions) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {result.questionsAttempted}/{result.totalQuestions}{" "}
                      questions
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(result.startedAt), {
                      addSuffix: true,
                    })}
                  </div>
                  {result.completedAt && (
                    <div className="text-xs text-gray-500">
                      Completed:{" "}
                      {formatDistanceToNow(new Date(result.completedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-sm">
                    {formatTimeSpent(result.timeSpent)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600"
                          asChild
                        >
                          <Link href={`/dashboard/exams/results/${result.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        View Detailed Result
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pagination.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-l-md"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.pages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, i, array) => {
                      // Add ellipsis
                      if (i > 0 && page > array[i - 1] + 1) {
                        return (
                          <span
                            key={`ellipsis-${page}`}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={
                            currentPage === page
                              ? "bg-indigo-600 text-white"
                              : ""
                          }
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-r-md"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
