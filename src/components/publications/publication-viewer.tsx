"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import examAdminService from "@/services/adminExam.services";
import PDFViewer from "./pdf-viewer";
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface Publication {
  id: string;
  examId: string;
  examTitle: string;
  fileUrl: string;
  createdAt: string;
  studentCount: number;
  isPublished: boolean;
}

export default function PublicationViewer({
  publicationId,
}: {
  publicationId: string;
}) {
  const router = useRouter();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        setLoading(true);
        const response = await examAdminService.getPublicationById(
          publicationId
        );

        if (response.status === "success") {
          setPublication(response.data.publication);
        } else {
          setError("Failed to load publication details");
          toast.error("Failed to load publication details");
        }
      } catch (error) {
        console.error("Error fetching publication:", error);
        setError("Unable to load the requested publication");
        toast.error("Unable to load the requested publication");
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [publicationId]);

  const handleDownload = () => {
    if (!publication) return;

    const link = document.createElement("a");
    link.href = publication.fileUrl;
    link.download = `${publication.examTitle.replace(/\s+/g, "-")}-results.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} className="text-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading publication...</p>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} className="text-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Publication Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {`The publication you are looking for does not exist or you don't
                have permission to view it.`}
              </p>
              <Button onClick={goBack}>Return to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Button
            variant="ghost"
            onClick={goBack}
            className="mb-2 text-gray-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {publication.examTitle}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {publication.isPublished ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Published Results
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Draft Results
              </span>
            )}
            <span className="ml-2">•</span>
            <span className="ml-2">{publication.studentCount} students</span>
          </p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* PDF Viewer */}
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium">Exam Results Document</span>
          </div>
        </div>

        <div className="w-full">
          <PDFViewer
            url={publication.fileUrl}
            title={`${publication.examTitle} - Results`}
          />
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}
