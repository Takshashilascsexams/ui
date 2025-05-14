import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import StudentResultDetails from "@/components/results/student-result-details";

export const metadata = {
  title: "Student Exam Result",
  description: "View detailed result for student exam attempt",
};

interface StudentResultPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function StudentResultPage({
  params,
}: StudentResultPageProps) {
  const { attemptId } = await params;

  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <BreadcrumbsHolder />
      <StudentResultDetails attemptId={attemptId} />
    </div>
  );
}
