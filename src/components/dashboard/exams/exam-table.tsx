import Link from "next/link";
import { Edit, BarChart2, Package, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomSwitch } from "@/components/ui/custom-switch";
import { ExamData, PaginationData } from "./exam-dashboard";

interface ExamTableProps {
  exams: ExamData[];
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onToggleStatus: (examId: string, currentStatus: boolean) => void;
}

export default function ExamTable({
  exams,
  pagination,
  onPageChange,
  onToggleStatus,
}: ExamTableProps) {
  // Function to get style for attempt count
  const getAttemptCountStyle = (count: number) => {
    if (count === 0) return "text-gray-500";
    if (count < 10) return "text-orange-600 font-medium";
    return "text-green-600 font-medium";
  };

  // No exams to display
  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No exams found
        </h3>
        <p className="text-gray-600 mb-4">
          There are no exams matching your current filters.
        </p>
        <Link
          href="/dashboard/exams/create-exam"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Create New Exam
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[350px]">Exam Info</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Questions</TableHead>
              <TableHead className="text-center">Attempts</TableHead>
              <TableHead className="text-center">Pass Rate</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => {
              // Calculate pass rate percentage
              const attemptedCount = exam.analytics.completed || 0;
              const passedCount = exam.analytics.passed || 0;
              const passRate =
                attemptedCount > 0
                  ? Math.round((passedCount / attemptedCount) * 100)
                  : 0;

              return (
                <TableRow key={exam._id}>
                  <TableCell className="align-top">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{exam.title}</span>
                        <div className="flex gap-1">
                          {exam.isPremium && (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200"
                            >
                              Premium
                            </Badge>
                          )}
                          {exam.isFeatured && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Featured
                            </Badge>
                          )}
                          {exam.isPartOfBundle && (
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700 border-purple-200"
                            >
                              <Package className="h-3 w-3 mr-1" />
                              Bundle
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {exam.description}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs font-mono text-gray-600 mt-1 truncate max-w-xs cursor-help">
                              ID: {exam._id}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Exam ID: {exam._id}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {exam.isPartOfBundle && exam.bundleTag && (
                        <span className="text-xs text-purple-600 mt-1">
                          Bundle: {exam.bundleTag}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 mt-1">
                        Created{" "}
                        {formatDistanceToNow(new Date(exam.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-50">
                      {exam.category.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{exam.totalQuestions}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={getAttemptCountStyle(
                          exam.analytics.totalAttempted
                        )}
                      >
                        {exam.analytics.totalAttempted}
                      </span>
                      <span className="text-xs text-gray-500">
                        {exam.analytics.completed} completed
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          passRate >= 70
                            ? "text-green-600 font-medium"
                            : "text-orange-600 font-medium"
                        }
                      >
                        {passRate}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {exam.analytics.passed}/{exam.analytics.completed}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CustomSwitch
                              checked={exam.isActive}
                              onCheckedChange={() =>
                                onToggleStatus(exam._id, exam.isActive)
                              }
                              activeColor="bg-blue-600"
                              inactiveColor="bg-blue-300"
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {exam.isActive ? "Active" : "Inactive"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <Link href={`/dashboard/exams/edit/${exam._id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Edit Exam</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600"
                              asChild
                            >
                              <Link
                                href={`/dashboard/exams/details/${exam._id}`}
                              >
                                <BarChart2 className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            View Detailed Results
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
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
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 &&
                        page <= pagination.page + 1)
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
                        variant={
                          pagination.page === page ? "default" : "outline"
                        }
                        size="sm"
                        className={
                          pagination.page === page
                            ? "bg-indigo-600 text-white"
                            : ""
                        }
                        onClick={() => onPageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
