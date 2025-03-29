"use server";

import { auth } from "@clerk/nextjs/server";

const getClerkToken = async () => {
  const { getToken } = await auth();
  const clerkToken = await getToken();

  return clerkToken;
};

export default getClerkToken;
