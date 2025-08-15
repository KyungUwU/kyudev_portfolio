// middleware.ts (hoặc src/middleware.ts nếu bạn có thư mục src/)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",  // tất cả dưới /dashboard sẽ cần login
  "/settings(.*)",   // ví dụ: /settings
  "/profile(.*)",    // ví dụ: /profile
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect(); // chặn và yêu cầu login nếu chưa có session
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|.*\\..*).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
