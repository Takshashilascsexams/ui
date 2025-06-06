"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ITEMS_PER_PAGE } from "@/utils/constants";
import { ExamType, CategoryType } from "@/types/examTypes";
import { navigateToExamRules } from "@/services/tests.services";
import PageHeader from "./page_header";
import CategoryTabs from "./category_tabs";
import FeaturedExams from "./featured_tests";
import ExamList from "./exam_list";
import LoadingSkeleton from "./loading_skeleton";
import EmptyState from "./empty_state";
import Pagination from "./pagination";
import PurchaseModal from "./purchase_modal";
import BundleList from "./bundle_list";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import ExamDetailsDialog from "./exam_details_dialog";
import {
  revalidateCategorizedExams,
  fetchCategorizedExams,
} from "@/actions/client/fetchCategorizedExams";
import {
  applyFilters,
  updateUrlWithPage,
  getQueryParam,
  clearParams,
} from "@/utils/tests.utils";

interface ExamCatalogueClientProps {
  initialExams: ExamType[];
  initialFeaturedExams: ExamType[];
  initialBundledExams: ExamType[];
  categories: CategoryType[];
}

export default function ExamCatalogueClient({
  initialExams,
  initialFeaturedExams,
  categories,
  initialBundledExams,
}: ExamCatalogueClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading] = useState(false);
  const [exams, setExams] = useState<ExamType[]>(initialExams);
  const [featuredExams, setFeaturedExams] =
    useState<ExamType[]>(initialFeaturedExams);
  const [bundledExams, setBundledExams] =
    useState<ExamType[]>(initialBundledExams);
  const [filteredExams, setFilteredExams] = useState<ExamType[]>(initialExams);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(initialExams.length / ITEMS_PER_PAGE)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [processingExamIds, setProcessingExamIds] = useState<string[]>([]);

  const router = useRouter();

  // Initialize state client-side only after component mounts
  useEffect(() => {
    // Apply initial filters
    const filtered = applyFilters(exams, activeCategory, searchQuery);
    setFilteredExams(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));

    // Get page from URL if available (client-side only)
    const pageParam = getQueryParam("page");
    if (pageParam) {
      const page = parseInt(pageParam, 10);
      setCurrentPage(isNaN(page) ? 1 : page);
    }
  }, [exams, activeCategory, searchQuery]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchQuery("");

    const filtered = applyFilters(exams, category, searchQuery);
    setFilteredExams(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    clearParams(); // clear url params
    setCurrentPage(1); // Reset to first page
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = applyFilters(exams, activeCategory, query);
    setFilteredExams(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    const filtered = applyFilters(exams, activeCategory, "");
    setFilteredExams(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlWithPage(page);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset filters
  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    const filtered = applyFilters(exams, "all", "");
    setFilteredExams(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  };

  // View exam details - Updated to show details dialog
  const viewExamDetails = (examId: string) => {
    const exam = [...exams, ...featuredExams].find((e) => e.id === examId);

    if (exam) {
      setSelectedExam(exam);
      setIsDetailsDialogOpen(true);
    }
  };

  // ✅ UPDATED: Enhanced handleStartExam with attempt access control
  const handleStartExam = (examId: string) => {
    const exam = [...exams, ...featuredExams].find((e) => e.id === examId);

    if (!exam) {
      toast.error("Exam not found");
      return;
    }

    // Check payment access first
    if (exam.isPremium && !exam.hasAccess) {
      // User needs to purchase the exam
      setSelectedExam(exam);
      setIsPurchaseModalOpen(true);
      return;
    }

    // ✅ NEW: Check attempt access
    if (!(exam.hasAttemptAccess ?? true)) {
      const allowMultiple = exam.allowMultipleAttempts || false;
      const maxAttempt = exam.maxAttempt || 1;
      const attemptCount = exam.attemptCount || 0;

      if (!allowMultiple) {
        toast.error("You have already attempted this exam", {
          description: "This exam allows only one attempt per user.",
        });
      } else {
        toast.error(
          `All attempts have been used (${attemptCount}/${maxAttempt})`,
          {
            description:
              "You have reached the maximum number of attempts for this exam.",
          }
        );
      }
      return;
    }

    // User has both payment and attempt access
    navigateToExamRules(examId);
  };

  // Add a handle purchase function
  const handlePurchaseExam = (examId: string) => {
    const exam = [...exams, ...featuredExams, ...bundledExams].find(
      (e) => e.id === examId
    );

    if (!exam) {
      toast.error("Exam not found");
      return;
    }

    setSelectedExam(exam);
    setIsPurchaseModalOpen(true);
  };

  // ✅ UPDATED: Enhanced payment success handler to include attempt data
  const handlePaymentSuccess = async () => {
    try {
      // Invalidate the cache first
      await revalidateCategorizedExams();

      // Explicitly fetch fresh data
      const freshData = await fetchCategorizedExams();

      // Update all state with the fresh data
      if (freshData.status === "success") {
        // Extract all non-featured exams
        const allExams = Object.entries(freshData.data.categorizedExams)
          .filter(
            ([category]) => category !== "FEATURED" && category !== "BUNDLE"
          )
          .flatMap(([, exams]) =>
            exams.map((exam) => ({
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
              isPartOfBundle: exam.isPartOfBundle ? true : false,
              price: exam.price,
              discountPrice: exam.discountPrice,
              accessPeriod: exam.accessPeriod,
              hasAccess: exam.hasAccess ?? false,
              // ✅ NEW: Include attempt-related fields
              hasAttemptAccess: exam.hasAttemptAccess ?? true,
              attemptCount: exam.attemptCount ?? 0,
              allowMultipleAttempts: exam.allowMultipleAttempts ?? false,
              maxAttempt: exam.maxAttempt ?? 1,
            }))
          )
          .filter((exam) => !exam.isPartOfBundle);

        // Extract featured exams
        const featured = (
          freshData.data.categorizedExams["FEATURED"] || []
        ).map((exam) => ({
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
          // ✅ NEW: Include attempt-related fields
          hasAttemptAccess: exam.hasAttemptAccess ?? true,
          attemptCount: exam.attemptCount ?? 0,
          allowMultipleAttempts: exam.allowMultipleAttempts ?? false,
          maxAttempt: exam.maxAttempt ?? 1,
        }));

        // Extract bundled exams
        const bundled = (freshData.data.categorizedExams["BUNDLE"] || []).map(
          (exam) => ({
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
            isPartOfBundle: exam.isPartOfBundle ? true : false,
            bundledExams: exam.bundledExams?.length ? exam.bundledExams : [],
            price: exam.price,
            discountPrice: exam.discountPrice,
            accessPeriod: exam.accessPeriod,
            hasAccess: exam.hasAccess ?? false,
            // ✅ NEW: Include attempt-related fields
            hasAttemptAccess: exam.hasAttemptAccess ?? true,
            attemptCount: exam.attemptCount ?? 0,
            allowMultipleAttempts: exam.allowMultipleAttempts ?? false,
            maxAttempt: exam.maxAttempt ?? 1,
          })
        );

        // Update state with fresh data
        setExams(allExams);
        setFeaturedExams(featured);
        setBundledExams(bundled);

        // Apply current filters to the fresh data
        const filtered = applyFilters(allExams, activeCategory, searchQuery);
        setFilteredExams(filtered);
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));

        // Clear the processing state for all exams since we have fresh data
        setProcessingExamIds([]);
      }

      toast.success("Purchase successful! You now have access to this exam.");
    } catch (error) {
      console.error("Error updating exam access:", error);

      // Even on error, we should clear processing state to allow retries
      setProcessingExamIds([]);

      toast.error(
        "There was an issue updating your access. Please refresh the page."
      );
    }
  };

  // Open bundle exam
  const handleOpenBundle = (bundleId: string) => {
    if (!bundleId) return;

    router.push(`/tests/${bundleId}`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Header with search */}
        <PageHeader
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClearSearch={clearSearch}
          onFilterToggle={() => setFilterOpen(!filterOpen)}
        />

        {/* Category tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Main Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Bundle exams - shown only on "all" tab with no search */}
            {!searchQuery &&
              activeCategory === "all" &&
              bundledExams.length > 0 && (
                <BundleList
                  bundles={bundledExams}
                  onOpenBundle={handleOpenBundle}
                  onPurchaseExam={handlePurchaseExam}
                  processingExamIds={processingExamIds}
                />
              )}

            {/* Featured exams - shown only on "all" tab with no search */}
            {!searchQuery &&
              activeCategory === "all" &&
              featuredExams.length > 0 && (
                <FeaturedExams
                  featuredExams={featuredExams}
                  onViewDetails={viewExamDetails}
                  onStartExam={handleStartExam}
                  onPurchaseExam={handlePurchaseExam}
                  processingExamIds={processingExamIds}
                />
              )}

            {/* Exam listings */}
            <div>
              <div className="flex justify-between items-center mb-6 lg:mb-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center">
                  {searchQuery ? (
                    "Search Results"
                  ) : (
                    <>
                      <Layers className="mr-2 h-5 w-5 text-indigo-500" />
                      {
                        categories.find((c) => c.id === activeCategory)?.name
                      }{" "}
                    </>
                  )}
                </h2>
                <div className="text-xs md:text-sm text-gray-500">
                  {filteredExams.length}{" "}
                  {filteredExams.length === 1 ? "exam" : "exams"} found
                </div>
              </div>

              {filteredExams.length > 0 ? (
                <>
                  <ExamList
                    exams={filteredExams}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onStartExam={handleStartExam}
                    onViewDetails={viewExamDetails}
                    onPurchaseExam={handlePurchaseExam}
                    processingExamIds={processingExamIds}
                  />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              ) : (
                <EmptyState onReset={resetFilters} />
              )}
            </div>
          </>
        )}

        {/* Exam details dialog */}
        {selectedExam && (
          <ExamDetailsDialog
            exam={selectedExam}
            isOpen={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            onPurchaseExam={handlePurchaseExam}
            isProcessing={processingExamIds.includes(selectedExam.id)}
          />
        )}

        {/* Purchase modal for premium exams */}
        {selectedExam && (
          <PurchaseModal
            exam={selectedExam}
            isOpen={isPurchaseModalOpen}
            onOpenChange={setIsPurchaseModalOpen}
            onPaymentSuccess={handlePaymentSuccess}
            setProcessingExamIds={setProcessingExamIds}
          />
        )}
      </div>
    </div>
  );
}
