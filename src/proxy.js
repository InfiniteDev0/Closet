import { NextResponse } from "next/server";

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const authToken = request.cookies.get("authToken");
  const owner = request.cookies.get("owner");

  // Public paths that don't require authentication
  const publicPaths = ["/", "/account/auth"];
  const isPublicPath = publicPaths.includes(pathname);

  // If trying to access protected route without valid auth token, redirect to auth
  if (!isPublicPath && !authToken) {
    return NextResponse.redirect(new URL("/account/auth", request.url));
  }

  // If logged in (has valid token) and trying to access auth page, redirect to wardrobe
  if (pathname === "/account/auth" && authToken && owner) {
    return NextResponse.redirect(new URL("/my-closet/wardrobe", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
