import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  getAdminPassword,
  signAdminToken,
} from "@/lib/analytics/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const configured = getAdminPassword();
  if (!configured) {
    return NextResponse.json(
      {
        error: "password_not_configured",
        message: "请先设置环境变量 ANALYTICS_ADMIN_PASSWORD",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const password =
    body && typeof body === "object" && "password" in body
      ? String((body as { password?: unknown }).password ?? "")
      : "";

  if (password !== configured) {
    return NextResponse.json({ error: "bad_password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const cookie = adminCookieOptions(signAdminToken());
  response.cookies.set(cookie);
  return response;
}
