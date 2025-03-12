import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// All routes should be protected
const isProtectedRoute = createRouteMatcher(["/(.*)"]);

export default clerkMiddleware((auth, req) => {
  // Skip authentication in development mode for API routes
  const isDevelopment = process.env.NODE_ENV === "development";
  const isApiRoute =
    req.url.includes("/api/") || req.url.includes("/agent/api");

  // Check if the request is from the same origin (for API routes in production)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  const isSameOrigin = origin && host && origin.includes(host);

  // Allow API requests from same origin or in development mode
  const shouldAllowApiRequest = isApiRoute && (isDevelopment || isSameOrigin);

  // Protect all routes with authentication except API routes in development
  // or API routes from the same origin in production
  if (isProtectedRoute(req) && !shouldAllowApiRequest) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
