import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import Hero from "@/components/create-question/hero";

export default function Page() {
  return (
    <div className="w-full h-full relative overflow-y-auto">
      <BreadcrumbsHolder />
      <Hero />
    </div>
  );
}
