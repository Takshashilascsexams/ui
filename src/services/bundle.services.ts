import getClerkToken from "@/actions/client/getClerkToken";
import { ApiBundleResponseType, BundleType } from "@/types/examTypes";

/**
 * Fetches details for a specific bundle by its ID
 * @param bundleId - The ID of the bundle to fetch
 * @returns Bundle data including all bundled exams
 */

export const getBundleDetails = async (
  bundleId: string
): Promise<BundleType | null> => {
  try {
    const clerkToken = await getClerkToken();

    if (!clerkToken) {
      throw new Error("Authentication token not available");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bundle-exam/${bundleId}`,
      {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
        next: {
          tags: [`bundle-${bundleId}`],
          // revalidate: 60, // Revalidate every minute
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch bundle details");
    }

    const data = await response.json();
    console.log(data);
    const bundleData: ApiBundleResponseType = data.data.bundle;

    // Transform API response to our frontend BundleType
    return {
      id: bundleData._id,
      title: bundleData.title,
      description: bundleData.description,
      category: bundleData.category,
      duration: bundleData.duration,
      totalMarks: bundleData.totalMarks,
      difficulty: bundleData.difficultyLevel,
      passPercentage: bundleData.passMarkPercentage,
      date: bundleData.createdAt,
      isFeatured: bundleData.isFeatured,
      isPremium: bundleData.isPremium,
      price: bundleData.price,
      discountPrice: bundleData.discountPrice,
      accessPeriod: bundleData.accessPeriod,
      hasAccess: bundleData.hasAccess,
      isBundle: true,
      bundleTag: bundleData.bundleTag,
      // Transform bundled exams
      bundledExams: bundleData.bundledExams.map((exam) => ({
        id: exam._id,
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        category: exam.category,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        difficulty: exam.difficultyLevel,
        passPercentage: exam.passMarkPercentage,
        date: bundleData.createdAt, // Use bundle creation date as fallback
        isFeatured: exam.isFeatured,
        isPremium: exam.isPremium,
        isPartOfBundle: exam.isPartOfBundle ? true : false,
        price: 0, // Individual pricing not applicable within a bundle
        discountPrice: exam.discountPrice,
        hasAccess: bundleData.hasAccess, // Access is tied to the bundle
        accessPeriod: exam.accessPeriod,
        participants: exam.participants,
        bundledExams: exam.bundledExams || [],
      })),
    };
  } catch (error) {
    console.error("Error fetching bundle details:", error);
    throw error;
  }
};

/**
 * Revalidates the bundle data cache
 * @param bundleId - The ID of the bundle to revalidate
 */
export const revalidateBundleData = async (bundleId: string): Promise<void> => {
  try {
    await fetch(`/api/revalidate?tag=bundle-${bundleId}`, { method: "POST" });
  } catch (error) {
    console.error("Error revalidating bundle data:", error);
  }
};
