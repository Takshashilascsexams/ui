"use client";
import { useParams } from "next/navigation";
import ExamContent from "@/components/exam/exam-content";

import { ExamProvider } from "@/context/exam.context";

export default function Page() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  return (
    <ExamProvider>
      <ExamContent attemptId={attemptId} />
    </ExamProvider>
  );
}
