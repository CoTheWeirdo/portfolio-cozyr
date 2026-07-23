"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { animate, useReducedMotion } from "framer-motion";
import StudioFigure from "@/components/portfolio/StudioFigure";

/** Stage 1 progress fill 0→100 */
const LOADING_MS = 1750;
/** Brief hold at 100% before cat moves / copy fades */
const HOLD_AT_100_MS = 220;
/** Cat diagonal shrink to corner */
const CAT_MOVE_MS = 1000;
/** Intro content begins shortly after the cat starts moving */
const REVEAL_AFTER_MOVE_MS = 200;
/** Word-field staged entrance */
const FIELD_REVEAL_AFTER_MOVE_MS = 450;
/** Ambient float after staged word entrance */
const FIELD_LIVE_AFTER_REVEAL_MS = 1700;
/** When progress hits 100% and hold ends — cat + fade begin */
const CAT_GO_MS = LOADING_MS + HOLD_AT_100_MS;

export type IntroPhase = "loading" | "catTransition" | "intro";

type IntroContextValue = {
  phase: IntroPhase;
  /** True while the cinematic intro should run this visit */
  playIntro: boolean;
  /** Hydration decision finished */
  ready: boolean;
  /** Content may begin staggered reveal */
  reveal: boolean;
  /** Word-field staged entrance may begin */
  fieldReveal: boolean;
  /** Ambient float + hover-repel may run */
  fieldLive: boolean;
  /** Cat has reached the easter-egg slot (or intro skipped) */
  catSettled: boolean;
  /**
   * When true, the persistent bridge cat owns the corner slot —
   * IntroStudioCat must stay unmounted to avoid a double cat.
   */
  bridgeOwnsCat: boolean;
  skip: () => void;
};

const IntroContext = createContext<IntroContextValue>({
  phase: "intro",
  playIntro: false,
  ready: true,
  reveal: true,
  fieldReveal: true,
  fieldLive: true,
  catSettled: true,
  bridgeOwnsCat: false,
  skip: () => {},
});

export function useIntro() {
  return useContext(IntroContext);
}

type IntroProviderProps = {
  children: ReactNode;
};

export function IntroProvider({ children }: IntroProviderProps) {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>("loading");
  const [playIntro, setPlayIntro] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [fieldReveal, setFieldReveal] = useState(false);
  const [fieldLive, setFieldLive] = useState(false);
  const [catSettled, setCatSettled] = useState(false);
  const [bridgeOwnsCat, setBridgeOwnsCat] = useState(false);
  const skippingRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const settle = useCallback(() => {
    clearTimers();
    skippingRef.current = true;
    setPhase("intro");
    setPlayIntro(false);
    setReveal(true);
    setFieldReveal(true);
    setFieldLive(true);
    setCatSettled(true);
    setBridgeOwnsCat(false);
  }, [clearTimers]);

  const skip = useCallback(() => {
    if (!ready) return;
    if (phase === "intro") return;
    settle();
  }, [phase, ready, settle]);

  // Decide once after mount — always replay opening on refresh (no sessionStorage)
  useEffect(() => {
    const preferReduce =
      reduceMotion === true ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (preferReduce) {
      setPlayIntro(false);
      setPhase("intro");
      setReveal(true);
      setFieldReveal(true);
      setFieldLive(true);
      setCatSettled(true);
      setBridgeOwnsCat(false);
      setReady(true);
      return;
    }

    skippingRef.current = false;
    setPlayIntro(true);
    setPhase("loading");
    setReveal(false);
    setFieldReveal(false);
    setFieldLive(false);
    setCatSettled(false);
    setBridgeOwnsCat(true);
    setReady(true);
    // Intentionally once: reduceMotion may go null→false and must not reset the timeline
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Choreography timeline — schedule reveal steps once when ready.
   * Must NOT re-run when playIntro flips false (that would clear fieldLive timers).
   * Cat settle / overlay teardown is driven by IntroBridgeCat arrival.
   */
  useEffect(() => {
    if (!ready || !playIntro) return;

    const ids = [
      window.setTimeout(() => {
        if (skippingRef.current) return;
        setPhase("catTransition");
      }, CAT_GO_MS),

      window.setTimeout(() => {
        if (skippingRef.current) return;
        setReveal(true);
      }, CAT_GO_MS + REVEAL_AFTER_MOVE_MS),

      window.setTimeout(() => {
        if (skippingRef.current) return;
        setFieldReveal(true);
      }, CAT_GO_MS + FIELD_REVEAL_AFTER_MOVE_MS),

      window.setTimeout(() => {
        if (skippingRef.current) return;
        setFieldLive(true);
        setPlayIntro(false);
      }, CAT_GO_MS + FIELD_REVEAL_AFTER_MOVE_MS + FIELD_LIVE_AFTER_REVEAL_MS),
    ];
    timersRef.current.push(...ids);

    return () => {
      for (const id of ids) window.clearTimeout(id);
      timersRef.current = timersRef.current.filter((t) => !ids.includes(t));
    };
    // Only when hydration decision lands — playIntro is set in the same commit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Once the bridge cat lands, unmount the fullscreen overlay (phase → intro)
  useEffect(() => {
    if (!ready || !catSettled) return;
    if (skippingRef.current) return;
    setPhase((p) => (p === "intro" ? p : "intro"));
  }, [ready, catSettled]);

  // Skip: click / Enter / Space (optional — intro + words still auto-play)
  useEffect(() => {
    if (!ready || phase === "intro") return;

    const onPointer = (e: PointerEvent) => {
      if (e.button !== 0) return;
      skip();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        skip();
      }
    };

    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [ready, phase, skip]);

  const onCatArrived = useCallback(() => {
    setCatSettled(true);
  }, []);

  const value = useMemo<IntroContextValue>(
    () => ({
      phase,
      playIntro,
      ready,
      reveal,
      fieldReveal,
      fieldLive,
      catSettled,
      bridgeOwnsCat,
      skip,
    }),
    [
      phase,
      playIntro,
      ready,
      reveal,
      fieldReveal,
      fieldLive,
      catSettled,
      bridgeOwnsCat,
      skip,
    ],
  );

  const showOverlay =
    ready && (phase === "loading" || phase === "catTransition");

  return (
    <IntroContext.Provider value={value}>
      {children}
      {bridgeOwnsCat ? (
        <IntroBridgeCat
          phase={phase}
          catSettled={catSettled}
          onCatArrived={onCatArrived}
        />
      ) : null}
      {showOverlay ? <IntroLoaderOverlay phase={phase} /> : null}
    </IntroContext.Provider>
  );
}

/**
 * Single persistent cat: loading slot → one diagonal tween to corner → stays.
 * Never unmounted during the intro visit, so no fade-out / fade-in twin.
 */
function IntroBridgeCat({
  phase,
  catSettled,
  onCatArrived,
}: {
  phase: IntroPhase;
  catSettled: boolean;
  onCatArrived: () => void;
}) {
  const catRef = useRef<HTMLDivElement>(null);
  const arrivedRef = useRef(false);
  const [hint, setHint] = useState(false);
  const hintTimer = useRef(0);
  const strumTimer = useRef(0);
  const reduceMotion = useReducedMotion();
  const settled = catSettled;
  const loading = phase === "loading";

  // Pin to the loader cat-slot so gap/centering match the copy stack
  useEffect(() => {
    if (phase !== "loading") return;
    const el = catRef.current;
    if (!el) return;

    const sync = () => {
      const slot = document.querySelector(".intro-loader__cat-slot");
      if (!slot) return;
      const r = slot.getBoundingClientRect();
      el.style.left = `${r.left}px`;
      el.style.top = `${r.top}px`;
      el.style.width = `${r.width}px`;
      el.style.translate = "none";
    };

    sync();
    const raf = requestAnimationFrame(sync);
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sync);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "catTransition" || arrivedRef.current) return;
    const el = catRef.current;
    if (!el) return;

    // Stop bob and clear its transform before measuring flight start
    el.classList.remove("intro-bridge-cat--bob");
    el.style.transform = "none";

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const endW = Math.min(112, Math.max(88, vw * 0.072));
    const endRight = Math.min(40, Math.max(24, vw * 0.024));
    const endBottom = Math.min(40, Math.max(24, vh * 0.04));
    const endLeft = vw - endRight - endW;
    const endTop = vh - endBottom - endW * (200 / 139);

    // Measure live cat, then one tween: current → corner + scale (no mid keyframes)
    const startRect = el.getBoundingClientRect();
    const dx = endLeft - startRect.left;
    const dy = endTop - startRect.top;
    const scale = endW / Math.max(1, startRect.width);

    let cancelled = false;
    const controls = animate(
      el,
      { x: dx, y: dy, scale },
      {
        duration: CAT_MOVE_MS / 1000,
        ease: [0.22, 1, 0.36, 1],
      },
    );

    controls.then(() => {
      if (cancelled || arrivedRef.current) return;
      // Bake visual rect into left/top/width so we can drop Framer transforms
      // (keeps hint / hit-area aligned; avoids a twin-cat remount).
      const visual = el.getBoundingClientRect();
      el.style.transform = "none";
      el.style.left = `${visual.left}px`;
      el.style.top = `${visual.top}px`;
      el.style.width = `${visual.width}px`;
      el.style.translate = "none";
      arrivedRef.current = true;
      el.classList.add("intro-bridge-cat--settled");
      onCatArrived();
    });

    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [phase, onCatArrived]);

  // Quiet breath + occasional soft strum once settled
  useEffect(() => {
    if (!settled || reduceMotion) return;
    const el = catRef.current;
    if (!el) return;

    const schedule = () => {
      const wait = 4200 + Math.random() * 3200;
      strumTimer.current = window.setTimeout(() => {
        el.classList.remove("intro-bridge-cat--strum");
        void el.offsetWidth;
        el.classList.add("intro-bridge-cat--strum");
        schedule();
      }, wait);
    };
    schedule();
    return () => window.clearTimeout(strumTimer.current);
  }, [settled, reduceMotion]);

  useEffect(() => {
    if (!settled || reduceMotion) return;
    const el = catRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const pad = 28;
      const near =
        e.clientX >= rect.left - pad &&
        e.clientX <= rect.right + pad &&
        e.clientY >= rect.top - pad &&
        e.clientY <= rect.bottom + pad;

      if (!near) return;
      if (el.dataset.busy === "1") return;
      el.dataset.busy = "1";
      el.classList.remove("intro-bridge-cat--strum", "intro-bridge-cat--strum2");
      void el.offsetWidth;
      el.classList.add("intro-bridge-cat--strum");
      window.setTimeout(() => {
        el.classList.add("intro-bridge-cat--strum2");
      }, 280);
      setHint(true);
      window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => {
        setHint(false);
        el.dataset.busy = "0";
      }, 1600);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(hintTimer.current);
    };
  }, [settled, reduceMotion]);

  return (
    <div
      ref={catRef}
      className={[
        "intro-bridge-cat",
        loading ? "intro-bridge-cat--bob" : "",
        settled ? "intro-bridge-cat--settled" : "",
        settled && !reduceMotion ? "intro-bridge-cat--breathe" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {loading ? <span className="intro-loader__wave" /> : null}
      <StudioFigure />
      {hint ? (
        <span className="intro-bridge-cat__hint" role="status">
          灵感生成中…
        </span>
      ) : null}
    </div>
  );
}

/**
 * Fullscreen veil + centered copy/progress during Stage 1.
 * Cat lives in IntroBridgeCat so AnimatePresence / overlay exit never unmounts it.
 */
/** Wall-clock start so Strict Mode remount never rewinds 0→100 */
let loaderProgressStartedAt: number | null = null;

function IntroLoaderOverlay({ phase }: { phase: IntroPhase }) {
  const loading = phase === "loading";
  const [progress, setProgress] = useState(0);

  // Single progress value drives bar width + % label (no CSS / random progress)
  useEffect(() => {
    if (loaderProgressStartedAt == null) {
      loaderProgressStartedAt = performance.now();
    }
    const startedAt = loaderProgressStartedAt;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      const next = Math.min(100, (elapsed / LOADING_MS) * 100);
      setProgress(next);
      if (next < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Never show 100% before the tween actually completes
  const shownPct = progress >= 100 ? 100 : Math.min(99, Math.round(progress));

  return (
    <div
      className={`intro-loader${loading ? " intro-loader--loading" : " intro-loader--exiting"}`}
      aria-hidden
    >
      <div className="intro-loader__veil" />
      <div className="intro-loader__glow" />
      <div className="intro-loader__stack">
        {/* Spacer matches bridge-cat footprint so label sits 24–32px below */}
        <div className="intro-loader__cat-slot" />
        <div
          className={`intro-loader__copy${loading ? "" : " intro-loader__copy--out"}`}
        >
          <p className="intro-loader__label">
            灵感加载中
            <span className="intro-loader__dots" aria-hidden>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
          <div
            className="intro-loader__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={shownPct}
          >
            <span
              className="intro-loader__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="intro-loader__pct">{shownPct}%</span>
        </div>
      </div>
      <p className="intro-loader__hint">点击或按 Enter 跳过</p>
    </div>
  );
}

/**
 * Corner easter-egg cat for reduced-motion / skip paths
 * (when the bridge cat was never mounted).
 */
export function IntroStudioCat() {
  const { bridgeOwnsCat, catSettled, ready } = useIntro();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(false);
  const hintTimer = useRef(0);
  const strumTimer = useRef(0);
  const reduceMotion = useReducedMotion();

  // Bridge owns the single cat for the animated path — never mount a twin
  const visible = ready && catSettled && !bridgeOwnsCat;

  useEffect(() => {
    if (!visible || reduceMotion) return;
    const el = wrapRef.current;
    if (!el) return;

    const schedule = () => {
      const wait = 4200 + Math.random() * 3200;
      strumTimer.current = window.setTimeout(() => {
        el.classList.remove("hero-studio-wrap--strum");
        void el.offsetWidth;
        el.classList.add("hero-studio-wrap--strum");
        schedule();
      }, wait);
    };
    schedule();
    return () => window.clearTimeout(strumTimer.current);
  }, [visible, reduceMotion]);

  useEffect(() => {
    if (!visible || reduceMotion) return;
    const zone = wrapRef.current?.parentElement;
    if (!zone) return;

    const onMove = (e: PointerEvent) => {
      const rect = zone.getBoundingClientRect();
      const pad = 28;
      const near =
        e.clientX >= rect.left - pad &&
        e.clientX <= rect.right + pad &&
        e.clientY >= rect.top - pad &&
        e.clientY <= rect.bottom + pad;

      if (!near) return;
      const el = wrapRef.current;
      if (!el || el.dataset.busy === "1") return;
      el.dataset.busy = "1";
      el.classList.remove("hero-studio-wrap--strum", "hero-studio-wrap--strum2");
      void el.offsetWidth;
      el.classList.add("hero-studio-wrap--strum");
      window.setTimeout(() => {
        el.classList.add("hero-studio-wrap--strum2");
      }, 280);
      setHint(true);
      window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => {
        setHint(false);
        el.dataset.busy = "0";
      }, 1600);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(hintTimer.current);
    };
  }, [visible, reduceMotion]);

  if (!visible) return null;

  return (
    <>
      <div
        ref={wrapRef}
        className={`hero-studio-wrap${reduceMotion ? "" : " hero-studio-wrap--breathe"}`}
      >
        <StudioFigure />
      </div>
      {hint ? (
        <span className="hero-studio-hint" role="status">
          灵感生成中…
        </span>
      ) : null}
    </>
  );
}

/** Stagger delays (seconds) after `reveal` becomes true */
export const REVEAL_DELAY = {
  nav: 0.12,
  meta: 0.32,
  title: 0.52,
  alias: 0.88,
  pitch: 1.12,
  pitchSecond: 1.32,
  actions: 1.52,
  universe: 0.45,
  marquee: 1.85,
} as const;
