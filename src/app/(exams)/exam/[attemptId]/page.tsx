"use client";
import { useParams } from "next/navigation";
import ExamContentWithGuard from "@/components/exam/exam-content-with-guard";

import { ExamProvider } from "@/context/exam.context";

export default function Page() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  return (
    <ExamProvider>
      <ExamContentWithGuard attemptId={attemptId} />
    </ExamProvider>
  );
}
