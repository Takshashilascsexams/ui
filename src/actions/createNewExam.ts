"use server";

import { auth } from "@clerk/nextjs/server";
import { newExamDataType } from "@/types/dataTypes";

export const createNewExam = async (examData: newExamDataType) => {
  const { getToken } = await auth();
  const clerkToken = await getToken();

  const URI = `${process.env.NEXT_PUBLIC_API_URL}/exam`;
  const body = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify(examData),
  };

  const response = await fetch(URI, body);
  const data = await response.json();
  console.log(data);
};
