import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ChevronDown, ChevronUp, CreditCard, ArrowRight } from "lucide-react";
import { ExamType } from "@/types/examTypes";

interface BundleCardProps {
  bundle: ExamType;
  onOpenBundle: (examId: string) => void;
  onPurchaseExam: (bundleId: string) => void;
  isProcessing?: boolean;
}

export default function BundleCard({
  bundle,
  onOpenBundle,
  onPurchaseExam,
  isProcessing = false,
}: BundleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if user has access to the entire bundle
  const hasCompleteAccess = bundle.hasAccess;

  // Check if bundle is premium or free
  const isPremiumBundle = bundle.isPremium;

  // Count how many exams in the bundle the user already has access to
  const accessibleExamsCount =
    bundle.bundledExams?.filter((exam) => exam.hasAccess).length || 0;
  const totalExamsCount = bundle.bundledExams?.length || 0;
  const partialAccess =
    accessibleExamsCount > 0 && accessibleExamsCount < totalExamsCount;

  // Calculate savings percentage (only for premium bundles)
  const savingsPercentage = isPremiumBundle
    ? Math.round(100 - ((bundle.discountPrice as number) / bundle.price) * 100)
    : 0;

  // Handle toggling the expanded state
  const toggleExpanded = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="w-full flex items-center justify-between gap-2">
            <h3 className="font-bold text-gray-900 line-clamp-1">
              {bundle.title}
            </h3>
            <Badge
              variant="outline"
              className="gray-indigo-800 border border-slate-200"
            >
              Bundle
            </Badge>
          </div>
        </div>

        <div className="h-14">
          <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-y-2 text-xs text-gray-600 mb-4">
          <div className="col-span-1">
            <span className="font-medium text-gray-700">Bundle Contents:</span>
          </div>
          <div className="col-span-2">
            <span>{bundle.bundledExams?.length || 0} exams</span>
          </div>

          <div className="col-span-1">
            <span className="font-medium text-gray-700">Total Duration:</span>
          </div>
          <div className="col-span-2">
            <span>{bundle.duration} mins</span>
          </div>

          <div className="col-span-1">
            <span className="font-medium text-gray-700">Access Period:</span>
          </div>
          <div className="col-span-2">
            <span>{bundle.accessPeriod} days</span>
          </div>
        </div>

        {/* Pricing Section - Only show for premium bundles */}
        {isPremiumBundle && (
          <div className={`mb-4 p-3 bg-indigo-50 rounded-md`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Bundle Price
                </p>
                <p className="text-xs text-gray-600">
                  Save {savingsPercentage}%
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold text-indigo-800`}>
                  ₹{bundle.discountPrice}
                </p>
                <p className="text-xs text-gray-500 line-through">
                  ₹{bundle.price}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Free Bundle Access Notice */}
        {!isPremiumBundle && (
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Free Bundle
                </p>
                <p className="text-xs text-green-600">
                  Complete access included
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold text-green-800`}>₹0</p>
                <p className="text-xs text-gray-500">No cost</p>
              </div>
            </div>
          </div>
        )}

        {/* Partial Access Notice - Only for premium bundles */}
        {isPremiumBundle && partialAccess && !hasCompleteAccess && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-xs text-yellow-700">
              You already have access to {accessibleExamsCount} out of{" "}
              {totalExamsCount} exams in this bundle.
            </p>
          </div>
        )}

        {/* Bundle Contents Section */}
        <div className="mt-4">
          <button
            onClick={toggleExpanded}
            className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left text-indigo-800 border-b-[1px] border-slate-200 focus:outline-none`}
          >
            <span>
              View Bundle Contents ({bundle.bundledExams?.length || 0} exams)
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-4">
              {bundle.bundledExams?.map((exam) => (
                <div
                  key={exam._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        // For free bundles, always show green; for premium, check actual access
                        !isPremiumBundle || exam.hasAccess
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm">{exam.title}</span>
                  </div>
                  {/* For free bundles, always show Access Granted; for premium, check actual access */}
                  {(!isPremiumBundle || exam.hasAccess) && (
                    <span className="text-xs text-green-600 font-medium">
                      Access Granted
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4">
          {/* Premium Bundle Logic */}
          {isPremiumBundle && !hasCompleteAccess ? (
            <Button
              onClick={() => onPurchaseExam(bundle.id)}
              disabled={isProcessing}
              className="w-full py-2 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full text-sm font-medium transition-colors flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Purchase Bundle
            </Button>
          ) : (
            // Free Bundle or Premium Bundle with Complete Access
            <div className="space-y-3">
              <div className="p-2 bg-green-50 rounded-md text-xs">
                <p className="text-green-700 font-medium text-start">
                  You have access to all exams in this bundle
                </p>
              </div>
              <Button
                onClick={() => onOpenBundle(bundle.id)}
                disabled={isProcessing}
                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-sm font-medium transition-colors flex items-center justify-center"
              >
                Open Bundle
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
