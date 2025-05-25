import { Metadata } from "next";
import { unstable_noStore } from "next/cache";
import { Suspense } from "react";
import { CATEGORIES } from "@/utils/constants";
import { fetchCategorizedExams } from "@/actions/client/fetchCategorizedExams";
import ExamCatalogueClient from "@/components/tests/test_catalogue";
import LoadingSkeleton from "@/components/tests/loading_skeleton";

export const metadata: Metadata = {
  title: "Exam Catalogue - Takshashila School of Civil Services",
  description:
    "Browse and take exams to enhance your preparation. Access test series, screening tests, scholarship exams and more for civil services preparation.",
};

async function ExamCatalogue() {
  unstable_noStore();
  const exams = await fetchCategorizedExams();

  // Extract featured exams (if any)
  const featured = exams.data.categorizedExams["FEATURED"] || [];
  const bundled = exams.data.categorizedExams["BUNDLE"] || [];

  // Combine all other exams
  const allExams = Object.entries(exams.data.categorizedExams)
    .filter(([category]) => category !== "FEATURED" && category !== "BUNDLE")
    .flatMap(([, exams]) => exams)
    .filter((exam) => !exam.isPartOfBundle);

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
    hasAttemptAccess: exam.hasAttemptAccess ?? true,
    attemptCount: exam.attemptCount ?? 0,
    allowMultipleAttempts: exam.allowMultipleAttempts ?? false,
    maxAttempt: exam.maxAttempt ?? 1,
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
    hasAttemptAccess: exam.hasAttemptAccess ?? true,
    attemptCount: exam.attemptCount ?? 0,
    allowMultipleAttempts: exam.allowMultipleAttempts ?? false,
    maxAttempt: exam.maxAttempt ?? 1,
  }));

  const transformedBundle = bundled.map((exam) => ({
    id: exam._id,
    title: exam.title,
    description: exam.description,
    bundledExams: exam.bundledExams,
    category: exam.category,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    difficulty: exam.difficultyLevel,
    passPercentage: exam.passMarkPercentage,
    isFeatured: exam.isFeatured,
    isPremium: exam.isPremium,
    price: exam.price,
    discountPrice: exam.discountPrice,
    accessPeriod: exam.accessPeriod,
    hasAccess: exam.hasAccess ?? false,
    date: exam.createdAt,
    hasAttemptAccess: exam.hasAttemptAccess ?? true,
    attemptCount: exam.attemptCount ?? 0,
    allowMultipleAttempts: exam.allowMultipleAttempts ?? false,
    maxAttempt: exam.maxAttempt ?? 1,
  }));

  return (
    <ExamCatalogueClient
      initialExams={transformedExams}
      initialFeaturedExams={transformedFeatured}
      initialBundledExams={transformedBundle}
      categories={CATEGORIES}
    />
  );
}

// Page component with suspense for loading state
export default function ExamsPage() {
  return (
    <div className="w-full min-h-screen">
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
