"use client";

import Script from "next/script";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
// import { useRouter } from "next/navigation";
import { ExamType } from "@/types/examTypes";
// import { Loader2, CheckCircle, CreditCard, Info } from "lucide-react";
import { Loader2, CreditCard, Info } from "lucide-react";
import getClerkToken from "@/actions/client/getClerkToken";
import { Button } from "@/components/ui/button";
import { initiatePayment } from "@/services/payment.services";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Extend the Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      close: () => void;
    };
  }
}

interface PurchaseModalProps {
  exam: ExamType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: () => void;
  setProcessingExamIds: React.Dispatch<React.SetStateAction<string[]>>;
}

interface PaymentData {
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
  };
  [key: string]: unknown; // Add additional fields if needed
}

interface RazorpayOrderData {
  id: string;
  amount: number;
  currency: string;
  [key: string]: unknown; // Add additional fields if needed
}

export default function PurchaseModal({
  exam,
  isOpen,
  onOpenChange,
  onPaymentSuccess,
  setProcessingExamIds,
}: PurchaseModalProps) {
  // const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [, setPaymentData] = useState<PaymentData | null>(null);
  const [step, setStep] = useState<"details" | "processing">("details");

  useEffect(() => {
    // Check if script is already loaded
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }

    // Set up the event listener for script load
    const handleScriptLoad = () => {
      setScriptLoaded(true);
    };

    // Add event listener to the script
    const script = document.querySelector(
      'script[src*="checkout.razorpay.com"]'
    );
    if (script) {
      script.addEventListener("load", handleScriptLoad);
    }

    return () => {
      // Cleanup the event listener
      if (script) {
        script.removeEventListener("load", handleScriptLoad);
      }
    };
  }, []);

  // Verify Payment function
  const verifyPayment = async (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    try {
      setStep("processing");

      // Call API to verify payment
      const verificationData = {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
        examId: exam.id,
      };

      const token = await getClerkToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(verificationData),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        setStep("details");
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        toast.error(data.message || "Payment verification failed");
        setStep("details");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Failed to verify payment. Please contact support.");
      setStep("details");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Razorpay payment form
  const openRazorpayCheckout = (orderData: RazorpayOrderData) => {
    if (!scriptLoaded || !window.Razorpay) {
      toast.error("Payment system is not loaded yet. Please try again.");
      setIsLoading(false);
      setStep("details");
      return;
    }

    // Options for Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "TSCS Exam Portal",
      description: `Payment for ${exam.title}`,
      order_id: orderData.id,
      prefill: {
        name: "", // Can be filled from user context if available
        email: "",
        contact: "",
      },
      theme: {
        color: "#3399cc",
      },
      handler: function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        // Handle successful payment
        verifyPayment(response);
      },
      modal: {
        ondismiss: function () {
          // User closed Razorpay payment window
          setIsLoading(false);
          setStep("details");
          setProcessingExamIds([]);
        },
      },
    };

    // Create Razorpay instance and open checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // Initiate payment process
  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setStep("processing");
      setProcessingExamIds((prev) => [...prev, exam.id]);

      // Initiate payment through our service
      const response = await initiatePayment(
        exam.id,
        exam.bundledExams?.length ? true : false
      );

      // Store payment data for later use
      setPaymentData(response.data);

      // Open Razorpay checkout with the order
      openRazorpayCheckout(response.data.razorpayOrder);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsLoading(false);
      setStep("details");
    }
  };

  // const handleViewExam = () => {
  //   onOpenChange(false);
  //   router.push(`/rules?examId=${exam.id}`);
  // };

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90%] lg:w-4/5 xl:w-2/5 rounded-lg">
          {step === "details" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-start">
                  Purchase Premium Exam
                </DialogTitle>
                <DialogDescription className="text-start">
                  {"You're about to purchase access to this premium exam."}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="mb-4 border-b pb-4">
                  <h3 className="font-medium text-lg mb-1">{exam.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {exam.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{exam.duration} mins</span>
                    <span>{exam.totalMarks} marks</span>
                    <span>Pass: {exam.passPercentage}%</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-md mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Exam Access:
                      </p>
                      <p className="text-xs text-gray-600">
                        Valid for {exam.accessPeriod || 30} days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {exam.discountPrice && exam.discountPrice < exam.price
                          ? `₹${exam.discountPrice}`
                          : `₹${exam.price}`}
                      </p>
                      {exam.discountPrice &&
                        exam.discountPrice < exam.price && (
                          <p className="text-xs text-gray-500 line-through">
                            ₹{exam.price}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    {
                      "You'll be redirected to our secure payment gateway to complete your purchase."
                    }
                  </p>
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between gap-4">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={isLoading || !scriptLoaded}
                  className="bg-amber-600 hover:bg-amber-700 rounded-full"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "processing" && (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-amber-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
              <p className="text-sm text-gray-500 text-center">
                Please wait while we process your payment...
              </p>
            </div>
          )}

          {/* {step === "success" && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center pt-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                  <DialogTitle className="text-xl">
                    Payment Successful!
                  </DialogTitle>
                </div>
                <DialogDescription className="text-center">
                  You now have access to this premium exam for{" "}
                  {exam.accessPeriod || 30} days.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 flex flex-col items-center">
                <p className="text-center text-sm text-gray-600 mb-6">
                  You can start the exam now or access it later from your
                  dashboard.
                </p>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="sm:flex-1"
                >
                  Back to Catalogue
                </Button>
                <Button
                  onClick={handleViewExam}
                  className="bg-gray-800 hover:bg-gray-900 sm:flex-1"
                >
                  Start Exam Now
                </Button>
              </DialogFooter>
            </>
          )} */}
        </DialogContent>
      </Dialog>
    </>
  );
}
