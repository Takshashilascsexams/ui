import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExamTabManager } from "@/hooks/useExamTabManager";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExamSessionGuardProps {
  attemptId: string;
  children: React.ReactNode;
  onSessionConflict?: () => void;
  loadingComponent?: React.ReactNode;
}

export const ExamSessionGuard: React.FC<ExamSessionGuardProps> = ({
  attemptId,
  children,
  onSessionConflict,
  loadingComponent,
}) => {
  const router = useRouter();
  const [sessionStatus, setSessionStatus] = useState<
    "loading" | "active" | "conflict"
  >("loading");
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  const handleDuplicateTab = () => {
    setSessionStatus("conflict");
    setShowConflictDialog(true);
    onSessionConflict?.();
  };

  const handleSessionExpired = () => {
    setSessionStatus("conflict");
    setShowConflictDialog(true);
    onSessionConflict?.();
  };

  const { initializeTab, releaseTab } = useExamTabManager({
    attemptId,
    heartbeatInterval: 5000,
    staleTimeout: 30000,
    onDuplicateTab: handleDuplicateTab,
    onSessionExpired: handleSessionExpired,
  });

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const success = await initializeTab();
        if (isMounted) {
          setSessionStatus(success ? "active" : "conflict");
          if (!success) {
            setShowConflictDialog(true);
          }
        }
      } catch (error) {
        console.error("Failed to initialize tab manager:", error);
        if (isMounted) {
          setSessionStatus("conflict");
          setShowConflictDialog(true);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      releaseTab();
    };
  }, [attemptId, initializeTab, releaseTab]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExitToDashboard = () => {
    releaseTab();
    router.push("/tests");
  };

  if (sessionStatus === "loading") {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600 text-lg">
                Securing your exam session...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Please wait while we verify your session
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {sessionStatus === "active" ? children : null}

      {/* Session Conflict Dialog */}
      <AlertDialog open={showConflictDialog} onOpenChange={() => {}}>
        <AlertDialogContent className="w-[95vw] max-w-lg mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Multiple Tab Detection
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-gray-600">
                  For exam security, only one tab can be active at a time.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 font-medium text-sm">
                    This exam is already open in another tab or window.
                  </p>
                </div>
                <p className="text-gray-600 font-medium">
                  Please close all other exam tabs and click refresh below to
                  continue.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleRefresh}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Refresh and Continue
            </Button>
            <Button
              onClick={handleExitToDashboard}
              variant="outline"
              className="w-full"
            >
              Exit to Dashboard
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
