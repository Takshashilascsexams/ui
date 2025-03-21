"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

const previewBulkQuestionsUpload = async (file: File) => {
  const { getToken } = await auth();
  const clerkToken = await getToken();

  const formData = new FormData();
  formData.append("file", file);

  const URI = `${process.env.NEXT_PUBLIC_API_URL}/questions/bulk-validate`;

  const response = await axios.post(URI, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${clerkToken}`,
    },
  });
  const { data } = await response;
  return data;
};

export default previewBulkQuestionsUpload;
