"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import examService from "@/services/exam.services";
import LoadingSpinner from "@/components/ui/loading-spinner";
import QuestionDisplay from "@/components/exam/question-display";
import QuestionNavigation from "@/components/exam/question-navigation";
import ExamTimer from "@/components/exam/exam-timer";
import ExamHeader from "@/components/exam/exam-header";
import {
  ExamDetails,
  ExamProvider,
  Question,
  useExam,
} from "@/context/exam.context";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

// Define the main exam component that wraps everything with the provider
export default function ExamAttemptPage() {
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

  // Load exam data on component mount
  useEffect(() => {
    const loadExamData = async () => {
      try {
        setLoading(true);
        const response = await examService.getExamQuestions(attemptId);

        const { attempt, exam, questions } = response.data;

        // Format questions
        type QuestionData = {
          id: string;
          questionText: string;
          type: string;
          options: string[];
          statements?: string[];
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
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [attemptId, dispatch, router]);

  // Sync timer with backend periodically
  useEffect(() => {
    if (!state.attemptId || state.status !== "in-progress") return;

    const syncTimeRemaining = async () => {
      try {
        setIsTimerSyncing(true);
        await examService.updateTimeRemaining(
          state.attemptId!,
          state.timeRemaining
        );
      } catch (err) {
        console.error("Error syncing time:", err);
      } finally {
        setIsTimerSyncing(false);
      }
    };

    // Sync every minute
    const intervalId = setInterval(syncTimeRemaining, 60000);

    return () => clearInterval(intervalId);
  }, [state.attemptId, state.timeRemaining, state.status]);

  // Handle submitting the exam
  const handleSubmitExam = useCallback(async () => {
    if (!state.attemptId) return;

    try {
      setSubmitting(true);

      // Final sync of time remaining
      if (state.status === "in-progress") {
        await examService.updateTimeRemaining(
          state.attemptId,
          state.timeRemaining
        );
      }

      // Submit the exam
      await examService.submitExam(state.attemptId);

      // Redirect to results page
      router.push("/thankyou");
    } catch (err) {
      console.error("Error submitting exam:", err);
      toast.error("Failed to submit exam. Please try again.");
      setSubmitting(false);
    }
  }, [state.attemptId, state.status, state.timeRemaining, router]);

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
    }
  }, [state.attemptId, dispatch, handleSubmitExam]);

  // Handle saving an answer
  const saveAnswer = useCallback(
    async (questionId: string, selectedOption: string | null) => {
      if (!state.attemptId || state.status !== "in-progress") return;

      // Get the question from state
      const question = state.questions.find((q) => q.id === questionId);
      if (!question) return;

      // Update local state first for immediate feedback
      dispatch({
        type: "SAVE_ANSWER",
        payload: { questionId, selectedOption },
      });

      try {
        // Calculate response time (for analytics)
        const responseTime = question.responseTime || 0;

        // Save to backend
        await examService.saveAnswer(state.attemptId, questionId, {
          selectedOption: selectedOption as string,
          responseTime,
        });
      } catch (err) {
        console.error("Error saving answer:", err);
        toast.error("Failed to save your answer. Please try again.");
      }
    },
    [state.attemptId, state.questions, state.status, dispatch]
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

  // Function to handle timer updates - moved outside of render
  const handleTimeUpdate = useCallback(
    (time: number) => {
      dispatch({ type: "UPDATE_TIME", payload: time });
    },
    [dispatch]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!state.examDetails || state.questions.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
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
            <AlertDialogAction onClick={() => router.push("/tests")}>
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
