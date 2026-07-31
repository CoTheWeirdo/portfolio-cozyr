import { NextResponse } from "next/server";
import { clearAdminCookieOptions } from "@/lib/analytics/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearAdminCookieOptions());
  return response;
}
