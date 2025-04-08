// src/services/payment.services.ts
import getClerkToken from "@/actions/client/getClerkToken";

/**
 * Initiates payment for a premium exam
 * @param examId - The ID of the exam being purchased
 * @returns Payment details including redirect URL for payment gateway
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
 * Verifies a payment after return from payment gateway
 * @param paymentId - The payment ID to verify
 * @returns Verification result
 */
export const verifyPayment = async (paymentId: string, orderId: string) => {
  try {
    const clerkToken = await getClerkToken();

    if (!clerkToken) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({ paymentId, orderId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to verify payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
};

/**
 * Check if user has access to a premium exam
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
    return data.hasAccess;
  } catch (error) {
    console.error("Access check error:", error);
    return false;
  }
};
