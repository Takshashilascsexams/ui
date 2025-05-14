import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import StudentsDashboard from "@/components/dashboard/students/students-dashboard";

export const metadata = {
  title: "User Management Dashboard",
  description: "View and manage all users in the system",
};

export default function UsersPage() {
  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <BreadcrumbsHolder />
      <StudentsDashboard />
    </div>
  );
}
