import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import ExamDetails from "@/components/dashboard/exams/exam-details";

export const metadata = {
  title: "Exam Details & Results",
  description: "View detailed results and statistics for an exam",
};

interface ExamDetailsPageProps {
  params: Promise<{ examId: string }>;
}

export default async function ExamDetailsPage({
  params,
}: ExamDetailsPageProps) {
  const { examId } = await params;

  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <BreadcrumbsHolder />
      <ExamDetails examId={examId} />
    </div>
  );
}
