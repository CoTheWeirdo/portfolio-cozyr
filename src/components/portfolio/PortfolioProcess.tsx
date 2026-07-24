"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import FuzzyText from "@/components/react-bits/FuzzyText";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { processEvidence } from "@/data/portfolioContent";

export default function PortfolioProcess() {
  const reduceMotion = useReducedMotion();

  return (
    <PortfolioShell ferro="process">
      <section id="process" className="section section--dark" aria-labelledby="process-title">
        <header className="section__head">
          <span>02 / 创作现场</span>
          <span>歌词草稿 · 工程文件 · 制作细节</span>
        </header>
        <div className="process">
          <div className="process__intro">
            <h2 id="process-title" className="section__title section__title--cn" aria-label="不是结果，是留下的痕迹。">
              {reduceMotion ? (
                <>不是结果，<br />是留下的痕迹。</>
              ) : (
                <FuzzyText
                  className="page-fuzzy page-fuzzy--process"
                  fontSize="clamp(2.1rem, 4vw, 4rem)"
                  fontWeight={600}
                  fontFamily='"Hiragino Sans GB", "PingFang SC", sans-serif'
                  color="#ede9df"
                  baseIntensity={0.13}
                  hoverIntensity={0.42}
                  enableHover
                  fuzzRange={20}
                  fps={40}
                  direction="horizontal"
                  transitionDuration={10}
                >
                  不是结果，是留下的痕迹。
                </FuzzyText>
              )}
            </h2>
            <p>从一句尚未完成的歌词，到逐渐成形的工程文件。这里展示音乐真正被写下、拆开与重组的过程。</p>
          </div>
          <div className="process__gallery">
            {processEvidence.map((item, index) => (
              <motion.figure
                className={`process-shot process-shot--${index + 1}`}
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                {index === 0 ? (
                  <div className="process-shot__media process-shot__media--stack lyric-stack-mobile">
                    <div className="lyric-stack" aria-label="四张歌词创作过程截图占位">
                      {item.files.map((file, layerIndex) => (
                        <div className="lyric-stack__sheet" key={file}>
                          <Image
                            src={`/process/${file}`}
                            alt={`歌词创作草稿 ${layerIndex + 1}`}
                            fill
                            sizes="(max-width: 767px) 70vw, 28vw"
                          />
                          <span>LYRIC / {String(layerIndex + 1).padStart(2, "0")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="process-shot__media">
                    <span>IMAGE / {String(index + 1).padStart(2, "0")}</span>
                    <strong>{item.title}</strong>
                    <small>稍后替换为 {item.files[0]}</small>
                  </div>
                )}
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.note}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>
    </PortfolioShell>
  );
}
