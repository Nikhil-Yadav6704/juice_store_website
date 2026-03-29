import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes — require admin role
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (token?.role !== "admin") {
        // API requests get 401
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        // Page requests get redirected to login
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Admin routes require a token with admin role
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return token?.role === "admin";
        }

        // Protected user routes require any valid token
        if (
          pathname.startsWith("/cart") ||
          pathname.startsWith("/orders") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/api/cart") ||
          pathname.startsWith("/api/orders")
        ) {
          return !!token;
        }

        // All other routes are public
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/cart/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
  ],
};
