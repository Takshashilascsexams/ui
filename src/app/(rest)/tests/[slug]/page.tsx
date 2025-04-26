import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import { getBundleDetails } from "@/services/bundle.services";
import BundleDetails from "@/components/tests/slug/bundle_details";
import BundledExamsList from "@/components/tests/slug/bundled_exams_list";
import { Toaster } from "@/components/ui/sonner";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BundlePage({ params }: PageProps) {
  unstable_noStore();
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    // Fetch bundle details along with the bundled exams
    const bundleData = await getBundleDetails(decodedSlug);

    if (!bundleData) {
      return notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Bundle Header with Details */}
          <BundleDetails bundle={bundleData} />

          {/* List of Bundled Exams as Cards */}
          <BundledExamsList
            bundledExams={bundleData.bundledExams || []}
            hasAccess={bundleData.hasAccess}
          />

          <Toaster position="top-center" richColors />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching bundle details:", error);
    return notFound();
  }
}
