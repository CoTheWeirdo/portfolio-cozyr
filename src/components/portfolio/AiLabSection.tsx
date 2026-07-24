"use client";

import Image from "next/image";
import { useState } from "react";
import type { AiWorkItem } from "@/data/portfolioContent";
import { CLIP_DURATION_SEC } from "@/data/portfolioContent";

type AiLabSectionProps = {
  items: readonly AiWorkItem[];
  activeTrack: string | null;
  isPlaying: boolean;
  clipProgress: number;
  onToggle: (id: string, clip: string) => void;
};

function AiProjectCard({
  item,
  isPlaying,
  isActive,
  clipProgress,
  onToggle,
}: {
  item: AiWorkItem;
  isPlaying: boolean;
  isActive: boolean;
  clipProgress: number;
  onToggle: (id: string, clip: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasDetail =
    Boolean(item.promptControl?.length) ||
    Boolean(item.iterations?.length) ||
    Boolean(item.evaluation) ||
    Boolean(item.finalDecision);

  return (
    <article className={`ai-card${open ? " ai-card--open" : ""}`}>
      <div className="ai-card__cover">
        <Image src={item.cover} alt={`${item.title} 封面`} fill sizes="(max-width: 767px) 88vw, 320px" />
      </div>
      <div className="ai-card__body">
        <div className="ai-card__meta">
          <h3 className="ai-card__title">{item.title}</h3>
          <span className="ai-card__type">AI 协作实验</span>
          {item.goal ? <p className="ai-card__goal">{item.goal}</p> : null}
        </div>

        <div className="clip-control ai-card__clip">
          <button
            className={`clip-button ${isPlaying ? "clip-button--playing" : ""}`}
            type="button"
            aria-label={`${isPlaying ? "Pause" : "Play"} ${item.title} clip`}
            onClick={() => onToggle(item.id, item.audio)}
          >
            <span className="clip-button__icon" aria-hidden>
              {isPlaying ? "Ⅱ" : "▶"}
            </span>
            <span>{isPlaying ? "播放中" : "试听片段"}</span>
            <span className="clip-button__time">
              {isActive
                ? `00:${String(Math.min(CLIP_DURATION_SEC, Math.floor(clipProgress * CLIP_DURATION_SEC))).padStart(2, "0")}`
                : `00:${String(CLIP_DURATION_SEC).padStart(2, "0")}`}
            </span>
          </button>
          <span className="clip-button__progress" aria-hidden="true">
            <span style={isActive ? { transform: `scaleX(${clipProgress})` } : undefined} />
          </span>
        </div>

        {item.abCompare ? (
          <div className="ai-card__ab" role="group" aria-label="版本对比">
            <button type="button" className="ai-card__ab-btn" onClick={() => onToggle(`${item.id}-a`, item.abCompare!.a.audio)}>
              A / {item.abCompare.a.label}
            </button>
            <button type="button" className="ai-card__ab-btn" onClick={() => onToggle(`${item.id}-b`, item.abCompare!.b.audio)}>
              B / {item.abCompare.b.label}
            </button>
          </div>
        ) : null}

        {hasDetail ? (
          <>
            <button
              type="button"
              className="ai-card__toggle"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "收起实验记录" : "查看实验记录"}
            </button>
            {open ? (
              <div className="ai-card__detail">
                {item.promptControl?.length ? (
                  <div className="ai-card__block">
                    <span className="ai-card__label">
                      <em>INPUT</em> 输入控制
                    </span>
                    <ul>
                      {item.promptControl.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {item.iterations?.length ? (
                  <div className="ai-card__block">
                    <span className="ai-card__label">
                      <em>ITERATION</em> 迭代观察
                    </span>
                    <ul>
                      {item.iterations.map((step) => (
                        <li key={step.label}>
                          <strong>{step.label}</strong> — {step.note}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {item.evaluation ? (
                  <div className="ai-card__block">
                    <span className="ai-card__label">
                      <em>EVALUATION</em> 评测结论
                    </span>
                    <ul className="ai-card__evals">
                      {item.evaluation.melody ? <li>旋律：{item.evaluation.melody}</li> : null}
                      {item.evaluation.vocal ? <li>人声：{item.evaluation.vocal}</li> : null}
                      {item.evaluation.structure ? <li>结构：{item.evaluation.structure}</li> : null}
                      {item.evaluation.styleMatch ? <li>风格贴合：{item.evaluation.styleMatch}</li> : null}
                    </ul>
                  </div>
                ) : null}
                {item.finalDecision ? (
                  <div className="ai-card__block">
                    <span className="ai-card__label">
                      <em>GOAL</em> 最终判断
                    </span>
                    <p>{item.finalDecision}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

export default function AiLabSection({
  items,
  activeTrack,
  isPlaying,
  clipProgress,
  onToggle,
}: AiLabSectionProps) {
  return (
    <section className="works-ai" aria-labelledby="works-ai-title">
      <header className="works-chapter-head">
        <div className="works-chapter-head__row">
          <span className="works-chapter-head__index">02 / AI 协作实验</span>
          <span className="works-chapter-head__en" aria-hidden>
            AI-ASSISTED
            <br />
            MUSIC LAB
          </span>
        </div>
        <h2 id="works-ai-title" className="works-chapter-head__title">
          可控生成与听感边界
        </h2>
        <p className="works-chapter-head__lead">
          通过目标设定、Prompt 控制、版本比较与听感评测，
          <br className="works-bridge__br" />
          探索 AI 在音乐内容生产中的可控性与边界。
        </p>
      </header>

      {items.length > 0 ? (
        <div className="works-ai__grid">
          {items.map((item) => (
            <AiProjectCard
              key={item.id}
              item={item}
              isPlaying={activeTrack === item.id && isPlaying}
              isActive={activeTrack === item.id}
              clipProgress={clipProgress}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : (
        <div className="works-ai__frame" aria-label="AI 实验记录结构预留">
          <div className="works-ai__frame-row">
            <span>
              <em>GOAL</em> 创作目标
            </span>
            <span>
              <em>INPUT</em> 输入控制
            </span>
          </div>
          <div className="works-ai__frame-row">
            <span>
              <em>ITERATION</em> 迭代观察
            </span>
            <span>
              <em>EVALUATION</em> 听感评测
            </span>
          </div>
          <p className="works-ai__frame-note">
            真实实验案例将在有可公开的音频与记录后放入此处。下方评测框架说明我如何拆解听感判断。
          </p>
        </div>
      )}
    </section>
  );
}
