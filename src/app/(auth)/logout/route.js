import { NextResponse } from "next/server";
import { clearAuthToken } from "@/lib/auth";

export async function GET(request) {
  await clearAuthToken();

  const host = request.headers.get("host") || request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const base = host ? `${proto}://${host}` : request.url;
  const loginUrl = new URL("/login", base);
  return NextResponse.redirect(loginUrl);
}
