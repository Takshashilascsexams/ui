import Hero from "@/components/create-exam/hero";
import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";

export default function Page() {
  return (
    <div className="w-full h-full relative overflow-y-auto">
      <BreadcrumbsHolder />
      <Hero />
    </div>
  );
}
