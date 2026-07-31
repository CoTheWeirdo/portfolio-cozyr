import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsStats,
  DailyBucket,
  RankedItem,
} from "./types";

const MAX_EVENTS = 20_000;
const memoryEvents: AnalyticsEvent[] = [];

type StoreMode = AnalyticsStats["storage"];

function hasUpstash() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function dataFilePath() {
  // Local/dev: project `.data`. On many serverless hosts `/tmp` is writable.
  if (process.env.VERCEL) {
    return path.join("/tmp", "portfolio-analytics.json");
  }
  return path.join(process.cwd(), ".data", "analytics.json");
}

async function readFileEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await readFile(dataFilePath(), "utf8");
    const parsed = JSON.parse(raw) as { events?: AnalyticsEvent[] };
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch {
    return [];
  }
}

async function writeFileEvents(events: AnalyticsEvent[]) {
  const file = dataFilePath();
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify({ events }, null, 0), "utf8");
  await rename(tmp, file);
}

async function upstashGetEvents(): Promise<AnalyticsEvent[]> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([["GET", "portfolio:analytics:events"]]),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { result?: Array<{ result?: string | null }> };
  const raw = data.result?.[0]?.result;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function upstashSetEvents(events: AnalyticsEvent[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["SET", "portfolio:analytics:events", JSON.stringify(events)],
    ]),
  });
}

function detectMode(): StoreMode {
  if (hasUpstash()) return "upstash";
  if (process.env.VERCEL && !hasUpstash()) return "memory";
  return "file";
}

async function loadEvents(): Promise<{ events: AnalyticsEvent[]; mode: StoreMode }> {
  const mode = detectMode();
  if (mode === "upstash") {
    return { events: await upstashGetEvents(), mode };
  }
  if (mode === "memory") {
    return { events: memoryEvents, mode };
  }
  return { events: await readFileEvents(), mode };
}

async function saveEvents(events: AnalyticsEvent[], mode: StoreMode) {
  const clipped = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;
  if (mode === "upstash") {
    await upstashSetEvents(clipped);
    return;
  }
  if (mode === "memory") {
    memoryEvents.length = 0;
    memoryEvents.push(...clipped);
    return;
  }
  await writeFileEvents(clipped);
}

export async function appendAnalyticsEvent(input: {
  type: AnalyticsEventType;
  path: string;
  label: string;
  href?: string;
}) {
  const { events, mode } = await loadEvents();
  const next: AnalyticsEvent = {
    id: randomUUID(),
    type: input.type,
    path: input.path.slice(0, 200),
    label: input.label.slice(0, 160),
    href: input.href?.slice(0, 300),
    ts: Date.now(),
  };
  events.push(next);
  await saveEvents(events, mode);
  return { ok: true as const, mode };
}

function dayKey(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function rank(counter: Map<string, number>, limit = 12): RankedItem[] {
  return [...counter.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const { events, mode } = await loadEvents();
  const pageviews = events.filter((e) => e.type === "pageview");
  const clicks = events.filter((e) => e.type === "click");

  const pageCounter = new Map<string, number>();
  for (const event of pageviews) {
    pageCounter.set(event.path, (pageCounter.get(event.path) ?? 0) + 1);
  }

  const clickCounter = new Map<string, number>();
  for (const event of clicks) {
    const key = event.href
      ? `${event.label} → ${event.href}`
      : event.label;
    clickCounter.set(key, (clickCounter.get(key) ?? 0) + 1);
  }

  const last7Days: DailyBucket[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - i);
    const key = day.toISOString().slice(0, 10);
    const inDay = events.filter((e) => dayKey(e.ts) === key);
    last7Days.push({
      date: key,
      pageviews: inDay.filter((e) => e.type === "pageview").length,
      clicks: inDay.filter((e) => e.type === "click").length,
    });
  }

  return {
    totalPageviews: pageviews.length,
    totalClicks: clicks.length,
    uniquePaths: pageCounter.size,
    last7Days,
    topPages: rank(pageCounter),
    topClicks: rank(clickCounter),
    recent: [...events].reverse().slice(0, 40),
    storage: mode,
    generatedAt: Date.now(),
  };
}
