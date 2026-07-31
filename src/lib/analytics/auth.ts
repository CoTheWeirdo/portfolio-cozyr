import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "yz_analytics_admin";
const MAX_AGE_SEC = 60 * 60 * 24 * 14;

function secret() {
  return (
    process.env.ANALYTICS_SECRET ||
    process.env.ANALYTICS_ADMIN_PASSWORD ||
    "dev-only-change-me"
  );
}

export function getAdminPassword() {
  return process.env.ANALYTICS_ADMIN_PASSWORD || "";
}

export function signAdminToken(issuedAt = Date.now()) {
  const payload = `1.${issuedAt}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [ver, issuedRaw, sig] = parts;
  if (ver !== "1") return false;
  const issuedAt = Number(issuedRaw);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > MAX_AGE_SEC * 1000) return false;

  const payload = `${ver}.${issuedRaw}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE)?.value);
}

export function adminCookieOptions(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export function clearAdminCookieOptions() {
  return {
    name: COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
