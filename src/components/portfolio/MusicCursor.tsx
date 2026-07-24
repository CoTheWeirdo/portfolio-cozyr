"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Tip offset so the glyph sits just past the real pointer (6–10px only). */
const TIP = 8;

export default function MusicCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    const el = cursorRef.current;
    if (!el) return;

    // Confirm viewport-fixed portal mount.
    const pos = getComputedStyle(el).position;
    const parentOk = el.parentElement === document.body;
    if (pos !== "fixed" || !parentOk) {
      console.warn("[MusicCursor] expected fixed on document.body", {
        position: pos,
        parent: el.parentElement?.nodeName,
      });
    }

    document.documentElement.classList.add("has-music-cursor");
    el.hidden = false;

    let x = -100;
    let y = -100;
    let hovering = false;
    let visible = false;
    let frame = 0;

    const paint = () => {
      frame = 0;
      const node = cursorRef.current;
      if (!node) return;
      // Coords applied once via transform — left/top stay 0 in CSS.
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      node.classList.toggle("music-cursor--visible", visible);
      node.classList.toggle("music-cursor--hover", hovering);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = (event: MouseEvent) => {
      // Viewport coords only — never pageX/pageY/scroll compensation.
      x = event.clientX + TIP;
      y = event.clientY + TIP;
      visible = true;
      schedule();
    };

    const onLeave = () => {
      visible = false;
      schedule();
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      // Only real controls — not covers (avoids guitar cursor implying the art is the play hitbox).
      hovering = Boolean(target.closest("a, button, [role='button'], .clip-button"));
      schedule();
    };

    // pointermove is primary; mousemove covers environments that only emit mouse events.
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.classList.remove("has-music-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [mounted]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div ref={cursorRef} className="music-cursor" aria-hidden hidden>
      <span className="music-cursor__glyph">🎸</span>
    </div>,
    document.body,
  );
}
