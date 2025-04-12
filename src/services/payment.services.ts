// src/services/payment.services.ts
import getClerkToken from "@/actions/client/getClerkToken";
import { revalidateCategorizedExams } from "@/actions/client/fetchCategorizedExams";

/**
 * Initiates payment for a premium exam
 * @param examId - The ID of the exam being purchased
 * @returns Payment details including Razorpay order information
 */
export const initiatePayment = async (examId: string) => {
  try {
    const clerkToken = await getClerkToken();

    if (!clerkToken) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({ examId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to initiate payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Payment initiation error:", error);
    throw error;
  }
};

/**
 * Verifies a payment after returning from payment gateway
 *
 * @param paymentData - The payment details returned from Razorpay
 * @param examId - The ID of the exam being purchased
 * @returns Verification result
 */
export const verifyPayment = async (
  paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  },
  examId: string
) => {
  try {
    const clerkToken = await getClerkToken();

    if (!clerkToken) {
      throw new Error("Authentication token not available");
    }

    // Format verification data to match backend expectations
    const verificationData = {
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
      razorpaySignature: paymentData.razorpay_signature,
      examId: examId,
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(verificationData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to verify payment");
    }

    // After successful payment verification, revalidate the exams data
    await revalidateCategorizedExams();

    return await response.json();
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
};

/**
 * Check if user has access to a premium exam
 *
 * @param examId - The ID of the exam to check access for
 * @returns Boolean indicating if user has access
 */
export const checkExamAccess = async (examId: string) => {
  try {
    const clerkToken = await getClerkToken();

    if (!clerkToken) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/check-access/${examId}`,
      {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to check exam access");
    }

    const data = await response.json();
    return data.data.hasAccess;
  } catch (error) {
    console.error("Access check error:", error);
    return false;
  }
};
