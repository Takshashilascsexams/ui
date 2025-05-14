import Link from "next/link";
import { Eye } from "lucide-react";
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
import { UserData, PaginationData } from "./students-dashboard";

interface UserTableProps {
  users: UserData[];
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export default function UserTable({
  users,
  pagination,
  onPageChange,
}: UserTableProps) {
  // No users to display
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No users found
        </h3>
        <p className="text-gray-600 mb-4">
          There are no users matching your current filters.
        </p>
      </div>
    );
  }

  // Get role badge styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Admin
          </Badge>
        );
      case "Teacher":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Teacher
          </Badge>
        );
      case "Student":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Student
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {role}
          </Badge>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User Info</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Joined{" "}
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    {user.phoneNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-50">
                    {user.category}
                  </Badge>
                </TableCell>
                <TableCell>{user.district}</TableCell>
                <TableCell className="text-center">
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            asChild
                          >
                            <Link href={`/dashboard/students/${user._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">View Details</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
