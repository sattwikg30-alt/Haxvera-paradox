import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/predict", "/results", "/admin-dashboard"];
const authRoutes = ["/signin", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // Check if user is accessing a protected route
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  );

  // Check if user is accessing an auth route (signin/signup)
  const isAuthRoute = authRoutes.some((route) => 
    pathname.startsWith(route)
  );

  // If on a protected route without a token, redirect to signin
  if (isProtectedRoute && !token) {
    const url = new URL("/signin", request.url);
    // Remember where the user was trying to go
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // If on an auth route with a token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  return NextResponse.next();
}

// Config matcher to only run on relevant paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/predict/:path*",
    "/results/:path*",
    "/admin-dashboard/:path*",
    "/signin",
    "/signup",
  ],
};