"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileDown } from "lucide-react";

interface PDFViewerProps {
  url: string;
  title: string;
}

/**
 * PDF viewer component for Firebase Storage PDFs
 *
 * @param {Object} props
 * @param {string} props.url - URL to the PDF (Firebase Storage or local)
 * @param {string} props.title - Title for the PDF (used for download filename)
 */
export default function PDFViewer({ url, title }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  console.log("Rendering PDF with URL:", url);

  // Handle iframe load event
  const handleLoad = () => {
    console.log("PDF loaded successfully");
    setIsLoading(false);
  };

  // Handle iframe error event
  const handleError = () => {
    console.error("Error loading PDF from URL:", url);
    setLoadError(true);
    setIsLoading(false);
  };

  // Open PDF in a new tab
  const openInNewTab = () => {
    window.open(url, "_blank");
  };

  // Download the PDF
  const downloadPdf = () => {
    // Create an anchor element and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "document"}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Loading indicator */}
      {isLoading && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error state */}
      {loadError ? (
        <div className="flex flex-col items-center justify-center p-10 text-center bg-gray-50 border rounded-md h-[500px]">
          <div className="text-amber-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to display PDF
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            {`The PDF viewer couldn't display this document directly. You can try
            opening it in a new tab or downloading it.`}
          </p>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={openInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button onClick={downloadPdf} className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
            <div className="text-sm text-gray-500 mt-4">
              URL:{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">{url}</code>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[700px] relative border rounded-md overflow-hidden">
          {/* PDF iframe */}
          <iframe
            src={url}
            className="w-full h-full border-none"
            title={title || "PDF Document"}
            onLoad={handleLoad}
            onError={handleError}
          />

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm"
              onClick={openInNewTab}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm"
              onClick={downloadPdf}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
