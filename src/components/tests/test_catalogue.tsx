"use client";

import React, { useState, useEffect } from "react";
import { ITEMS_PER_PAGE } from "@/utils/constants";
import { ExamType, CategoryType } from "@/types/examTypes";
import { navigateToExamRules } from "@/services/tests.services";
import {
  applyFilters,
  updateUrlWithPage,
  getQueryParam,
} from "@/utils/tests.utils";

// Import components
import PageHeader from "./page_header";
import CategoryTabs from "./category_tabs";
import FeaturedExams from "./featured_tests";
import ExamList from "./exam_list";
import LoadingSkeleton from "./loading_skeleton";
import EmptyState from "./empty_state";
import Pagination from "./pagination";

// Add these imports and states:
import PurchaseModal from "./purchase_modal";
import { checkExamAccess } from "@/services/payment.services";
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
  const [exams] = useState<ExamType[]>(initialExams);
  const [featuredExams] = useState<ExamType[]>(initialFeaturedExams);
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

  const [examAccess, setExamAccess] = useState<Record<string, boolean>>({});
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);

  // Fetch access status for all premium exams
  useEffect(() => {
    const checkAccessForPremiumExams = async () => {
      setIsLoadingAccess(true);

      const premiumExams = [...initialExams, ...initialFeaturedExams]
        .filter((exam) => exam.isPremium)
        .map((exam) => exam.id);

      if (premiumExams.length === 0) {
        setIsLoadingAccess(false);
        return;
      }

      try {
        const accessMap: Record<string, boolean> = {};

        // Check access for each premium exam
        await Promise.all(
          premiumExams.map(async (examId) => {
            const hasAccess = await checkExamAccess(examId);
            accessMap[examId] = hasAccess;
          })
        );

        setExamAccess(accessMap);
      } catch (error) {
        console.error("Error checking exam access:", error);
        toast.error("Failed to check exam access status");
      } finally {
        setIsLoadingAccess(false);
      }
    };

    checkAccessForPremiumExams();
  }, [initialExams, initialFeaturedExams]);

  // Modify the handleStartExam function to check for premium status
  const handleStartExam = async (examId: string) => {
    const exam = [...exams, ...featuredExams].find((e) => e.id === examId);

    if (!exam) {
      toast.error("Exam not found");
      return;
    }

    if (exam.isPremium) {
      // Check if user already has access to this exam
      const hasAccess = await checkExamAccess(examId);

      if (hasAccess) {
        // User already has access, they can start the exam
        navigateToExamRules(examId);
      } else {
        // User needs to purchase the exam
        setSelectedExam(exam);
        setIsPurchaseModalOpen(true);
      }
    } else {
      // Regular non-premium exam, direct navigation
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
                  onStartExam={navigateToExamRules}
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
                    examAccess={examAccess}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onStartExam={handleStartExam}
                    onViewDetails={viewExamDetails}
                    onPurchaseExam={handlePurchaseExam}
                    isLoadingAccess={isLoadingAccess}
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
            onPaymentSuccess={(examId) => {
              // Update the access map when payment is successful
              setExamAccess((prev) => ({
                ...prev,
                [examId]: true,
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}
