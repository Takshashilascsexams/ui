"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BundleType } from "@/types/examTypes";
import PurchaseModal from "@/components/tests/purchase_modal";
import {
  CreditCard,
  ArrowLeft,
  Clock,
  Award,
  PuzzleIcon,
  Package,
  User,
} from "lucide-react";

interface BundleDetailsProps {
  bundle: BundleType;
}

export default function BundleDetails({ bundle }: BundleDetailsProps) {
  const router = useRouter();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate savings percentage
  const savingsPercentage = Math.round(
    100 - ((bundle.discountPrice as number) / bundle.price) * 100
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`;
  };

  const handlePurchaseSuccess = () => {
    toast.success("Bundle purchased successfully!");
    router.refresh();
  };

  return (
    <>
      <div className="mb-8">
        <Link
          href={"/tests"}
          className="mb-6 lg:mb-8 text-gray-600 hover:text-gray-900 flex items-center justify-start gap-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exams
        </Link>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            {/* Left Column - Bundle Info */}
            <div className="space-y-4 lg:w-2/3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-indigo-800">
                  {bundle.title}
                </h1>
              </div>

              <p className="text-gray-700">{bundle.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-gray-200">
                  <Clock className="h-5 w-5 text-indigo-500 mb-1" />
                  <span className="text-xs text-gray-500">Duration</span>
                  <span className="font-medium">
                    {formatDuration(bundle.duration)}
                  </span>
                </div>

                <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-gray-200">
                  <Award className="h-5 w-5 text-indigo-500 mb-1" />
                  <span className="text-xs text-gray-500">Total Marks</span>
                  <span className="font-medium">{bundle.totalMarks}</span>
                </div>

                <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-gray-200">
                  <PuzzleIcon className="h-5 w-5 text-indigo-500 mb-1" />
                  <span className="text-xs text-gray-500">Exams</span>
                  <span className="font-medium">
                    {bundle.bundledExams?.length || 0}
                  </span>
                </div>

                <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-gray-200">
                  <User className="h-5 w-5 text-indigo-500 mb-1" />
                  <span className="text-xs text-gray-500">Access</span>
                  <span className="font-medium">
                    {bundle.accessPeriod} days
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing and Actions */}
            <div className="lg:w-1/3 bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
              {bundle.hasAccess ? (
                <>
                  <div className="bg-green-50 p-4 rounded-md mb-4">
                    <p className="text-green-700 font-medium text-center">
                      You have access to this bundle
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 text-center">
                    You can access all exams in this bundle
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-4 text-center">
                    <p className="text-sm text-gray-500">Bundle Price</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold text-indigo-700">
                        ₹{bundle.discountPrice}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{bundle.price}
                      </span>
                    </div>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Save {savingsPercentage}%
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 text-center">
                    Get access to all {bundle.bundledExams?.length} exams for{" "}
                    {bundle.accessPeriod} days
                  </p>

                  <Button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Purchase Bundle
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {!bundle.hasAccess && (
        <PurchaseModal
          exam={bundle}
          isOpen={isPurchaseModalOpen}
          onOpenChange={setIsPurchaseModalOpen}
          onPaymentSuccess={handlePurchaseSuccess}
          setProcessingExamIds={(ids) =>
            setIsProcessing(Array.isArray(ids) && ids.includes(bundle.id))
          }
        />
      )}
    </>
  );
}
