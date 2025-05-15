import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import QuestionsDashboard from "@/components/dashboard/questions/questions-dashboard";

export const metadata = {
  title: "Question Management Dashboard",
  description: "View and manage all questions in the system",
};

export default function QuestionsPage() {
  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <BreadcrumbsHolder />
      <QuestionsDashboard />
    </div>
  );
}
