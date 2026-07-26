"use client";

import FuzzyText from "@/components/react-bits/FuzzyText";

type ProcessAnatomyHeroProps = {
  reduceMotion: boolean;
};

const CHAPTERS = [
  "01  情绪采样",
  "02  语言与结构",
  "03  声音决策",
  "04  选择与淘汰",
] as const;

export default function ProcessAnatomyHero({ reduceMotion }: ProcessAnatomyHeroProps) {
  return (
    <section
      className="process-anatomy-hero"
      aria-labelledby="process-title"
    >
      <div className="process-anatomy-hero__glow" aria-hidden="true" />

      <div className="process-anatomy-hero__inner">
        <div className="process-anatomy-hero__copy">
          <p className="process-anatomy-hero__kicker">03 / 创作方法</p>

          <h1 id="process-title" className="sr-only">
            创作解剖室｜从灵感到成品的音乐制作过程
          </h1>
          <div className="process-anatomy-hero__title" aria-hidden="true">
            {reduceMotion ? (
              <span className="process-anatomy-hero__title-text">创作解剖室</span>
            ) : (
              <FuzzyText
                className="page-fuzzy page-fuzzy--process-anatomy"
                fontSize="clamp(48px, 5vw, 72px)"
                fontWeight={600}
                fontFamily='"Hiragino Sans GB", "PingFang SC", sans-serif'
                color="#ede9df"
                baseIntensity={0.11}
                hoverIntensity={0.35}
                enableHover
                fuzzRange={17}
                fps={42}
                direction="horizontal"
                transitionDuration={9}
              >
                创作解剖室
              </FuzzyText>
            )}
          </div>

          <p className="process-anatomy-hero__en" aria-hidden="true">
            <span>ANATOMY</span>
            <span>OF A SONG</span>
          </p>

          <p className="process-anatomy-hero__sub">一首歌是如何长出来的</p>

          <p className="process-anatomy-hero__lead">
            从一句模糊的情绪开始，
            <br />
            经过文字、结构、声音与一次次选择，
            <br />
            最后变成可以被听见的作品。
          </p>
        </div>

        <div className="process-anatomy-hero__archive" aria-hidden="true">
          <div className="process-archive">
            <span className="process-archive__mark process-archive__mark--a" />
            <span className="process-archive__mark process-archive__mark--b" />
            <span className="process-archive__rule process-archive__rule--h" />
            <span className="process-archive__rule process-archive__rule--v" />

            <div className="process-archive__stamp">
              <span>02:14 AM</span>
              <span>SESSION 07</span>
            </div>

            <div className="process-archive__body">
              <div className="process-archive__lyric">
                <span className="process-archive__meta">VERSE 01 · SENSORY NOTE</span>
                <p className="process-archive__line">
                  我想盛夏大概是橘子味道的汽水
                  <span className="process-archive__caret" />
                </p>
                <p className="process-archive__note">把一个季节，写成可以入口的味道。</p>

                <div className="process-archive__sensory">
                  <span className="sensory-item">
                    <span className="sensory-label">SEASON</span>
                    <span className="sensory-value">盛夏</span>
                  </span>
                  <span className="process-archive__sensory-sep" aria-hidden="true" />
                  <span className="sensory-item">
                    <span className="sensory-label">TASTE</span>
                    <span className="sensory-value">橘子</span>
                  </span>
                  <span className="process-archive__sensory-sep" aria-hidden="true" />
                  <span className="sensory-item">
                    <span className="sensory-label">TEXTURE</span>
                    <span className="sensory-value">气泡感</span>
                  </span>
                </div>
              </div>

              <div className="process-archive__wave">
                <svg viewBox="0 0 280 36" preserveAspectRatio="none" focusable="false">
                  <path
                    d="M0 18 L8 12 L16 22 L24 10 L32 26 L40 14 L48 20 L56 8 L64 24 L72 16 L80 18 L88 11 L96 25 L104 15 L112 21 L120 9 L128 23 L136 17 L144 19 L152 13 L160 22 L168 16 L176 18 L184 14 L192 20 L200 17 L208 18 L216 16 L224 19 L232 17 L240 18 L248 17.5 L256 18 L280 18"
                    fill="none"
                    stroke="rgba(185, 180, 216, 0.45)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="process-archive__wave-label">TAKE 03 · VOICE</span>
              </div>

              <div className="process-archive__daw">
                <div className="process-archive__lane process-archive__lane--a">
                  <span>HOOK</span>
                </div>
                <div className="process-archive__lane process-archive__lane--b">
                  <span>TEXTURE</span>
                </div>
                <div className="process-archive__lane process-archive__lane--c">
                  <span>VERSE</span>
                </div>
                <span className="process-archive__playhead" />
              </div>

              <div className="process-archive__tags">
                <span>VERSE</span>
                <span>HOOK</span>
                <span>TEXTURE</span>
                <span>VOICE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="process-anatomy-hero__index">
          <ul className="process-anatomy-hero__chapters">
            {CHAPTERS.map((chapter) => (
              <li key={chapter}>{chapter}</li>
            ))}
          </ul>
          <p className="process-anatomy-hero__scroll">SCROLL TO DISSECT ↓</p>
        </div>
      </div>
    </section>
  );
}
