"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import examService from "@/services/exam.services";
import LoadingSpinner from "@/components/ui/loading-spinner";
import QuestionDisplay from "@/components/exam/question-display";
import QuestionNavigation from "@/components/exam/question-navigation";
import ExamTimer from "@/components/exam/exam-timer";
import ExamHeader from "@/components/exam/exam-header";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExamDetails, Question, useExam } from "@/context/exam.context";
import {
  useExamSecurity,
  type SecurityViolation,
} from "@/hooks/useExamSecurity";
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

export default function ExamContent({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const { state, dispatch } = useExam();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isTimerSyncing, setIsTimerSyncing] = useState(false);
  const [serverTime, setServerTime] = useState<number | null>(null);

  //security states
  const [securityViolations, setSecurityViolations] = useState<
    SecurityViolation[]
  >([]);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);

  const {
    isMobile,
    isFullscreen,
    violationCount,
    enterFullscreen,
    exitFullscreen,
    maxViolations,
  } = useExamSecurity({
    isExamActive: state.status === "in-progress",
    maxViolations: 5,
    onSecurityViolation: (violation) => {
      // Log violation locally
      setSecurityViolations((prev) => [...prev, violation]);

      // Send to backend (optional)
      // if (state.attemptId) {
      //   examService
      //     .logSecurityViolation?.(state.attemptId, violation)
      //     .catch(console.error);
      // }

      // Show warning dialog on 2nd violation
      if (violationCount >= 1) {
        setShowSecurityDialog(true);
      }
    },
    onMaxViolationsReached: () => {
      toast.error(
        "Multiple security violations detected. Exam will be submitted."
      );
      setTimeout(() => handleSubmitExam(), 2000);
    },
  });

  // Refs for optimization
  const pendingAnswersRef = useRef<Map<string, PendingAnswer>>(new Map());
  const syncTimerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(navigator.onLine);
  const isSubmittingRef = useRef(false);
  const lastSyncTimeRef = useRef<number>(Date.now());
  const lastServerCheckTimeRef = useRef<number>(Date.now());

  // Sync pending answers with server using batch processing
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

      // Clone the pending answers
      const pendingAnswers = new Map(pendingAnswersRef.current);

      // Only clear if not forced - this maintains the behavior of the original code
      // where forced syncs (like during page unload) don't remove items from the queue
      if (!isForced) {
        pendingAnswersRef.current.clear();
      }

      try {
        // Convert the Map to an array for batch processing
        const batchAnswers = Array.from(pendingAnswers.entries()).map(
          ([questionId, answerData]) => ({
            questionId,
            selectedOption: answerData.selectedOption,
            responseTime: answerData.responseTime,
          })
        );

        // Send all answers in a single batch request
        await examService.saveBatchAnswers(state.attemptId, batchAnswers);

        // Update the last sync time
        lastSyncTimeRef.current = Date.now();
      } catch (err) {
        console.error(`Error saving batch answers:`, err);

        // If we're online but the request failed and not forced,
        // add the answers back to the pending queue
        if (isOnlineRef.current && !isForced) {
          for (const [questionId, answerData] of pendingAnswers.entries()) {
            pendingAnswersRef.current.set(questionId, answerData);
          }
        }

        if (!isForced) {
          toast.error(
            "Failed to save your answers. We'll retry automatically."
          );
        }
      }
    },
    [state.attemptId, state.status]
  );

  // Handle submitting the exam
  const handleSubmitExam = useCallback(async () => {
    if (!state.attemptId || isSubmittingRef.current) return;

    try {
      setSubmitting(true);
      isSubmittingRef.current = true;

      // Clear any timers immediately to prevent further API calls
      if (syncTimerTimeoutRef.current) {
        clearTimeout(syncTimerTimeoutRef.current);
        syncTimerTimeoutRef.current = null;
      }

      // Sync any pending answers first
      await syncPendingAnswers(true);

      // IMPORTANT CHANGE: Skip the time update entirely if status is timed-out
      // This prevents the "already timed-out" error
      if (state.status === "in-progress") {
        console.log("calling update time after timer is 0");
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
          // Check if the error is about exam being timed-out already
          if (
            err instanceof Error &&
            err.message.includes("already timed-out")
          ) {
            // Update our local state to match the server state
            dispatch({ type: "SET_STATUS", payload: "timed-out" });
          }
        }
      } else {
        console.log("Skipping time update - exam is already timed-out");
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

      // After successful submission
      if (success) {
        // Update local state to completed
        dispatch({ type: "SET_STATUS", payload: "completed" });

        // Use replace instead of push to prevent back navigation to exam
        router.replace(`/thankyou`);

        // Clear any remaining state/refs that might cause re-renders
        if (pendingAnswersRef.current) {
          pendingAnswersRef.current.clear();
        }
        if (syncTimerTimeoutRef.current) {
          clearTimeout(syncTimerTimeoutRef.current);
          syncTimerTimeoutRef.current = null;
        }
      }
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
    dispatch,
  ]);

  // Sync timer with backend with reduced frequency (10 min default)
  const syncTimeRemaining = useCallback(async () => {
    // Clear any existing timeout
    if (syncTimerTimeoutRef.current) {
      clearTimeout(syncTimerTimeoutRef.current);
      syncTimerTimeoutRef.current = null;
    }

    // Check conditions before proceeding
    if (
      !state.attemptId ||
      state.status !== "in-progress" ||
      !isOnlineRef.current ||
      isSubmittingRef.current ||
      state.timeRemaining <= 60 // Skip sync if less than 60 seconds remain
    ) {
      return;
    }

    // Calculate adaptive sync interval
    const calculateSyncInterval = () => {
      const timeRemaining = state.timeRemaining;

      // Ensure we have a valid duration, default to 3600 seconds (60 min)
      const totalDuration =
        (state.examDetails && state.examDetails.duration * 60) || 3600;

      // Guard against division by zero or negative values
      if (totalDuration <= 0) return 5 * 60000; // default 5 min if invalid

      // Calculate percentage and handle edge cases
      const percentRemaining = Math.min(
        100,
        Math.max(0, (timeRemaining / totalDuration) * 100)
      );

      if (percentRemaining < 10) {
        return 2 * 60000; // Last 10% of exam - sync every 2 minutes
      } else if (percentRemaining < 20) {
        return 4 * 60000; // 10-20% remaining - sync every 4 minutes
      } else if (percentRemaining < 50) {
        return 6 * 60000; // 20-50% remaining - sync every 6 minutes
      }
      return 8 * 60000; // More than 50% remaining - sync every 8 minutes
    };

    // Check if enough time has passed since last sync
    const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
    if (timeSinceLastSync < 60000) {
      // 1 minute minimum between syncs
      syncTimerTimeoutRef.current = setTimeout(
        syncTimeRemaining,
        calculateSyncInterval()
      );
      return;
    }

    try {
      setIsTimerSyncing(true);

      // Verify still in progress before updating
      if (state.status === "in-progress") {
        const response = await examService.updateTimeRemaining(
          state.attemptId,
          state.timeRemaining
        );

        // Update server time from response
        if (response.serverTime) {
          setServerTime(response.serverTime);
        }

        lastSyncTimeRef.current = Date.now();

        // Sync pending answers if needed
        if (pendingAnswersRef.current.size > 0) {
          await syncPendingAnswers();
        }
      }
    } catch (err) {
      // Handle "already timed-out" error
      if (err instanceof Error && err.message.includes("already timed-out")) {
        dispatch({ type: "SET_STATUS", payload: "timed-out" });
        setIsTimerSyncing(false);
        toast.warning("Time's up! Your exam will be submitted automatically.");
        setTimeout(() => handleSubmitExam(), 2000);
        return;
      }

      // Handle rate limiting
      if (
        err instanceof Error &&
        err.message.includes("Too many time update requests")
      ) {
        syncTimerTimeoutRef.current = setTimeout(syncTimeRemaining, 5 * 60000);
        setIsTimerSyncing(false);
        return;
      }
    } finally {
      setIsTimerSyncing(false);
    }

    // Schedule next sync if still in progress
    if (state.status === "in-progress") {
      syncTimerTimeoutRef.current = setTimeout(
        syncTimeRemaining,
        calculateSyncInterval()
      );
    }
  }, [
    state.attemptId,
    state.examDetails,
    state.status,
    state.timeRemaining,
    syncPendingAnswers,
    dispatch,
    handleSubmitExam,
  ]);

  // Fetch server time and sync it with the UI
  const checkServerTime = useCallback(async () => {
    if (!state.attemptId || state.status !== "in-progress") return;

    // Calculate adaptive interval based on time remaining
    const getAdaptiveInterval = () => {
      const timeRemaining = state.timeRemaining;

      // Ensure we have a valid duration, default to 3600 seconds (60 min)
      const totalDuration =
        (state.examDetails && state.examDetails.duration * 60) || 3600;

      // Guard against division by zero or negative values
      if (totalDuration <= 0) return 3 * 60000; // default 3 min if invalid

      // Calculate percentage and handle edge cases
      const percentRemaining = Math.min(
        100,
        Math.max(0, (timeRemaining / totalDuration) * 100)
      );

      if (percentRemaining < 5) {
        return 45 * 1000; // Last 5% - check every 45 seconds
      } else if (percentRemaining < 15) {
        return 90 * 1000; // 5-15% remaining - check every 90 seconds
      } else if (percentRemaining < 30) {
        return 3 * 60 * 1000; // 15-30% remaining - check every 3 minutes
      }
      return 4 * 60 * 1000; // More than 30% remaining - check every 4 minutes
    };

    // Check if enough time has passed since last check
    const now = Date.now();
    const minInterval = getAdaptiveInterval();

    if (now - lastServerCheckTimeRef.current < minInterval) return;
    lastServerCheckTimeRef.current = now;

    try {
      const response = await examService.getTimeCheck(state.attemptId);

      if (response?.data) {
        // Update time remaining from server
        dispatch({
          type: "UPDATE_TIME",
          payload: response.data.timeRemaining,
        });

        // Update server time
        if (response.data.serverTime) {
          setServerTime(response.data.serverTime);
        }

        // Check if timed out
        if (response.data.status === "timed-out") {
          dispatch({ type: "SET_STATUS", payload: "timed-out" });
          // Auto-submit after a short delay
          setTimeout(() => handleSubmitExam(), 2000);
        }
      }
    } catch (error) {
      console.error("Error checking server time:", error);
    }
  }, [
    state.attemptId,
    state.examDetails,
    state.status,
    state.timeRemaining,
    dispatch,
    handleSubmitExam,
  ]);

  // Check exam-attempt status on load
  useEffect(() => {
    const checkExamStatus = async () => {
      try {
        const response = await examService.checkExamStatus(attemptId);
        if (
          response.status === "completed" ||
          response.status === "timed-out"
        ) {
          // Redirect to results or thank you page
          router.replace(`/thankyou`);
        }
      } catch (error) {
        // If error indicates the exam is completed, redirect
        if (
          error instanceof Error &&
          error.message.includes("already completed")
        ) {
          router.replace(`/thankyou`);
        }
      }
    };

    checkExamStatus();
  }, [attemptId, router]);

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

  // Add server time check on component mount and reconnection
  useEffect(() => {
    // Check server time on mount
    checkServerTime();

    // Set up online event listener
    const handleOnline = () => {
      isOnlineRef.current = true;
      toast.success("You're back online");

      // Check server time for accurate time remaining
      checkServerTime();

      // Sync any pending answers when back online
      syncPendingAnswers();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [checkServerTime, syncPendingAnswers]);

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

        // Capture server time if provided
        if (response.data?.attempt?.serverTime) {
          setServerTime(response.data.attempt.serverTime);
        }

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
        setTimeout(() => router.push("/thankyou"), 3000);
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

  // Effect to cleanup existing refs on unmount
  useEffect(() => {
    // Store the current ref values in local variables
    // that will be captured in the closure for the cleanup function
    const pendingAnswersRefValue = pendingAnswersRef.current;
    const syncTimerTimeoutRefValue = syncTimerTimeoutRef.current;

    return () => {
      // Use the captured values instead of accessing .current directly
      if (syncTimerTimeoutRefValue) {
        clearTimeout(syncTimerTimeoutRefValue);
      }

      // Clear any pending operations safely using the captured value
      if (
        pendingAnswersRefValue &&
        typeof pendingAnswersRefValue.clear === "function"
      ) {
        pendingAnswersRefValue.clear();
      }

      // Reset exam state if needed
      dispatch({ type: "CLEANUP" });
    };
  }, [dispatch]);

  // Smooth scroll to top when question changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [state.currentQuestionIndex]);

  // AUTO-ENTER FULLSCREEN
  useEffect(() => {
    if (state.status === "in-progress" && !isMobile) {
      enterFullscreen();
    }
    return () => {
      exitFullscreen();
    };
  }, [state.status, isMobile, enterFullscreen, exitFullscreen]);

  // Handle timer completion
  const handleTimerComplete = useCallback(async () => {
    if (!state.attemptId) return;

    // Clear any existing timer sync timeout
    if (syncTimerTimeoutRef.current) {
      clearTimeout(syncTimerTimeoutRef.current);
      syncTimerTimeoutRef.current = null;
    }

    // Set local status first to prevent further update attempts
    dispatch({ type: "SET_STATUS", payload: "timed-out" });
    dispatch({ type: "UPDATE_TIME", payload: 0 });

    // Show alert to user
    toast.warning("Time's up! Your exam will be submitted automatically.");

    // Skip updating the server time - if our local time is 0, server is likely
    // already aware or will be informed during submission

    // Auto-submit after a short delay
    setTimeout(() => handleSubmitExam(), 2000);
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
      // 2. It's been more than 180 seconds since last sync, or
      // 3. The user is answering the last question
      if (
        pendingCount >= 10 ||
        timeSinceLastSync > 180000 ||
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

  // Enter full screen button
  const FullscreenReentryButton = () => {
    if (isMobile || isFullscreen) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={enterFullscreen}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <span>🖥️</span>
          <span className="text-sm font-medium">Enter Fullscreen</span>
        </button>
      </div>
    );
  };

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
  const isSubmitDisabled =
    state.status !== "in-progress" ||
    submitting ||
    state.currentQuestionIndex !== state.questions.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 exam-secure">
      <ExamHeader
        examDetails={state.examDetails}
        onSubmit={() => setShowSubmitDialog(true)}
        submitting={submitting}
        submitDisabled={isSubmitDisabled}
      />

      {/* Enter full screen button */}
      <FullscreenReentryButton />

      <div className="flex-1 container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {currentQuestion && (
              // Question display
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={state.currentQuestionIndex + 1}
                onAnswerChange={saveAnswer}
                disabled={state.status !== "in-progress"}
              />
            )}

            {/* Questions navigation */}
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

          {/* Exam timer */}
          <div className="space-y-6">
            {currentQuestion && (
              <ExamTimer
                timeRemaining={state.timeRemaining}
                onTimeUpdate={handleTimeUpdate}
                onTimeExpired={handleTimerComplete}
                isSyncing={isTimerSyncing}
                serverTime={serverTime || undefined} // Pass undefined when null for proper typing
              />
            )}

            {/* Exam summary section */}
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
                  <span className="text-gray-600">Pass Mark:</span>
                  <span className="font-medium">
                    {Math.ceil(
                      (state.examDetails.passMarkPercentage / 100) *
                        state.examDetails.totalMarks
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                {/* Submit button enabled only on last question */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={isSubmitDisabled}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Exam"
                  )}
                </Button>

                <div className="text-xs text-gray-500 space-y-1">
                  {state.currentQuestionIndex !==
                    state.questions.length - 1 && (
                    <p className="text-amber-600 font-medium">
                      • Submit button will be enabled when you reach the last
                      question
                    </p>
                  )}
                  {state.questions.some((q) => q.selectedOption === null) &&
                    state.status === "in-progress" && (
                      <p className="text-amber-600">
                        • You have unanswered questions. You can still submit
                        when ready.
                      </p>
                    )}
                  {state.currentQuestionIndex ===
                    state.questions.length - 1 && (
                    <p className="text-green-600 font-medium">
                      • You can now submit your exam
                    </p>
                  )}
                </div>
              </div>

              {/* 🎯 ADD THE SECURITY STATUS HERE */}
              <div className="flex justify-between">
                <span className="text-gray-600">Security:</span>
                <span
                  className={`font-medium ${
                    violationCount === 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {violationCount === 0
                    ? "✓ Secure"
                    : `⚠ ${violationCount}/${maxViolations}`}
                </span>
              </div>

              {/* 🎯 ADD THE FULLSCREEN STATUS HERE */}
              {!isMobile && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fullscreen:</span>
                  <span
                    className={`font-medium ${
                      isFullscreen ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {isFullscreen ? "✓ Active" : "○ Inactive"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="w-[95vw] max-w-md sm:mx-0 rounded-lg">
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

      {/* Security alert dialog */}
      <AlertDialog
        open={showSecurityDialog}
        onOpenChange={setShowSecurityDialog}
      >
        <AlertDialogContent className="w-[95vw] max-w-md sm:mx-0 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-600">
              ⚠️ Security Warning
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Security violations detected during your exam:
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <ul className="text-sm space-y-1">
                    {securityViolations.slice(-3).map((violation, index) => (
                      <li key={index} className="text-amber-800">
                        • {violation.type.replace("_", " ")} at{" "}
                        {new Date(violation.timestamp).toLocaleTimeString()}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                  <strong>Warning:</strong> {maxViolations - violationCount}{" "}
                  more violations will result in automatic exam submission.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowSecurityDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              I Understand - Continue Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="top-center" richColors />
    </div>
  );
}
