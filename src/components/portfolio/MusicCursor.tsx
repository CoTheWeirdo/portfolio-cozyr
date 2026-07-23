"use client";

import { useEffect, useRef } from "react";

export default function MusicCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    document.documentElement.classList.add("has-music-cursor");
    el.hidden = false;

    let x = -100;
    let y = -100;
    let hovering = false;
    let visible = false;
    let frame = 0;

    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.classList.toggle("music-cursor--visible", visible);
      el.classList.toggle("music-cursor--hover", hovering);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
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

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.classList.remove("has-music-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={cursorRef} className="music-cursor" aria-hidden hidden>
      <span className="music-cursor__glyph">🎸</span>
    </div>
  );
}
