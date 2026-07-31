import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/analytics/auth";
import { getAnalyticsStats } from "@/lib/analytics/store";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getAnalyticsStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "stats_failed" }, { status: 500 });
  }
}
