import { NextResponse } from "next/server";
import { clearAuthToken } from "@/lib/auth";

export async function GET(request) {
  await clearAuthToken();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}
