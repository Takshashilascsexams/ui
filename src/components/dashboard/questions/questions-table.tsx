import Link from "next/link";
import { Edit, Trash2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionData, PaginationData } from "./questions-dashboard";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuestionTableProps {
  questions: QuestionData[];
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export default function QuestionTable({
  questions,
  pagination,
  onPageChange,
  onDeleteQuestion,
}: QuestionTableProps) {
  // Get question type badge styling
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "MCQ":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            MCQ
          </Badge>
        );
      case "STATEMENT_BASED":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Statement Based
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {type}
          </Badge>
        );
    }
  };

  // Get difficulty badge styling
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Easy
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Medium
          </Badge>
        );
      case "HARD":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">Hard</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {difficulty}
          </Badge>
        );
    }
  };

  // Truncate text for display
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // No questions to display
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No questions found
        </h3>
        <p className="text-gray-600 mb-4">
          There are no questions matching your current filters.
        </p>
        <Link
          href="/dashboard/questions/create-question"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Create New Question
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
              <TableHead className="w-[350px]">Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-center">Marks</TableHead>
              <TableHead className="text-center">Negative Marks</TableHead>
              <TableHead className="text-center">Created</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question._id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">
                      {truncateText(question.questionText)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {question._id}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(question.type)}</TableCell>
                <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                <TableCell className="text-center">{question.marks}</TableCell>
                <TableCell className="text-center">
                  {question.negativeMarks}
                </TableCell>
                <TableCell className="text-center">
                  {formatDistanceToNow(new Date(question.createdAt), {
                    addSuffix: true,
                  })}
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
                            <Link
                              href={`/dashboard/questions/edit/${question._id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Edit Question
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the question from the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => onDeleteQuestion(question._id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
                questions
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
