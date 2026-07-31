import { NextResponse } from "next/server";
import { appendAnalyticsEvent } from "@/lib/analytics/store";
import type { AnalyticsEventType } from "@/lib/analytics/types";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set<AnalyticsEventType>(["pageview", "click"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const type = payload.type;
  const path = typeof payload.path === "string" ? payload.path : "";
  const label = typeof payload.label === "string" ? payload.label : "";
  const href = typeof payload.href === "string" ? payload.href : undefined;

  if (typeof type !== "string" || !ALLOWED_TYPES.has(type as AnalyticsEventType)) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }
  if (!path.startsWith("/") || path.startsWith("/admin")) {
    return NextResponse.json({ error: "ignored_path" }, { status: 204 });
  }
  if (!label.trim()) {
    return NextResponse.json({ error: "missing_label" }, { status: 400 });
  }

  try {
    const result = await appendAnalyticsEvent({
      type: type as AnalyticsEventType,
      path,
      label: label.trim(),
      href,
    });
    return NextResponse.json({ ok: true, storage: result.mode });
  } catch {
    return NextResponse.json({ error: "store_failed" }, { status: 500 });
  }
}
