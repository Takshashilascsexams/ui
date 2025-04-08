// src/app/payment/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyPayment } from "@/services/payment.services";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [examId, setExamId] = useState<string | null>(null);

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      try {
        const paymentId = searchParams.get("payment_id");
        const orderId = searchParams.get("order_id");

        if (!paymentId || !orderId) {
          setStatus("error");
          setMessage("Missing payment information in the URL");
          return;
        }

        const response = await verifyPayment(paymentId, orderId);

        if (response.status === "success") {
          setStatus("success");
          setMessage(response.message || "Payment successful!");
          setExamId(response.examId);
        } else {
          setStatus("error");
          setMessage(response.message || "Payment verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during payment verification");
        console.error("Payment verification error:", error);
      }
    };

    verifyPaymentStatus();
  }, [searchParams, router]);

  const handleViewExam = () => {
    if (examId) {
      router.push(`/rules?examId=${examId}`);
    }
  };

  const handleBackToExams = () => {
    router.push("/tests");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        {status === "loading" && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-6" />
            <h1 className="text-xl font-semibold mb-2">Verifying Payment</h1>
            <p className="text-gray-600 text-center">
              Please wait while we verify your payment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-10">
            <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
            <h1 className="text-xl font-semibold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 text-center mb-8">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleBackToExams}
                className="sm:flex-1"
              >
                Back to Exams
              </Button>
              <Button
                onClick={handleViewExam}
                className="bg-blue-600 hover:bg-blue-700 sm:flex-1"
              >
                Start Exam Now
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-10">
            <XCircle className="h-16 w-16 text-red-500 mb-6" />
            <h1 className="text-xl font-semibold mb-2">Payment Failed</h1>
            <p className="text-gray-600 text-center mb-8">{message}</p>
            <Button onClick={handleBackToExams} className="w-full">
              Back to Exams
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
