import { NextResponse } from "next/server";
import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";

// Define route matchers for different sections of the app
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

// Routes that require authentication
const isAuthenticatedRoute = createRouteMatcher([
  "/tests(.*)",
  "/profile(.*)",
  "/exam(.*)",
  "/results(.*)",
  "/rules(.*)",
  "/thankyou(.*)",
  "/",
]);

// Routes that require admin role
const isAdminRoute = createRouteMatcher(["/dashboard(.*)"]);

const BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // Fetch current user if logged in
  const currentUser = userId
    ? await (await clerkClient()).users.getUser(userId)
    : null;

  // If the user is signed in and accessing public authentication routes
  // redirect to homepage
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(`${BASE_URL}`);
  }

  // Handle onboarding route access
  if (isOnboardingRoute(req)) {
    // If user is not authenticated, redirect to sign-in
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If onboarding is already complete, redirect to homepage
    if (sessionClaims?.metadata?.onboardingComplete === true) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Otherwise allow access to onboarding
    return NextResponse.next();
  }

  // For authenticated routes, ensure user is logged in
  if (isAuthenticatedRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If user hasn't completed onboarding, redirect there first
    if (!sessionClaims?.metadata?.onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  }

  // For admin routes, ensure user is logged in AND has admin role
  if (isAdminRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Check if user has admin role
    if (currentUser?.publicMetadata?.role !== "Admin") {
      // If no admin access, redirect to homepage
      return NextResponse.redirect(`${BASE_URL}`);
    }

    // If user hasn't completed onboarding, redirect there first
    if (!sessionClaims?.metadata?.onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  }

  // Allow all other requests to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
