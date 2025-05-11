import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import ExamDashboard from "@/components/dashboard/exams/exam-dashboard";

export const metadata = {
  title: "Exam Management Dashboard",
  description: "View and manage all exams in the system",
};

export default function ExamsPage() {
  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <BreadcrumbsHolder />
      <ExamDashboard />
    </div>
  );
}
