"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import examService from "@/services/exam.services";
import LoadingSpinner from "@/components/ui/loading-spinner";
import QuestionDisplay from "@/components/exam/question-display";
import QuestionNavigation from "@/components/exam/question-navigation";
import ExamTimer from "@/components/exam/exam-timer";
import ExamHeader from "@/components/exam/exam-header";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ExamDetails,
  ExamProvider,
  Question,
  useExam,
} from "@/context/exam.context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define interfaces for pending answers
interface PendingAnswer {
  selectedOption: string | null;
  responseTime: number;
}

// Define proper types for the question options
interface QuestionOption {
  _id: string;
  optionText: string;
  isCorrect?: boolean;
}

// Define proper types for statements if needed
interface QuestionStatement {
  statementNumber: number;
  statementText: string;
  isCorrect?: boolean;
}

// Define the main exam component that wraps everything with the provider
export default function Page() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  return (
    <ExamProvider>
      <ExamContent attemptId={attemptId} />
    </ExamProvider>
  );
}

// The actual exam content, which uses the exam context
function ExamContent({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const { state, dispatch } = useExam();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isTimerSyncing, setIsTimerSyncing] = useState(false);

  // Refs for optimization
  const pendingAnswersRef = useRef<Map<string, PendingAnswer>>(new Map());
  const syncTimerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(navigator.onLine);
  const isSubmittingRef = useRef(false);
  const lastSyncTimeRef = useRef<number>(Date.now());

  // Sync pending answers with server
  const syncPendingAnswers = useCallback(
    async (isForced = false) => {
      if (
        pendingAnswersRef.current.size === 0 ||
        !isOnlineRef.current ||
        !state.attemptId
      )
        return;

      // Don't sync if we're not in-progress, unless forced
      if (state.status !== "in-progress" && !isForced) return;

      // Clone and clear the pending answers
      const pendingAnswers = new Map(pendingAnswersRef.current);
      if (!isForced) {
        pendingAnswersRef.current.clear();
      }

      // Process each pending answer
      for (const [questionId, answerData] of pendingAnswers.entries()) {
        try {
          await examService.saveAnswer(state.attemptId, questionId, {
            selectedOption: answerData.selectedOption as string,
            responseTime: answerData.responseTime,
          });
        } catch (err) {
          console.error(`Error saving answer for question ${questionId}:`, err);

          // If we're online but the request failed, retry adding it back to pending
          if (isOnlineRef.current && !isForced) {
            pendingAnswersRef.current.set(questionId, answerData);
          }

          if (!isForced) {
            toast.error(
              "Failed to save your answer. We'll retry automatically."
            );
          }
        }
      }
    },
    [state.attemptId, state.status]
  );

  // Sync timer with backend with reduced frequency (10 min default)
  const syncTimeRemaining = useCallback(async () => {
    if (
      !state.attemptId ||
      state.status !== "in-progress" ||
      !isOnlineRef.current
    )
      return;

    // Check if enough time has passed since last sync (enforcing minimum interval)
    const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
    const minimumSyncInterval = 60000; // 1 minute absolute minimum

    // Return early if we synced too recently, unless it's critical
    if (timeSinceLastSync < minimumSyncInterval && state.timeRemaining > 300) {
      // Schedule next check and exit
      if (syncTimerTimeoutRef.current) {
        clearTimeout(syncTimerTimeoutRef.current);
      }

      const timeRemaining = state.timeRemaining;
      let nextSyncDelay = 10 * 60000; // Default: 10 minutes

      // Adaptive timing based on exam conditions
      if (timeRemaining < 300) {
        // Less than 5 minutes remaining - sync every 2 minutes
        nextSyncDelay = 2 * 60000;
      } else if (timeRemaining < 600) {
        // Less than 10 minutes remaining - sync every 5 minutes
        nextSyncDelay = 5 * 60000;
      } else if (pendingAnswersRef.current.size > 20) {
        // Large number of pending answers - sync every 5 minutes
        nextSyncDelay = 5 * 60000;
      }

      // Schedule next sync
      syncTimerTimeoutRef.current = setTimeout(
        syncTimeRemaining,
        nextSyncDelay
      );
      return;
    }

    try {
      setIsTimerSyncing(true);

      await examService.updateTimeRemaining(
        state.attemptId,
        state.timeRemaining
      );

      // Update last sync time
      lastSyncTimeRef.current = Date.now();

      // If there are pending answers, sync them too
      if (pendingAnswersRef.current.size > 0) {
        await syncPendingAnswers();
      }
    } catch (err) {
      console.error("Error syncing time:", err);

      // Check if the error is due to rate limiting
      const isRateLimitError =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string" &&
        (err as { message: string }).message.includes(
          "Too many time update requests"
        );

      if (isRateLimitError) {
        console.warn("Rate limited by server. Extending sync interval.");
        // If rate limited, extend the next sync interval significantly
        syncTimerTimeoutRef.current = setTimeout(syncTimeRemaining, 15 * 60000); // 15 minutes
        setIsTimerSyncing(false);
        return; // Exit early with extended timeout
      }
      // Don't show error toast as this is a background operation
    } finally {
      setIsTimerSyncing(false);
    }

    // Schedule next sync
    if (syncTimerTimeoutRef.current) {
      clearTimeout(syncTimerTimeoutRef.current);
    }

    const timeRemaining = state.timeRemaining;
    let nextSyncDelay = 10 * 60000; // Default: 10 minutes

    // Adaptive timing based on exam conditions
    if (timeRemaining < 300) {
      // Less than 5 minutes remaining - sync every 2 minutes
      nextSyncDelay = 2 * 60000;
    } else if (timeRemaining < 600) {
      // Less than 10 minutes remaining - sync every 5 minutes
      nextSyncDelay = 5 * 60000;
    } else if (pendingAnswersRef.current.size > 20) {
      // Large number of pending answers - sync every 5 minutes
      nextSyncDelay = 5 * 60000;
    }

    // Schedule next sync
    syncTimerTimeoutRef.current = setTimeout(syncTimeRemaining, nextSyncDelay);
  }, [state.attemptId, state.status, state.timeRemaining, syncPendingAnswers]);

  // Track online status for better error handling
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      toast.success("You're back online");

      // Sync any pending answers when back online
      syncPendingAnswers();

      // Sync timer when back online
      if (state.attemptId && state.status === "in-progress") {
        syncTimeRemaining();
      }
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      toast.error(
        "You're offline. Don't worry, your answers will be saved when you reconnect."
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [state.attemptId, state.status, syncPendingAnswers, syncTimeRemaining]);

  // Load exam data on component mount
  useEffect(() => {
    const loadExamData = async () => {
      try {
        setLoading(true);

        // Add retry logic for critical API call
        let attempts = 0;
        let response;

        while (attempts < 3 && !response) {
          try {
            response = await examService.getExamQuestions(attemptId);
            break;
          } catch (err) {
            attempts++;
            if (attempts >= 3) throw err;

            // Exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
            );
          }
        }

        const { attempt, exam, questions } = response.data;

        // Format questions
        type QuestionData = {
          id: string;
          questionText: string;
          type: string;
          options: QuestionOption[];
          statements?: QuestionStatement[];
          statementInstruction?: string;
          marks: number;
          selectedOption: string | null;
          responseTime?: number;
        };

        const formattedQuestions: Question[] = questions.map(
          (q: QuestionData) => ({
            id: q.id,
            questionText: q.questionText,
            type: q.type,
            options: q.options,
            statements: q.statements || [],
            statementInstruction: q.statementInstruction || "",
            marks: q.marks,
            selectedOption: q.selectedOption,
            responseTime: q.responseTime || 0,
          })
        );

        // Set exam details
        const examDetails: ExamDetails = {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          totalQuestions: exam.totalQuestions,
          totalMarks: exam.totalMarks,
          passMarkPercentage: exam.passMarkPercentage,
          hasNegativeMarking: exam.hasNegativeMarking,
          negativeMarkingValue: exam.negativeMarkingValue,
          allowNavigation: exam.allowNavigation,
        };

        // Initialize the exam state
        dispatch({
          type: "START_EXAM",
          payload: {
            attemptId: attempt.id,
            timeRemaining: attempt.timeRemaining,
          },
        });
        dispatch({ type: "SET_EXAM_DETAILS", payload: examDetails });
        dispatch({ type: "SET_QUESTIONS", payload: formattedQuestions });
        dispatch({ type: "SET_STATUS", payload: attempt.status });

        // Record the initial sync time
        lastSyncTimeRef.current = Date.now();
      } catch (err) {
        console.error("Error loading exam:", err);
        toast.error("Failed to load exam. Redirecting back...");
        setTimeout(() => router.push("/tests"), 3000);
      } finally {
        setLoading(false);
      }
    };

    loadExamData();

    // Setup warning before user leaves the page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Sync pending answers before user leaves
      if (pendingAnswersRef.current.size > 0) {
        syncPendingAnswers(true);
      }

      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Clear any pending timeouts
      if (syncTimerTimeoutRef.current) {
        clearTimeout(syncTimerTimeoutRef.current);
      }
    };
  }, [attemptId, dispatch, router, syncPendingAnswers]);

  // Handle submitting the exam
  const handleSubmitExam = useCallback(async () => {
    if (!state.attemptId || isSubmittingRef.current) return;

    try {
      setSubmitting(true);
      isSubmittingRef.current = true;

      // Sync any pending answers first
      await syncPendingAnswers(true);

      // Final sync of time remaining
      if (state.status === "in-progress") {
        try {
          await examService.updateTimeRemaining(
            state.attemptId,
            state.timeRemaining
          );
        } catch (err) {
          console.error(
            "Error updating time remaining before submission:",
            err
          );
          // Continue with submission even if time update fails
        }
      }

      // Submit the exam with retry logic
      let attempts = 0;
      let success = false;

      while (attempts < 3 && !success) {
        try {
          await examService.submitExam(state.attemptId);
          success = true;
        } catch (err) {
          attempts++;
          console.error(`Submission attempt ${attempts} failed:`, err);

          if (attempts >= 3) throw err;

          // Wait with exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
          );
        }
      }

      // Redirect to results page
      router.push("/thankyou");
    } catch (err) {
      console.error("Error submitting exam:", err);
      toast.error("Failed to submit exam. Please try again.");
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, [
    state.attemptId,
    state.status,
    state.timeRemaining,
    router,
    syncPendingAnswers,
  ]);

  // Handle timer completion
  const handleTimerComplete = useCallback(async () => {
    if (!state.attemptId) return;

    try {
      // Update time to 0
      await examService.updateTimeRemaining(state.attemptId, 0);

      // Set status to timed-out
      dispatch({ type: "SET_STATUS", payload: "timed-out" });

      // Show alert and submit
      toast.warning("Time's up! Your exam will be submitted automatically.");

      // Auto-submit after a short delay
      setTimeout(() => handleSubmitExam(), 2000);
    } catch (err) {
      console.error("Error handling timer completion:", err);

      // Still try to submit even if time update fails
      setTimeout(() => handleSubmitExam(), 2000);
    }
  }, [state.attemptId, dispatch, handleSubmitExam]);

  // Handle saving an answer
  const saveAnswer = useCallback(
    async (questionId: string, selectedOption: string | null) => {
      if (!state.attemptId || state.status !== "in-progress") return;

      // Get the question from state
      const question = state.questions.find((q) => q.id === questionId);
      if (!question) return;

      // Calculate updated response time (for analytics)
      const responseTime = question.responseTime || 0;

      // Update local state first for immediate feedback
      dispatch({
        type: "SAVE_ANSWER",
        payload: { questionId, selectedOption },
      });

      // Add to pending answers queue instead of saving immediately
      pendingAnswersRef.current.set(questionId, {
        selectedOption,
        responseTime,
      });

      // Check if it's time to sync
      const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
      const pendingCount = pendingAnswersRef.current.size;

      // Sync if:
      // 1. More than 10 pending answers, or
      // 2. It's been more than 30 seconds since last sync, or
      // 3. The user is answering the last question
      if (
        pendingCount >= 10 ||
        timeSinceLastSync > 30000 ||
        (state.currentQuestionIndex === state.questions.length - 1 &&
          selectedOption !== null)
      ) {
        syncPendingAnswers();
      }
    },
    [
      state.attemptId,
      state.questions,
      state.status,
      state.currentQuestionIndex,
      dispatch,
      syncPendingAnswers,
    ]
  );

  // Navigate to next question
  const goToNextQuestion = useCallback(() => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      dispatch({
        type: "SET_CURRENT_QUESTION",
        payload: state.currentQuestionIndex + 1,
      });
    }
  }, [state.currentQuestionIndex, state.questions.length, dispatch]);

  // Navigate to previous question (if allowed)
  const goToPreviousQuestion = useCallback(() => {
    if (state.currentQuestionIndex > 0 && state.examDetails?.allowNavigation) {
      dispatch({
        type: "SET_CURRENT_QUESTION",
        payload: state.currentQuestionIndex - 1,
      });
    }
  }, [
    state.currentQuestionIndex,
    state.examDetails?.allowNavigation,
    dispatch,
  ]);

  // Navigate to a specific question (if allowed)
  const goToQuestion = useCallback(
    (index: number) => {
      if (
        index >= 0 &&
        index < state.questions.length &&
        state.examDetails?.allowNavigation
      ) {
        dispatch({ type: "SET_CURRENT_QUESTION", payload: index });
      }
    },
    [state.questions.length, state.examDetails?.allowNavigation, dispatch]
  );

  // Function to handle timer updates
  const handleTimeUpdate = useCallback(
    (time: number) => {
      dispatch({ type: "UPDATE_TIME", payload: time });
    },
    [dispatch]
  );

  // Effect to handle visibility change events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User is navigating away - try to sync timer if enough time has passed
        if (state.attemptId && state.status === "in-progress") {
          const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
          // Only sync if it's been at least 1 minute since last sync
          if (timeSinceLastSync > 60000) {
            // Use fetch with AbortController for background sync
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 2000);

            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/exam-attempt/time/${state.attemptId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${
                    localStorage.getItem("authToken") || ""
                  }`,
                },
                body: JSON.stringify({ timeRemaining: state.timeRemaining }),
                signal: controller.signal,
              }
            ).catch((err) => {
              // Silent catch - the user is leaving anyway
              console.error("Error syncing time before unload:", err);
            });
          }
        }
      } else if (document.visibilityState === "visible") {
        // User has returned - check if we need to sync
        const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
        if (timeSinceLastSync > 5 * 60000) {
          // Only if more than 5 minutes have passed
          syncTimeRemaining();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.attemptId, state.timeRemaining, state.status, syncTimeRemaining]);

  // Start timer sync on initial load
  useEffect(() => {
    if (state.attemptId && state.status === "in-progress") {
      syncTimeRemaining();
    }

    return () => {
      if (syncTimerTimeoutRef.current) {
        clearTimeout(syncTimerTimeoutRef.current);
      }
    };
  }, [state.attemptId, state.status, syncTimeRemaining]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!attemptId || !state.examDetails || state.questions.length === 0) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Exam
        </h1>
        <p className="mb-6">
          Failed to load exam data. Please try again later.
        </p>
        <Button onClick={() => router.push("/tests")}>Back to Tests</Button>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ExamHeader
        examDetails={state.examDetails}
        onExit={() => setShowExitDialog(true)}
        onSubmit={() => setShowSubmitDialog(true)}
        submitting={submitting}
      />

      <div className="flex-1 container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {currentQuestion && (
              <QuestionDisplay
                question={currentQuestion}
                onAnswerChange={saveAnswer}
                disabled={state.status !== "in-progress"}
              />
            )}

            <QuestionNavigation
              questions={state.questions}
              currentIndex={state.currentQuestionIndex}
              onNext={goToNextQuestion}
              onPrevious={goToPreviousQuestion}
              onNavigate={goToQuestion}
              allowNavigation={state.examDetails.allowNavigation}
              disabled={state.status !== "in-progress"}
            />
          </div>

          <div className="space-y-6">
            <ExamTimer
              timeRemaining={state.timeRemaining}
              onTimeUpdate={handleTimeUpdate}
              onTimeExpired={handleTimerComplete}
              isSyncing={isTimerSyncing}
            />

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Exam Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-medium">{state.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-medium">
                    {
                      state.questions.filter((q) => q.selectedOption !== null)
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unanswered:</span>
                  <span className="font-medium">
                    {
                      state.questions.filter((q) => q.selectedOption === null)
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">
                    {state.examDetails.totalMarks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pass Percentage:</span>
                  <span className="font-medium">
                    {state.examDetails.passMarkPercentage}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={state.status !== "in-progress" || submitting}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Exam"
                  )}
                </Button>
                {state.questions.some((q) => q.selectedOption === null) &&
                  state.status === "in-progress" && (
                    <p className="text-amber-600 text-xs mt-2">
                      {`You have unanswered questions. You can still submit if
                      you're done.`}
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit the exam? Your progress will be
              saved, but the timer will continue running.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Sync answers and timer before exiting
                syncPendingAnswers(true);
                syncTimeRemaining();
                router.push("/tests");
              }}
            >
              Exit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              {state.questions.some((q) => q.selectedOption === null) ? (
                <>
                  You have{" "}
                  {
                    state.questions.filter((q) => q.selectedOption === null)
                      .length
                  }{" "}
                  unanswered questions. Are you sure you want to submit your
                  exam?
                </>
              ) : (
                "Are you sure you want to submit your exam? You won't be able to change your answers after submission."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitExam}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Exam"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="top-center" richColors />
    </div>
  );
}
