"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import FullPageLoader from "@/components/common/FullPageLoader";
import { getDashboardPath, getSession, isGuestRoute, isProtectedRoute } from "@/lib/auth-routing";

function subscribe(callback) {
  // Back/Forward can restore a page without requesting it from the server.
  const events = ["popstate", "pageshow", "storage"];
  events.forEach((event) => window.addEventListener(event, callback));
  return () => events.forEach((event) => window.removeEventListener(event, callback));
}

function readToken() {
  const cookie = document.cookie.match(/(?:^|;\s*)auth-token=([^;]+)/)?.[1];
  let storedToken;
  try {
    storedToken = localStorage.getItem("auth-token");
  } catch {
    // Cookie-based routing still works when browser storage is unavailable.
  }
  return cookie || storedToken || "";
}

export default function AuthRouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, readToken, () => null);
  const session = getSession(token);
  const guarded = isGuestRoute(pathname) || isProtectedRoute(pathname);
  let destination = null;
  if (session && isGuestRoute(pathname)) destination = getDashboardPath(session.role);
  if (token !== null && !session && isProtectedRoute(pathname)) {
    const login = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    destination = `${login}?returnTo=${encodeURIComponent(pathname)}`;
  }

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, pathname, router]);

  useEffect(() => {
    const enforceHistoryRoute = () => {
      const currentSession = getSession(readToken());
      if (!currentSession) return;

      // History events can fire while Next still reports the previous pathname.
      // Read the browser URL directly and check even when the token is unchanged.
      const restoredPath = window.location.pathname;
      const leftDashboard = isProtectedRoute(pathname) && !isProtectedRoute(restoredPath);
      if (isGuestRoute(restoredPath) || leftDashboard) {
        const dashboard = isProtectedRoute(pathname)
          ? pathname
          : getDashboardPath(currentSession.role);
        window.location.replace(dashboard);
      }
    };

    window.addEventListener("popstate", enforceHistoryRoute);
    window.addEventListener("pageshow", enforceHistoryRoute);
    return () => {
      window.removeEventListener("popstate", enforceHistoryRoute);
      window.removeEventListener("pageshow", enforceHistoryRoute);
    };
  }, [pathname]);

  if (guarded && (token === null || destination)) return <FullPageLoader />;
  return children;
}
