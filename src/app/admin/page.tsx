import type { Metadata } from "next";
import AdminAnalyticsPage from "./AdminAnalyticsPage";

export const metadata: Metadata = {
  title: "点击量后台",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminAnalyticsPage />;
}
