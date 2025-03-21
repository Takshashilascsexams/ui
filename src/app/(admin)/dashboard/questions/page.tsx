import Link from "next/link";
import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";

export default function Page() {
  return (
    <div className="w-full h-full relative overflow-y-auto">
      <BreadcrumbsHolder />
      <Link
        href={"/dashboard/questions/create-question"}
        className="px-4 py-2 bg-customButtonBg rounded-md text-white"
      >
        Add questions
      </Link>
    </div>
  );
}
