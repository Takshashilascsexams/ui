import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import EditQuestionForm from "@/components/dashboard/questions/edit-question-form";

export const metadata = {
  title: "Edit Question",
  description: "Modify existing question details",
};

interface EditQuestionPageProps {
  params: Promise<{ questionId: string }>;
}

export default async function EditQuestionPage({
  params,
}: EditQuestionPageProps) {
  const { questionId } = await params;

  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <BreadcrumbsHolder />
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full lg:w-[750px] px-8 py-10 mb-10 lg:border-[1px] lg:border-slate-300 lg:rounded-lg lg:shadow-md">
          <div className="mb-5">
            <h1 className="text-lg font-semibold">Edit Question</h1>
          </div>
          <EditQuestionForm questionId={questionId} />
        </div>
      </div>
    </div>
  );
}
