import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { CATEGORIES } from "@/utils/constants";
import { fetchCategorizedExams } from "@/actions/client/fetchCategorizedExams";
import ExamCatalogueClient from "@/components/tests/test_catalogue";
import LoadingSkeleton from "@/components/tests/loading_skeleton";

async function ExamCatalogue() {
  unstable_noStore();
  const exams = await fetchCategorizedExams();
  console.log(exams);

  // Extract featured exams (if any)
  const featured = exams.data.categorizedExams["FEATURED"] || [];

  // Combine all other exams
  const allExams = Object.entries(exams.data.categorizedExams)
    .filter(([category]) => category !== "FEATURED")
    .flatMap(([, exams]) => exams);

  // Transform data to match the client component's expected structure
  const transformedExams = allExams.map((exam) => ({
    id: exam._id,
    title: exam.title,
    description: exam.description,
    category: exam.category,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    difficulty: exam.difficultyLevel,
    passPercentage: exam.passMarkPercentage,
    date: exam.createdAt,
    isFeatured: exam.isFeatured,
    isPremium: exam.isPremium,
    price: exam.price,
    discountPrice: exam.discountPrice,
    accessPeriod: exam.accessPeriod,
    hasAccess: exam.hasAccess ?? false,
  }));

  const transformedFeatured = featured.map((exam) => ({
    id: exam._id,
    title: exam.title,
    description: exam.description,
    category: exam.category,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    difficulty: exam.difficultyLevel,
    passPercentage: exam.passMarkPercentage,
    date: exam.createdAt,
    isFeatured: exam.isFeatured,
    isPremium: exam.isPremium,
    price: exam.price,
    discountPrice: exam.discountPrice,
    accessPeriod: exam.accessPeriod,
    hasAccess: exam.hasAccess ?? false,
  }));

  return (
    <ExamCatalogueClient
      initialExams={transformedExams}
      initialFeaturedExams={transformedFeatured}
      categories={CATEGORIES}
    />
  );
}

// Page component with suspense for loading state
export default function ExamsPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
              <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <LoadingSkeleton />
          </div>
        }
      >
        <ExamCatalogue />
      </Suspense>
    </div>
  );
}
