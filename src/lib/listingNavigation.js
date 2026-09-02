// Same auth-check pattern as LandingNavbar.jsx's getLogoHref — reads the
// client-readable auth-token cookie/localStorage directly instead of the
// Redux selector, since Redux auth state resets to null on every fresh
// page load (no rehydration logic in authSlice.js).
export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return Boolean(
    localStorage.getItem("auth-token") ||
      document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("auth-token="))
        ?.split("=")[1]
  );
}

export function navigateToListingOrLogin(router, listingId) {
  const target = `/user-dashboard/listing/${listingId}`;
  if (isLoggedIn()) {
    router.push(target);
  } else {
    router.push(`/login?returnTo=${encodeURIComponent(target)}`);
  }
}
