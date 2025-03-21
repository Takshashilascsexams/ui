import { Plus } from "lucide-react";
import Link from "next/link";
import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";

export default function Page() {
  return (
    <div className="w-full h-full relative overflow-y-auto">
      <BreadcrumbsHolder />
      <Link
        href={"/dashboard/exams/create-exam"}
        className="w-36 h-9 mt-28 ml-14 flex items-center justify-center gap-2 bg-customButtonBg hover:bg-customButtonHover text-white text-[0.875rem] rounded-lg"
      >
        <Plus size={18} /> Create test
      </Link>
    </div>
  );
}
