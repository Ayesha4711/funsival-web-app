import { NextResponse } from "next/server";

import { getDashboardPath, getSession, isGuestRoute, isProtectedRoute } from "./lib/auth-routing";

export default function proxy(req) {
  const { pathname } = req.nextUrl;
  const session = getSession(req.cookies.get("auth-token")?.value);

  if (isProtectedRoute(pathname) && !session) {
    const login = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    const loginUrl = new URL(login, req.nextUrl);
    loginUrl.searchParams.set("returnTo", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestRoute(pathname) && session) {
    return NextResponse.redirect(new URL(getDashboardPath(session.role), req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on every path except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
