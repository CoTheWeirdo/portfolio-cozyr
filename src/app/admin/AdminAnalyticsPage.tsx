"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { AnalyticsStats } from "@/lib/analytics/types";
import styles from "./admin.module.css";

export default function AdminAnalyticsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics/stats", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        setStats(null);
        return;
      }
      if (!res.ok) {
        setError("读取数据失败");
        return;
      }
      const data = (await res.json()) as AnalyticsStats;
      setStats(data);
      setAuthed(true);
    } catch {
      setError("网络异常");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string; error?: string }
          | null;
        setError(
          data?.message ||
            (data?.error === "bad_password" ? "密码不对" : "登录失败"),
        );
        setLoading(false);
        return;
      }
      setPassword("");
      await loadStats();
    } catch {
      setError("网络异常");
      setLoading(false);
    }
  }

  async function onLogout() {
    await fetch("/api/analytics/logout", { method: "POST" });
    setAuthed(false);
    setStats(null);
  }

  const maxDaily = Math.max(
    1,
    ...(stats?.last7Days.map((d) => d.pageviews + d.clicks) ?? [1]),
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>PRIVATE DASHBOARD</p>
          <h1>点击量后台</h1>
          <p className={styles.lead}>前台页面外观不变，这里只给你看访问与点击。</p>
        </div>
        {authed ? (
          <button type="button" className={styles.ghostBtn} onClick={() => void onLogout()}>
            退出
          </button>
        ) : null}
      </header>

      {!authed ? (
        <form className={styles.login} onSubmit={onLogin}>
          <label className={styles.label}>
            管理密码
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="ANALYTICS_ADMIN_PASSWORD"
              required
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "检查中…" : "进入后台"}
          </button>
        </form>
      ) : null}

      {authed && stats ? (
        <div className={styles.dashboard}>
          <section className={styles.cards}>
            <article className={styles.card}>
              <span>总访问</span>
              <strong>{stats.totalPageviews}</strong>
            </article>
            <article className={styles.card}>
              <span>总点击</span>
              <strong>{stats.totalClicks}</strong>
            </article>
            <article className={styles.card}>
              <span>访问过的页面</span>
              <strong>{stats.uniquePaths}</strong>
            </article>
            <article className={styles.card}>
              <span>存储</span>
              <strong className={styles.storage}>{stats.storage}</strong>
            </article>
          </section>

          {stats.storage === "memory" ? (
            <p className={styles.warn}>
              当前跑在临时内存存储（常见于未配置 Upstash 的 Vercel）。重启后数据可能丢失。本地开发默认写入
              `.data/analytics.json`；线上建议配置 Upstash Redis。
            </p>
          ) : null}

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>近 7 天</h2>
              <button type="button" className={styles.ghostBtn} onClick={() => void loadStats()}>
                刷新
              </button>
            </div>
            <div className={styles.bars}>
              {stats.last7Days.map((day) => {
                const total = day.pageviews + day.clicks;
                const height = `${Math.max(8, Math.round((total / maxDaily) * 100))}%`;
                return (
                  <div key={day.date} className={styles.barCol}>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ height }} />
                    </div>
                    <span className={styles.barDate}>{day.date.slice(5)}</span>
                    <span className={styles.barMeta}>
                      {day.pageviews}v / {day.clicks}c
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className={styles.split}>
            <section className={styles.panel}>
              <h2>页面访问排行</h2>
              <ul className={styles.rank}>
                {stats.topPages.length === 0 ? (
                  <li>还没有数据</li>
                ) : (
                  stats.topPages.map((item) => (
                    <li key={item.key}>
                      <span>{item.key}</span>
                      <strong>{item.count}</strong>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className={styles.panel}>
              <h2>点击排行</h2>
              <ul className={styles.rank}>
                {stats.topClicks.length === 0 ? (
                  <li>还没有数据</li>
                ) : (
                  stats.topClicks.map((item) => (
                    <li key={item.key}>
                      <span>{item.key}</span>
                      <strong>{item.count}</strong>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <section className={styles.panel}>
            <h2>最近事件</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>类型</th>
                    <th>页面</th>
                    <th>内容</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((event) => (
                    <tr key={event.id}>
                      <td>{new Date(event.ts).toLocaleString("zh-CN", { hour12: false })}</td>
                      <td>{event.type}</td>
                      <td>{event.path}</td>
                      <td>
                        {event.label}
                        {event.href ? ` (${event.href})` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {authed && loading && !stats ? <p className={styles.muted}>加载中…</p> : null}
      {authed && error ? <p className={styles.error}>{error}</p> : null}
    </main>
  );
}
