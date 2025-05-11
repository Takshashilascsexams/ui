import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import EditExamForm from "@/components/edit-exam/edit-exam-form";

export const metadata = {
  title: "Edit Exam",
  description: "Modify existing exam settings and details",
};

interface EditExamPageProps {
  params: Promise<{ examId: string }>;
}

export default async function EditExamPage({ params }: EditExamPageProps) {
  const { examId } = await params;

  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <BreadcrumbsHolder />
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full lg:w-[650px] px-8 py-10 mb-10 lg:border-[1px] lg:border-slate-300 lg:rounded-lg lg:shadow-md">
          <div className="mb-5">
            <h1 className="text-lg font-semibold">Edit Exam</h1>
          </div>
          <EditExamForm examId={examId} />
        </div>
      </div>
    </div>
  );
}
