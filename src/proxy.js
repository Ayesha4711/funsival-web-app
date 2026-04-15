import { NextResponse } from "next/server";

// Routes that require a logged-in user
const protectedRoutes = ["/dashboard"];

// Routes that a logged-in user should NOT visit (redirect to dashboard)
const publicOnlyRoutes = ["/login", "/signup", "/", "/verify", "/forgot-password"];

// Routes that are always accessible regardless of auth state
const exemptRoutes = ["/signup/success"];

export default function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth-token")?.value;

  const isExempt = exemptRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  if (isExempt) return NextResponse.next();

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isPublicOnly = publicOnlyRoutes.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  // Unauthenticated user trying to access a protected route → login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user visiting a public-only page → dashboard
  if (isPublicOnly && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on every path except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
