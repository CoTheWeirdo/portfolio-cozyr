"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function sendEvent(payload: {
  type: "pageview" | "click";
  path: string;
  label: string;
  href?: string;
}) {
  if (payload.path.startsWith("/admin")) return;

  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/event", blob);
      return;
    }
  } catch {
    // fall through
  }

  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 160);
}

function hrefOf(el: HTMLElement) {
  if (el instanceof HTMLAnchorElement && el.href) {
    try {
      const url = new URL(el.href);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return el.getAttribute("href") || undefined;
    }
  }
  return undefined;
}

function explicitAnalyticsLabel(el: HTMLElement) {
  const self = el.getAttribute("data-analytics");
  if (self) return cleanText(self);
  const nearest = el.closest("[data-analytics]");
  if (nearest instanceof HTMLElement) {
    const value = nearest.getAttribute("data-analytics");
    if (value) return cleanText(value);
  }
  return null;
}

function nearbyTrackName(el: HTMLElement) {
  const scopes: Array<Element | null> = [
    el.closest("li"),
    el.closest("article"),
    el.closest("aside"),
    el.closest("section"),
    el.closest("[class*='Player'], [class*='player'], [class*='Track'], [class*='track']"),
    document.body,
  ];

  const selectors = [
    "[data-analytics-track]",
    ".finalSong",
    ".hear-sideb-track-label",
    ".hear-sideb-listening__title",
    ".hear-side-a-session-note__title",
    ".hear-track__name",
    ".ai-case__title",
  ];

  for (const scope of scopes) {
    if (!(scope instanceof Element)) continue;
    for (const selector of selectors) {
      const node =
        scope.matches?.(selector)
          ? scope
          : scope.querySelector(selector);
      if (!(node instanceof HTMLElement)) continue;
      const fromAttr = node.getAttribute("data-analytics-track");
      const text = cleanText(fromAttr || node.textContent || "");
      if (text && text.length <= 40) return text;
    }
  }

  return null;
}

function baseLabel(el: HTMLElement) {
  const aria = el.getAttribute("aria-label");
  if (aria) return cleanText(aria);

  if (el instanceof HTMLInputElement && el.value) {
    return cleanText(el.value);
  }

  const text = cleanText(el.textContent || "");
  if (text) return text;

  const title = el.getAttribute("title");
  if (title) return cleanText(title);

  return el.tagName.toLowerCase();
}

function looksLikePlayback(label: string) {
  return /播放|暂停|试听|play|pause|audition|slice|完整成品|版本/i.test(label);
}

function enrichLabel(el: HTMLElement, label: string) {
  const explicit = explicitAnalyticsLabel(el);
  if (explicit) return explicit;

  const track = nearbyTrackName(el);
  if (!track) return label;
  if (label.includes(track)) return label;
  if (!looksLikePlayback(label)) return label;
  return cleanText(`${label} · ${track}`);
}

function labelForTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  const el = target.closest(
    "a,button,[role='button'],input[type='button'],input[type='submit']",
  );
  if (!(el instanceof HTMLElement)) return null;

  return {
    label: enrichLabel(el, baseLabel(el)),
    href: hrefOf(el),
  };
}

/**
 * Invisible sitewide beacon. No UI, no layout impact.
 */
export default function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    sendEvent({
      type: "pageview",
      path: pathname,
      label: pathname,
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      const hit = labelForTarget(event.target);
      if (!hit) return;
      sendEvent({
        type: "click",
        path: window.location.pathname,
        label: hit.label,
        href: hit.href,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
