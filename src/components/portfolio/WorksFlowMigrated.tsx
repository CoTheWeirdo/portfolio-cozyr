"use client";

import { useReducedMotion } from "framer-motion";
import FuzzyText from "@/components/react-bits/FuzzyText";
import SoundToSignalBridge from "@/components/portfolio/SoundToSignalBridge";
import AiLabSection from "@/components/portfolio/AiLabSection";
import MusicEvalSystem from "@/components/portfolio/MusicEvalSystem";

/**
 * Flow sections migrated from /works («听见») into /process («成形»).
 * Kept in original order; minimal visual wrapping only.
 */
export default function WorksFlowMigrated() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="process-works-flow">
      <section className="works-hero" aria-labelledby="process-flow-hero-title">
        <span className="works-hero__kicker">02 / 音乐生产系统</span>
        <h2 id="process-flow-hero-title" className="sr-only">
          从 DAW 到模型
        </h2>
        <div className="works-hero__title" aria-hidden="true">
          {reduceMotion ? (
            <span className="works-hero__title-text">从 DAW 到模型</span>
          ) : (
            <FuzzyText
              className="page-fuzzy page-fuzzy--works"
              fontSize="clamp(2.25rem, 5vw, 4.6rem)"
              fontWeight={600}
              fontFamily='"Hiragino Sans GB", "PingFang SC", sans-serif'
              color="#ede9df"
              baseIntensity={0.14}
              hoverIntensity={0.45}
              enableHover
              fuzzRange={22}
              fps={42}
              direction="horizontal"
              transitionDuration={8}
            >
              从 DAW 到模型
            </FuzzyText>
          )}
        </div>
        <p className="works-hero__en" aria-hidden>
          FROM DAW TO MODEL
        </p>
        <p className="works-hero__sub">独立制作 × AI 音乐工作流</p>
        <p className="works-hero__lead">
          我先用耳朵和 DAW 完成作品，
          <br />
          再把审美判断拆成标签、对比与迭代。
        </p>
      </section>

      <section className="works-human section section--works" aria-labelledby="process-human-title">
        <header className="works-chapter-head works-chapter-head--human">
          <div className="works-chapter-head__row">
            <span className="works-chapter-head__index">01 / 独立制作</span>
            <span className="works-chapter-head__en" aria-hidden>
              HUMAN-LED
              <br />
              PRODUCTION
            </span>
          </div>
          <h2 id="process-human-title" className="works-chapter-head__title">
            完整主导一首作品的生成
          </h2>
          <p className="works-chapter-head__lead">
            从旋律、编曲到人声与混音，
            <br className="works-bridge__br" />
            完整主导一首作品的生成过程。
          </p>
        </header>
      </section>

      <SoundToSignalBridge />
      <AiLabSection />
      <MusicEvalSystem />
    </div>
  );
}
