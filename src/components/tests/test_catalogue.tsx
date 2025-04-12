"use client";

import React, { useState, useEffect } from "react";
import { ITEMS_PER_PAGE } from "@/utils/constants";
import { ExamType, CategoryType } from "@/types/examTypes";
import { navigateToExamRules } from "@/services/tests.services";
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

// Import components
import PageHeader from "./page_header";
import CategoryTabs from "./category_tabs";
import FeaturedExams from "./featured_tests";
import ExamList from "./exam_list";
import LoadingSkeleton from "./loading_skeleton";
import EmptyState from "./empty_state";
import Pagination from "./pagination";
import PurchaseModal from "./purchase_modal";
import { toast } from "sonner";

interface ExamCatalogueClientProps {
  initialExams: ExamType[];
  initialFeaturedExams: ExamType[];
  categories: CategoryType[];
}

export default function ExamCatalogueClient({
  initialExams,
  initialFeaturedExams,
  categories,
}: ExamCatalogueClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading] = useState(false);
  const [exams, setExams] = useState<ExamType[]>(initialExams);
  const [featuredExams, setFeaturedExams] =
    useState<ExamType[]>(initialFeaturedExams);
  const [filteredExams, setFilteredExams] = useState<ExamType[]>(initialExams);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(initialExams.length / ITEMS_PER_PAGE)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Add these state variables
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

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

  // View exam details (placeholder)
  const viewExamDetails = (examId: string) => {
    console.log(`View details for exam ${examId}`);
    // Implement navigation to details page
  };

  // Modify the handleStartExam function to use the hasAccess property
  const handleStartExam = (examId: string) => {
    const exam = [...exams, ...featuredExams].find((e) => e.id === examId);

    if (!exam) {
      toast.error("Exam not found");
      return;
    }

    if (exam.isPremium && !exam.hasAccess) {
      // User needs to purchase the exam
      setSelectedExam(exam);
      setIsPurchaseModalOpen(true);
    } else {
      // User has access (either free exam or premium with access)
      navigateToExamRules(examId);
    }
  };

  // Add a handle purchase function
  const handlePurchaseExam = (examId: string) => {
    const exam = [...exams, ...featuredExams].find((e) => e.id === examId);

    if (!exam) {
      toast.error("Exam not found");
      return;
    }

    setSelectedExam(exam);
    setIsPurchaseModalOpen(true);
  };

  // Update exam access status after payment success
  // const handlePaymentSuccess = async (examId: string) => {
  //   try {
  //     // Revalidate data to refresh the page
  //     await revalidateCategorizedExams();

  //     // Optimistically update the exams in state until revalidation takes effect
  //     const updatedExams = exams.map((exam) =>
  //       exam.id === examId ? { ...exam, hasAccess: true } : exam
  //     );
  //     setExams(updatedExams);

  //     const updatedFeatured = featuredExams.map((exam) =>
  //       exam.id === examId ? { ...exam, hasAccess: true } : exam
  //     );
  //     setFeaturedExams(updatedFeatured);

  //     // Update filtered exams with the new access status
  //     const updatedFiltered = filteredExams.map((exam) =>
  //       exam.id === examId ? { ...exam, hasAccess: true } : exam
  //     );
  //     setFilteredExams(updatedFiltered);

  //     toast.success("Purchase successful! You now have access to this exam.");
  //   } catch (error) {
  //     console.error("Error updating exam access:", error);
  //     toast.error(
  //       "There was an issue updating your access. Please refresh the page."
  //     );
  //   }
  // };

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
          .filter(([category]) => category !== "FEATURED")
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
              price: exam.price,
              discountPrice: exam.discountPrice,
              accessPeriod: exam.accessPeriod,
              hasAccess: exam.hasAccess ?? false,
            }))
          );

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
        }));

        // Update state with fresh data
        setExams(allExams);
        setFeaturedExams(featured);

        // Apply current filters to the fresh data
        const filtered = applyFilters(allExams, activeCategory, searchQuery);
        setFilteredExams(filtered);
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
      }

      toast.success("Purchase successful! You now have access to this exam.");
    } catch (error) {
      console.error("Error updating exam access:", error);
      toast.error(
        "There was an issue updating your access. Please refresh the page."
      );
    }
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
            {/* Featured exams - shown only on "all" tab with no search */}
            {!searchQuery &&
              activeCategory === "all" &&
              featuredExams.length > 0 && (
                <FeaturedExams
                  featuredExams={featuredExams}
                  onStartExam={handleStartExam}
                  onPurchaseExam={handlePurchaseExam}
                />
              )}

            {/* Exam listings */}
            <div>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  {searchQuery
                    ? "Search Results"
                    : categories.find((c) => c.id === activeCategory)?.name}
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

        {/* Purchase modal for premium exams */}
        {selectedExam && (
          <PurchaseModal
            exam={selectedExam}
            isOpen={isPurchaseModalOpen}
            onOpenChange={setIsPurchaseModalOpen}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}
