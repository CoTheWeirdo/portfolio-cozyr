"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Decorative bridge: waveform → tags → data nodes → waveform.
 * SVG + CSS only; pointer-events none; reduced-motion static.
 */
export default function SoundToSignalBridge() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="works-bridge" aria-labelledby="works-bridge-title">
      <header className="works-bridge__head">
        <p className="works-bridge__en" aria-hidden>
          FROM SOUND TO SIGNAL
        </p>
        <h2 id="works-bridge-title" className="works-bridge__title">
          从听感，到可比较的音乐判断
        </h2>
        <p className="works-bridge__lead">
          把主观听感拆成旋律、结构、音色、人声与风格标签，
          <br className="works-bridge__br" />
          再进入生成、比较与迭代。
        </p>
      </header>

      <div
        className={`works-bridge__stage${reduceMotion ? " works-bridge__stage--static" : ""}`}
        aria-hidden
      >
        <svg
          className="works-bridge__svg"
          viewBox="0 0 960 220"
          preserveAspectRatio="xMidYMid meet"
          role="presentation"
        >
          <defs>
            <linearGradient id="bridge-wave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(185,180,216,.15)" />
              <stop offset="50%" stopColor="rgba(120,170,210,.55)" />
              <stop offset="100%" stopColor="rgba(185,180,216,.15)" />
            </linearGradient>
          </defs>

          {/* Left waveform */}
          <g className="works-bridge__wave works-bridge__wave--in">
            <path
              d="M40 110 C70 70, 90 150, 120 110 S170 70, 200 110 S250 150, 280 110 S330 70, 360 110"
              fill="none"
              stroke="url(#bridge-wave)"
              strokeWidth="1.6"
            />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <line
                key={`in-${i}`}
                className="works-bridge__bar"
                x1={48 + i * 28}
                y1={110 - (10 + (i % 4) * 14)}
                x2={48 + i * 28}
                y2={110 + (10 + (i % 4) * 14)}
                stroke="rgba(185,180,216,.45)"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </g>

          {/* Center tags */}
          <g className="works-bridge__tags">
            {[
              { t: "旋律", x: 400, y: 48 },
              { t: "情绪", x: 470, y: 78 },
              { t: "人声", x: 420, y: 118 },
              { t: "结构", x: 500, y: 138 },
              { t: "音色", x: 450, y: 168 },
              { t: "风格一致性", x: 530, y: 98 },
            ].map((node, i) => (
              <text
                key={node.t}
                className="works-bridge__tag"
                x={node.x}
                y={node.y}
                style={{ animationDelay: `${0.4 + i * 0.18}s` }}
              >
                {node.t}
              </text>
            ))}
          </g>

          {/* English process nodes */}
          <g className="works-bridge__nodes">
            {[
              { t: "Prompt", x: 620, y: 58 },
              { t: "Data", x: 690, y: 92 },
              { t: "Evaluation", x: 640, y: 132 },
              { t: "Iteration", x: 710, y: 168 },
            ].map((node, i) => (
              <g key={node.t} className="works-bridge__node" style={{ animationDelay: `${1.2 + i * 0.2}s` }}>
                <rect
                  x={node.x - 4}
                  y={node.y - 14}
                  width={node.t.length * 7.2 + 18}
                  height={22}
                  rx="1"
                  fill="rgba(18,18,17,.55)"
                  stroke="rgba(185,180,216,.35)"
                />
                <text x={node.x + 6} y={node.y + 2}>
                  {node.t}
                </text>
              </g>
            ))}
          </g>

          {/* Right waveform */}
          <g className="works-bridge__wave works-bridge__wave--out">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line
                key={`out-${i}`}
                className="works-bridge__bar works-bridge__bar--out"
                x1={780 + i * 22}
                y1={110 - (8 + ((i + 2) % 5) * 12)}
                x2={780 + i * 22}
                y2={110 + (8 + ((i + 2) % 5) * 12)}
                stroke="rgba(120,170,210,.5)"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ animationDelay: `${2 + i * 0.1}s` }}
              />
            ))}
          </g>
        </svg>
      </div>
    </section>
  );
}
