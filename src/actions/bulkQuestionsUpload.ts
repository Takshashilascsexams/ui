"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { addNewTestFormSchema } from "@/components/create-question/bulk-creation-form";
import axios from "axios";

const bulkQuestionsUpload = async (
  formValues: z.infer<typeof addNewTestFormSchema>
) => {
  const { getToken } = await auth();
  const clerkToken = await getToken();

  const formData = new FormData();

  // Append the file
  formData.append("file", formValues.questionsFileJson);

  // Append all other form fields
  formData.append("examId", formValues.examId);
  formData.append("marks", String(formValues.marks));
  formData.append("difficultyLevel", formValues.difficultyLevel);
  formData.append("subject", formValues.subject);
  formData.append("hasNegativeMarking", String(formValues.hasNegativeMarking));
  formData.append("negativeMarks", String(formValues.negativeMarks));

  const URI = `${process.env.NEXT_PUBLIC_API_URL}/questions/bulk`;

  const { data } = await axios.post(URI, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${clerkToken}`,
    },
    timeout: 60000,
  });
  return data;
};

export default bulkQuestionsUpload;
