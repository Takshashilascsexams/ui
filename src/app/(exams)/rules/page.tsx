"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Clock, FileText, Info } from "lucide-react";
import { Toaster } from "sonner";
import { toast } from "sonner";
import examService from "@/services/exam.services";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface ExamRules {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  passMarkPercentage: number;
  hasNegativeMarking: boolean;
  negativeMarkingValue: number;
  allowNavigation: boolean;
  isPremium: boolean;
  hasAccess: boolean;
  rules: string[];
}

// Create a client component that uses useSearchParams
function ExamRulesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");

  const [rules, setRules] = useState<ExamRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      if (!examId) {
        setError("No exam ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await examService.getExamRules(examId);
        setRules(response.data.exam);
      } catch (err) {
        console.error("Error fetching exam rules:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch exam rules"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [examId]);

  const handleStartExam = async () => {
    if (!examId) return;

    try {
      setStarting(true);
      const response = await examService.startExam(examId);

      // Redirect to exam page with attempt ID
      if (response.data.attemptId) {
        router.push(`/exam/${response.data.attemptId}`);
      }
    } catch (err) {
      console.error("Error starting exam:", err);
      toast.error(err instanceof Error ? err.message : "Failed to start exam");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !rules) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Failed to load exam rules. Please try again later."}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/tests")}>Back to Tests</Button>
        </div>
      </div>
    );
  }

  // Check access for premium exams
  if (rules.isPremium && !rules.hasAccess) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{rules.title}</CardTitle>
            <CardDescription>{rules.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
              <Info className="h-4 w-4" />
              <AlertTitle>Premium Exam</AlertTitle>
              <AlertDescription>
                This is a premium exam. You need to purchase it before you can
                take it.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/tests")}>
              Back to Tests
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => router.push(`/tests?examId=${examId}`)}
            >
              Purchase Exam
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-2xl">{rules.title}</CardTitle>
          </div>
          <CardDescription className="text-base">
            {rules.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Exam Duration</span>
              </div>
              <p className="text-gray-700">{rules.duration} minutes</p>
            </div>

            <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Total Questions</span>
              </div>
              <p className="text-gray-700">{rules.totalQuestions} questions</p>
            </div>

            <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-medium">Maximum Marks</span>
              </div>
              <p className="text-gray-700">{rules.totalMarks} marks</p>
            </div>

            <div className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-medium">Pass Percentage</span>
              </div>
              <p className="text-gray-700">{rules.passMarkPercentage}%</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-lg font-medium mb-4">Exam Rules</h3>
            <ul className="space-y-3">
              {rules.rules.map((rule, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 min-w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{rule}</p>
                </li>
              ))}
            </ul>
          </div>

          <Alert className="bg-blue-50 border-blue-200 text-blue-800 mt-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Important Information</AlertTitle>
            <AlertDescription>
              {rules.allowNavigation
                ? "You can navigate between questions freely during the exam."
                : "Once you move to the next question, you cannot go back."}
              {rules.hasNegativeMarking
                ? ` There is negative marking of ${rules.negativeMarkingValue} marks for each wrong answer.`
                : " There is no negative marking for wrong answers."}
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => router.push("/tests")}>
            Back to Tests
          </Button>

          <Button
            onClick={handleStartExam}
            disabled={starting}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {starting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Starting
              </>
            ) : (
              "Start Exam"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Toaster position="top-center" richColors />
    </div>
  );
}

// This is the main component that wraps the content with Suspense
export default function ExamRulesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
          <p>Loading exam details...</p>
        </div>
      }
    >
      <ExamRulesContent />
    </Suspense>
  );
}
