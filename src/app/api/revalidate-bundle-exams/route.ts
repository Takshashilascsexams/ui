import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const bundleId = request.nextUrl.searchParams.get("bundleId");

    if (!bundleId) {
      return NextResponse.json(
        { message: "Missing bundleId parameter" },
        { status: 400 }
      );
    }

    // Revalidate the bundle tag
    revalidateTag(`bundle-${bundleId}`);

    return NextResponse.json(
      { revalidated: true, message: `Bundle '${bundleId}' data revalidated` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error revalidating bundle:", error);
    return NextResponse.json(
      { message: "Error revalidating bundle data" },
      { status: 500 }
    );
  }
}
