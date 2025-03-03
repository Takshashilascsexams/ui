import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in", "/sign-up"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPrivateRoute = createRouteMatcher(["/", "/profile"]);
const isAdminRoute = createRouteMatcher(["/dashboard"]);

const BASE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  const currentUser = userId
    ? await (await clerkClient()).users.getUser(userId)
    : null;

  // If the user is signed in and accessing public route
  // redirect to dashboard
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(`${BASE_URL}`);
  }

  // If the user isn't signed in and accessing private route,
  // redirect to sign-in
  if (!userId && (isPrivateRoute(req) || isOnboardingRoute(req))) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // For users visiting /onboarding, check bypass flag
  if (userId && isOnboardingRoute(req)) {
    // Check if onboarding is already complete
    if (sessionClaims?.metadata?.onboardingComplete) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // Restrict admin routes to users with specific permissions
  if (isAdminRoute(req) && currentUser?.publicMetadata?.role !== "Admin") {
    return NextResponse.redirect(`${BASE_URL}`);
  }

  // Check for bypass flag before redirecting to onboarding
  if (userId && !sessionClaims?.metadata?.onboardingComplete) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

// This middleware includes logic to bypass onboarding during sign-up process
// export default clerkMiddleware(async (auth, req) => {
//   const { userId, sessionClaims, redirectToSignIn } = await auth();

//   const currentUser = userId
//     ? await (await clerkClient()).users.getUser(userId)
//     : null;

//   // If the user is signed in and accessing public route
//   // redirect to dashboard
//   if (userId && isPublicRoute(req)) {
//     return NextResponse.redirect(`${BASE_URL}/dashboard`);
//   }

//   // If the user isn't signed in and accessing private route,
//   // redirect to sign-in
//   if (!userId && (isPrivateRoute(req) || isOnboardingRoute(req))) {
//     return redirectToSignIn({ returnBackUrl: req.url });
//   }

//   // For users visiting /onboarding, check bypass flag
//   if (userId && isOnboardingRoute(req)) {
//     // Check if user should bypass onboarding
//     if (currentUser?.unsafeMetadata?.bypassOnboarding) {
//       return NextResponse.redirect(new URL("/dashboard", req.url));
//     }

//     // Check if onboarding is already complete
//     if (sessionClaims?.metadata?.onboardingComplete) {
//       return NextResponse.redirect(new URL("/dashboard", req.url));
//     }

//     return NextResponse.next();
//   }

//   // Restrict admin routes to users with specific permissions
//   if (isAdminRoute(req) && currentUser?.publicMetadata?.role !== "Admin") {
//     return NextResponse.redirect(`${BASE_URL}/dashboard`);
//   }

//   // Check for bypass flag before redirecting to onboarding
//   if (userId && !sessionClaims?.metadata?.onboardingComplete) {
//     // If bypassOnboarding is true, don't redirect to onboarding
//     if (currentUser?.unsafeMetadata?.bypassOnboarding === true) {
//       return NextResponse.next();
//     }

//     return NextResponse.redirect(new URL("/onboarding", req.url));
//   }

//   return NextResponse.next();
// });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
