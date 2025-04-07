"use server";

import { auth } from "@clerk/nextjs/server";
import axiosInstance from "@/lib/axoisInstance";

const previewBulkQuestionsUpload = async (file: File) => {
  const { getToken } = await auth();
  const clerkToken = await getToken();

  try {
    const formData = new FormData();
    formData.append("file", file);

    const URI = `${process.env.NEXT_PUBLIC_API_URL}/questions/bulk-validate`;

    const response = await axiosInstance.post(URI, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${clerkToken}`,
      },
    });
    const { data } = await response;
    return data;
  } catch (error) {
    console.log("An error occurred:", error);
    return {
      message:
        "Failed to validate json file content. Provide a valid questions file.",
    };
  }
};

export default previewBulkQuestionsUpload;
