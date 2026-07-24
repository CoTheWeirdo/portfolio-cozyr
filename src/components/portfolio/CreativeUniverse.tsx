"use client";

import { useEffect, useRef, useState } from "react";
import { useIntro } from "@/components/portfolio/IntroOrchestrator";

export { default as StudioFigure } from "@/components/portfolio/StudioFigure";

type Tier = "core" | "craft" | "soft" | "work";

type NodeDef = {
  id: string;
  text: string;
  tier: Tier;
  x: number;
  y: number;
};

/**
 * Dreamy creative word field —
 * soft ambient float + local hover “parting air” repulsion.
 */
const NODES: NodeDef[] = [
  // Cores — equal anchors, irregular spread
  { id: "logic", text: "Logic Pro", tier: "core", x: 11, y: 16 },
  { id: "fl", text: "FL Studio", tier: "core", x: 70, y: 24 },
  { id: "suno", text: "Suno", tier: "core", x: 14, y: 74 },
  { id: "ai", text: "AI Workflow", tier: "core", x: 54, y: 54 },

  // Craft
  { id: "emotion", text: "情绪", tier: "craft", x: 36, y: 5 },
  { id: "lyrics", text: "歌词", tier: "craft", x: 3, y: 42 },
  { id: "melody", text: "旋律", tier: "craft", x: 34, y: 24 },
  { id: "arrange", text: "编曲", tier: "craft", x: 86, y: 12 },
  { id: "produce", text: "制作", tier: "craft", x: 36, y: 50 },
  { id: "sound", text: "声音", tier: "craft", x: 76, y: 48 },
  { id: "inspire", text: "灵感", tier: "craft", x: 5, y: 56 },
  { id: "mix", text: "混音", tier: "craft", x: 46, y: 84 },
  { id: "heard", text: "被听见", tier: "craft", x: 82, y: 70 },

  // Soft
  { id: "prompt", text: "Prompt", tier: "soft", x: 52, y: 10 },
  { id: "midi", text: "MIDI", tier: "soft", x: 24, y: 30 },
  { id: "cursor", text: "Cursor", tier: "soft", x: 2, y: 22 },
  { id: "python", text: "Python", tier: "soft", x: 88, y: 42 },
  { id: "r", text: "R", tier: "soft", x: 6, y: 88 },
  { id: "data", text: "Data", tier: "soft", x: 66, y: 40 },
  { id: "texture", text: "Texture", tier: "soft", x: 86, y: 58 },
  { id: "iteration", text: "Iteration", tier: "soft", x: 30, y: 62 },

  // Works
  { id: "melt", text: "《融化》", tier: "work", x: 22, y: 48 },
  { id: "utopia", text: "《乌托邦》", tier: "work", x: 58, y: 28 },
  { id: "dnd", text: "《勿扰模式》", tier: "work", x: 66, y: 86 },
  { id: "nawone", text: "《那我呢》", tier: "work", x: 40, y: 70 },
];

const TIER = {
  core: { size: 1.55, weight: 600, opacity: 0.9, floatAmp: 9 },
  craft: { size: 1.08, weight: 480, opacity: 0.64, floatAmp: 13 },
  soft: { size: 0.78, weight: 400, opacity: 0.4, floatAmp: 16 },
  work: { size: 0.98, weight: 500, opacity: 0.58, floatAmp: 12 },
} as const;

/** Hover radius in field % — only nearby words part */
const REPEL_RADIUS = 26;
/** Push strength in px (smoothed toward this) */
const REPEL_MIN = 14;
const REPEL_MAX = 28;

type Live = NodeDef & {
  phaseX: number;
  phaseY: number;
  periodX: number;
  periodY: number;
  ampScale: number;
};

function seed(): Live[] {
  return NODES.map((node, i) => {
    // Every word floats; cores a bit steadier, soft words freer
    const ampScale = node.tier === "core" ? 0.85 : node.tier === "soft" ? 1.15 : 1;
    return {
      ...node,
      phaseX: i * 1.37 + 0.4,
      phaseY: i * 1.91 + 1.1,
      // ~4–8s cycles so motion is clearly readable
      periodX: 4.2 + (i % 7) * 0.55,
      periodY: 5.0 + ((i * 3) % 6) * 0.5,
      ampScale,
    };
  });
}

function useIsMobile(bp = 767) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [bp]);
  return mobile;
}

/**
 * Phone-only decorative float layer — max 5 words, fixed positions.
 * Safe of nav / name / body / CTAs / cat. Desktop NODES untouched.
 */
type MobileWord = {
  id: string;
  text: string;
  x: number;
  y: number;
  opacity: number;
  duration: number;
  delay: number;
};

const MOBILE_WORDS: MobileWord[] = [
  /* Below nav, right gutter — clear of brand + links */
  { id: "logic", text: "Logic Pro", x: 80, y: 16, opacity: 0.26, duration: 10, delay: 0 },
  /* Right of masthead / aka, above body copy */
  { id: "fl", text: "FL Studio", x: 91, y: 28, opacity: 0.24, duration: 11.5, delay: 1.1 },
  /* Below second pitch / near CTA row, far right — above cat */
  { id: "ai", text: "AI Workflow", x: 86, y: 62, opacity: 0.2, duration: 12.5, delay: 0.5 },
  /* Below CTA, left gutter */
  { id: "suno", text: "Suno", x: 14, y: 78, opacity: 0.28, duration: 9, delay: 1.7 },
  /* Above cat, left of guitar body */
  { id: "inspire", text: "灵感", x: 28, y: 84, opacity: 0.16, duration: 13, delay: 0.35 },
];

export default function CreativeUniverse() {
  const rootRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const liveRef = useRef(seed());
  const focusRef = useRef<string | null>(null);
  const mouseRef = useRef({ x: 50, y: 50, inside: false });
  const mobile = useIsMobile();
  const { fieldReveal, fieldLive, playIntro, ready } = useIntro();
  // Float after staged entrance (or immediately when intro is skipped / already played)
  const floatEnabled = ready && fieldLive;
  // Gate CSS entrance on reveal flags — not on playIntro, so a late playIntro=false
  // does not drop the reveal class before words have painted.
  const awaitingField = ready && !fieldReveal;
  const revealingField = ready && fieldReveal && !fieldLive;

  useEffect(() => {
    if (mobile) return;
    const root = rootRef.current;
    if (!root) return;

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        mouseRef.current.inside = false;
        focusRef.current = null;
        return;
      }

      mouseRef.current.inside = true;
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      mouseRef.current.x = x;
      mouseRef.current.y = y;

      let best: { id: string; dist: number } | null = null;
      for (const node of liveRef.current) {
        const dist = Math.hypot(node.x - x, node.y - y);
        const hit = node.tier === "core" ? 12 : node.tier === "craft" ? 9 : 7.5;
        if (dist < hit && (!best || dist < best.dist)) best = { id: node.id, dist };
      }
      focusRef.current = best?.id ?? null;
    };

    const onLeave = () => {
      mouseRef.current.inside = false;
      focusRef.current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
    };
  }, [mobile]);

  useEffect(() => {
    if (mobile) return;
    if (!floatEnabled) return;
    const nodes = liveRef.current;
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const start = performance.now();
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = reduceMq.matches;

    let lastFocus: string | null | undefined = undefined;

    const ox = new Float32Array(nodes.length);
    const oy = new Float32Array(nodes.length);
    const sc = new Float32Array(nodes.length);
    const op = new Float32Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      sc[i] = 1;
      op[i] = TIER[nodes[i].tier].opacity;
    }

    // Field size in px — for clamping push so words stay in the right panel
    let fieldW = 1;
    let fieldH = 1;
    const measure = () => {
      const r = root.getBoundingClientRect();
      fieldW = Math.max(1, r.width);
      fieldH = Math.max(1, r.height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    const onReduce = () => {
      reduce = reduceMq.matches;
      if (reduce) {
        ox.fill(0);
        oy.fill(0);
        focusRef.current = null;
      }
    };
    reduceMq.addEventListener("change", onReduce);

    const paint = (t: number) => {
      const animate = !reduce;
      const focus = focusRef.current;
      const focusChanged = focus !== lastFocus;
      lastFocus = focus;
      const focusNode = focus ? nodes.find((n) => n.id === focus) : null;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const el = nodeRefs.current[i];
        if (!el) continue;

        const style = TIER[node.tier];
        const isFocus = focus === node.id;

        let floatX = 0;
        let floatY = 0;
        let pushX = 0;
        let pushY = 0;
        let targetOp: number = style.opacity;
        const targetSc = isFocus ? 1.04 : 1;

        if (animate) {
          // Ambient float — every word drifts on its own orbit
          const wx = (Math.PI * 2) / node.periodX;
          const wy = (Math.PI * 2) / node.periodY;
          const amp = style.floatAmp * node.ampScale;
          const sx = Math.sin(t * wx + node.phaseX);
          const sy = Math.sin(t * wy + node.phaseY);
          const sx2 = Math.sin(t * wx * 0.55 + node.phaseY + 0.8);
          const sy2 = Math.cos(t * wy * 0.6 + node.phaseX + 1.2);
          floatX = sx * amp * 0.7 + sx2 * amp * 0.35;
          floatY = sy * amp * 0.65 + sy2 * amp * 0.35;

          // Local parting — nearby words only; focused word stays put
          if (focusNode && !isFocus) {
            const dx = node.x - focusNode.x;
            const dy = node.y - focusNode.y;
            const dist = Math.hypot(dx, dy) || 0.001;
            if (dist < REPEL_RADIUS) {
              const falloff = Math.pow(1 - dist / REPEL_RADIUS, 0.55);
              const strength = REPEL_MIN + (REPEL_MAX - REPEL_MIN) * falloff;
              const nx = dx / dist;
              const ny = dy / dist;
              pushX = nx * strength;
              pushY = ny * strength;
              // Keep some float so parting still feels alive
              floatX *= 0.45;
              floatY *= 0.45;
            }
          }
        }

        if (isFocus) targetOp = Math.min(1, style.opacity * 1.14);
        else if (focusNode && animate) {
          const d = Math.hypot(node.x - focusNode.x, node.y - focusNode.y);
          if (d < REPEL_RADIUS * 0.85) targetOp = Math.min(1, style.opacity * 1.05);
        }

        let targetX = floatX + pushX;
        let targetY = floatY + pushY;

        // Keep words inside the field (leave margin so they don't hit edges / marquee)
        const marginX = 18;
        const marginY = 14;
        const absX = (node.x / 100) * fieldW + targetX;
        const absY = (node.y / 100) * fieldH + targetY;
        if (absX < marginX) targetX += marginX - absX;
        if (absX > fieldW - marginX) targetX -= absX - (fieldW - marginX);
        if (absY < marginY) targetY += marginY - absY;
        if (absY > fieldH - marginY) targetY -= absY - (fieldH - marginY);

        // Smooth inertia — float tracks sine closely so motion is visible
        const pushing = Math.hypot(pushX, pushY) > 0.5;
        const lerp = animate ? (isFocus ? 0.18 : pushing ? 0.14 : 0.14) : 1;
        ox[i] += (targetX - ox[i]) * lerp;
        oy[i] += (targetY - oy[i]) * lerp;
        sc[i] += (targetSc - sc[i]) * (animate ? 0.12 : 1);
        op[i] += (targetOp - op[i]) * (animate ? 0.1 : 1);

        el.style.transform = `translate3d(-50%, -50%, 0) translate3d(${ox[i].toFixed(2)}px, ${oy[i].toFixed(2)}px, 0) scale(${sc[i].toFixed(3)})`;
        el.style.opacity = op[i].toFixed(3);

        if (focusChanged) {
          el.classList.toggle("field-word--hot", isFocus);
          const near =
            Boolean(focusNode) &&
            !isFocus &&
            Math.hypot(node.x - (focusNode?.x ?? 0), node.y - (focusNode?.y ?? 0)) < REPEL_RADIUS * 0.85;
          el.classList.toggle("field-word--near", near);
        }
      }
    };

    const tick = (now: number) => {
      paint((now - start) / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      reduceMq.removeEventListener("change", onReduce);
      ro.disconnect();
    };
  }, [mobile, floatEnabled]);

  const mobileEntrance =
    awaitingField
      ? " field-map--await"
      : revealingField
        ? " field-map--reveal"
        : "";
  const liveClass =
    floatEnabled || (!awaitingField && !revealingField)
      ? " mobile-floating-words--live"
      : "";
  const entranceClass = awaitingField
    ? " field-map--await"
    : revealingField
      ? " field-map--reveal"
      : "";

  // Always render both layers — CSS toggles visibility by breakpoint
  // (avoids hydration mismatch from JS media queries).
  return (
    <>
      <aside
        className={`field-map field-map--mobile mobile-floating-words${mobileEntrance}${liveClass}`}
        aria-hidden
      >
        {MOBILE_WORDS.map((node, index) => (
          <span
            key={node.id}
            className="mobile-floating-words__word field-word"
            style={{
              ["--x" as string]: `${node.x}%`,
              ["--y" as string]: `${node.y}%`,
              ["--delay" as string]: `${node.delay}s`,
              ["--duration" as string]: `${node.duration}s`,
              ["--word-opacity" as string]: String(node.opacity),
              ["--enter-delay" as string]: `${0.05 + index * 0.07}s`,
              ["--enter-opacity" as string]: String(node.opacity),
            }}
          >
            {node.text}
          </span>
        ))}
      </aside>

      <aside
        ref={rootRef}
        className={`field-map field-map--desktop${entranceClass}`}
        aria-hidden
      >
        {liveRef.current.map((node, index) => {
          const style = TIER[node.tier];
          const coreOrder = ["logic", "fl", "suno", "ai"];
          const enterDelay =
            node.tier === "core"
              ? 0.06 * Math.max(0, coreOrder.indexOf(node.id))
              : 0.42 + index * 0.035;
          return (
            <span
              key={node.id}
              ref={(el) => {
                nodeRefs.current[index] = el;
              }}
              className={`field-word field-word--${node.tier}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                fontSize: `clamp(${0.78 * style.size}rem, ${1.55 * style.size}vw, ${1.55 * style.size}rem)`,
                fontWeight: style.weight,
                opacity:
                  floatEnabled || (!awaitingField && !revealingField)
                    ? style.opacity
                    : undefined,
                ["--enter-delay" as string]: `${enterDelay}s`,
                ["--enter-opacity" as string]: String(style.opacity),
              }}
            >
              {node.text}
            </span>
          );
        })}
      </aside>
    </>
  );
}
