import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import examAdminService from "@/services/adminExam.services";
import { toast } from "sonner";
import { format } from "date-fns";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Download, Eye, FilePlus, X, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Publication {
  id: string;
  examId: string;
  examTitle: string;
  fileUrl: string;
  createdAt: string;
  studentCount: number;
  isPublished: boolean;
  publishedAt: string | null;
}

interface ExamPublicationsProps {
  examId: string;
}

export default function ExamPublications({ examId }: ExamPublicationsProps) {
  const router = useRouter();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPublications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await examAdminService.getExamPublications(examId);

      if (response?.status === "success") {
        setPublications(response.data.publications);
      } else {
        toast.error("Failed to load publications");
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
      toast.error("Failed to load publications");
    } finally {
      setLoading(false);
    }
  }, [examId]);

  // Fetch existing publications
  useEffect(() => {
    fetchPublications();
  }, [examId, fetchPublications]);

  // Generate results
  const handleGenerateResults = async () => {
    try {
      setIsGenerating(true);
      const response = await examAdminService.generateExamResults(examId);

      if (response?.status === "success") {
        toast.success(`Results has been successfully generated`);
        fetchPublications();
      } else {
        toast.error(response?.message || "Failed to generate results");
      }
    } catch (error) {
      console.error("Error generating results:", error);
      toast.error("Failed to generate results");
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle publication status
  const handleTogglePublish = async (
    publicationId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await examAdminService.togglePublicationStatus(
        publicationId,
        !currentStatus
      );

      if (response?.status === "success") {
        toast.success(
          currentStatus ? "Results unpublished" : "Results published"
        );
        fetchPublications();
      } else {
        toast.error(response?.message || "Failed to update publication status");
      }
    } catch (error) {
      console.error("Error toggling publication status:", error);
      toast.error("Failed to update publication status");
    }
  };

  // Preview PDF
  const handlePreview = (publicationId: string) => {
    if (!publicationId) {
      toast.error("Publication ID is not available");
      return;
    }
    router.push(`/dashboard/exams/publications/${publicationId}`);
  };

  // Download PDF
  const handleDownload = (publicationUrl: string, filename: string) => {
    if (!publicationUrl) {
      toast.error("Download URL is not available");
      return;
    }

    const link = document.createElement("a");
    link.href = publicationUrl;
    link.download = filename || "exam-results.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Results</CardTitle>
          <CardDescription>
            Generate ranked results for student attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <Button
              onClick={handleGenerateResults}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Generate Results
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result Publications</CardTitle>
          <CardDescription>Manage published exam results</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <LoadingSpinner size="md" className="mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading publications...</p>
            </div>
          ) : publications.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No result publications found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Students Count</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publications.map((pub) => (
                    <TableRow key={pub.id}>
                      <TableCell>
                        {format(new Date(pub.createdAt), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>{pub.studentCount} students</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pub.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {pub.isPublished ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePreview(pub.id)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleDownload(
                                pub.fileUrl,
                                `${pub.examTitle.replace(
                                  /\s+/g,
                                  "-"
                                )}-results-${format(
                                  new Date(pub.createdAt),
                                  "yyyy-MM-dd"
                                )}.pdf`
                              )
                            }
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={pub.isPublished ? "outline" : "default"}
                            size="sm"
                            className={`h-8 w-8 p-0 ${
                              pub.isPublished
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                            }`}
                            onClick={() =>
                              handleTogglePublish(pub.id, pub.isPublished)
                            }
                            title={pub.isPublished ? "Unpublish" : "Publish"}
                          >
                            {pub.isPublished ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
