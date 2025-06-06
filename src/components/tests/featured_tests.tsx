import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { ExamType } from "@/types/examTypes";
import FeaturedTestCard from "./featured_test_card";

interface FeaturedExamsProps {
  featuredExams: ExamType[];
  onViewDetails?: (examId: string) => void;
  onStartExam: (examId: string) => void;
  onPurchaseExam: (examId: string) => void;
  processingExamIds?: string[];
}

export default function FeaturedExams({
  featuredExams,
  onViewDetails,
  onStartExam,
  onPurchaseExam = () => {},
  processingExamIds = [],
}: FeaturedExamsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Update mobile status on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll on mobile
  useEffect(() => {
    if (!isMobile || featuredExams.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === featuredExams.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, featuredExams.length]);

  if (featuredExams.length === 0) return null;

  // For mobile: show one exam at a time with dots navigation
  if (isMobile) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
          Featured Exams
        </h2>

        <div>
          <FeaturedTestCard
            exam={featuredExams[currentIndex]}
            onViewDetails={onViewDetails}
            onStartExam={onStartExam}
            onPurchaseExam={onPurchaseExam}
            hasAccess={
              featuredExams[currentIndex].hasAccess ??
              !featuredExams[currentIndex].isPremium
            }
            isProcessing={processingExamIds.includes(
              featuredExams[currentIndex].id
            )}
          />
        </div>

        {/* Carousel indicators */}
        {featuredExams.length > 1 && (
          <div className="flex justify-center mt-3">
            <div className="flex space-x-1">
              {featuredExams.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    currentIndex === index ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-label={`Go to exam ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // For desktop: grid layout
  return (
    <div className="mb-10 lg:mb-16">
      <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
        <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
        Featured Exams
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {featuredExams.map((exam) => (
          <FeaturedTestCard
            key={exam.id}
            exam={exam}
            onViewDetails={onViewDetails}
            onStartExam={onStartExam}
            onPurchaseExam={onPurchaseExam}
            hasAccess={exam.hasAccess ?? !exam.isPremium}
            isProcessing={processingExamIds.includes(exam.id)}
          />
        ))}
      </div>
    </div>
  );
}
