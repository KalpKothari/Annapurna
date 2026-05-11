import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import arcjet, { shield, detectBot } from "@arcjet/next";

const isProtectedRoute = createRouteMatcher([
  "/recipe(.*)",
  "/recipes(.*)",
  "/pantry(.*)",
  "/dashboard(.*)",
]);

const isAuthStabilityApiRoute = createRouteMatcher([
  "/api/users(.*)",
  "/api/users-permissions(.*)",
  "/api/saved-recipes(.*)",
]);

// Arcjet global protection
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // Shield WAF - protects against SQL injection, XSS, etc.
    shield({
      mode: "DRY_RUN", // Change to "LIVE" for production protection
    }),

    // Bot detection - allow search engines, block malicious bots
    detectBot({
      mode: "DRY_RUN", // Change to "LIVE" for production protection
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc.
        "CATEGORY:PREVIEW", // Link previews (Slack, Discord, etc.)
      ],
    }),
  ],
});

export default clerkMiddleware(async (auth, req) => {
  // Keep auth bootstrap and saved-recipe APIs stable by skipping WAF bot blocks.
  if (isAuthStabilityApiRoute(req)) {
    return NextResponse.next();
  }

  // Apply Arcjet protection FIRST (before Clerk auth check)
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Then apply Clerk authentication
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};