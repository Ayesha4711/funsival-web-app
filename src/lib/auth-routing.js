const matchesRoute = (pathname, route) =>
  pathname === route || pathname.startsWith(`${route}/`);

export function isGuestRoute(pathname) {
  // These pages finish signup after a token has already been issued.
  if (["/signup/success", "/signup/preferences"].some((route) => matchesRoute(pathname, route))) return false;
  return pathname === "/" || ["/login", "/admin/login", "/signup", "/verify", "/forgot-password"].some((route) => matchesRoute(pathname, route));
}

export function isProtectedRoute(pathname) {
  return !matchesRoute(pathname, "/admin/login") &&
    ["/dashboard", "/user-dashboard", "/admin"].some((route) => matchesRoute(pathname, route));
}

// This is an optimistic routing check. The API still verifies the JWT signature.
export function getSession(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const session = JSON.parse(atob(payload));
    if (!session.sub || !["host", "user", "admin"].includes(session.role) ||
      !Number.isFinite(session.exp) || session.exp * 1000 <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function getDashboardPath(role) {
  if (role === "admin") return "/admin/refund-requests";
  return role === "host" ? "/dashboard" : "/user-dashboard/explore";
}
