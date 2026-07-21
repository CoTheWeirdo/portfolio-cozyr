"use client";

import { useEffect, useRef } from "react";
import { initTextOnPathScroll } from "@/lib/textOnPathScroll";

export default function CurvedTextInterlude() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    return initTextOnPathScroll(svg);
  }, []);

  return (
    <section className="sound-lines" aria-label="创作理念">
      <span className="sound-lines__label">Sound in motion / 声音轨迹</span>

      <div className="sound-lines__stage">
        <svg
          ref={svgRef}
          className="sound-lines__svg"
          width="120%"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 1000 220"
          role="img"
          aria-labelledby="sound-lines-title"
        >
          <title id="sound-lines-title">沿曲线移动的音乐创作文字</title>
          <path id="sound-curve-one" d="M 0 110 Q 250 210 500 110 Q 750 10 1000 110" fill="none" />
          <path id="sound-curve-two" d="M 0 110 Q 250 10 500 110 Q 750 210 1000 110" fill="none" />
          <text className="sound-lines__text sound-lines__text--one">
            <textPath href="#sound-curve-one">
              旋律不是装饰，而是情绪发生的方式。 · 旋律不是装饰，而是情绪发生的方式。 ·
            </textPath>
          </text>
          <text className="sound-lines__text sound-lines__text--two">
            <textPath href="#sound-curve-two">
              从一个想法开始，经过编曲，成为被听见的声音。 · 从一个想法开始，经过编曲，成为被听见的声音。 ·
            </textPath>
          </text>
        </svg>
      </div>
    </section>
  );
}
