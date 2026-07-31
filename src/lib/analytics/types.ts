export type AnalyticsEventType = "pageview" | "click";

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  path: string;
  label: string;
  href?: string;
  ts: number;
};

export type DailyBucket = {
  date: string;
  pageviews: number;
  clicks: number;
};

export type RankedItem = {
  key: string;
  count: number;
};

export type AnalyticsStats = {
  totalPageviews: number;
  totalClicks: number;
  uniquePaths: number;
  last7Days: DailyBucket[];
  topPages: RankedItem[];
  topClicks: RankedItem[];
  recent: AnalyticsEvent[];
  storage: "file" | "memory" | "upstash";
  generatedAt: number;
};
