"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink } from "lucide-react";

interface PDFViewerProps {
  url: string;
  title: string;
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Process the URL for both development and production
  const processedUrl = (() => {
    // If it's already an absolute URL (starts with http/https), return as is
    if (url.startsWith("http")) return url;

    // If it's a relative URL, ensure it has a leading slash
    if (!url.startsWith("/")) return `/${url}`;

    return url;
  })();

  const handleIframeError = () => {
    console.error("Error loading PDF from URL:", processedUrl);
    setIframeError(true);
    setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const openInNewTab = () => {
    window.open(processedUrl, "_blank");
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading && !iframeError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {iframeError ? (
        <div className="flex flex-col items-center justify-center p-10 text-center bg-gray-50 border rounded-md h-[500px]">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to display PDF
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            {`The PDF viewer couldn't load the document in this window. This could
            be due to browser restrictions or the PDF format.`}
          </p>
          <div className="space-y-4">
            <Button onClick={openInNewTab} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
            <div className="text-sm text-gray-500">
              URL:{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">
                {processedUrl}
              </code>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[700px] relative">
          <iframe
            src={processedUrl}
            className="w-full h-full border-none"
            title={title}
            onError={handleIframeError}
            onLoad={handleIframeLoad}
          />
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm"
              onClick={openInNewTab}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
