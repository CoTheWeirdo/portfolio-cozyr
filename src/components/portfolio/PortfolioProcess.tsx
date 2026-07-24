"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import ProcessAnatomyHero from "@/components/portfolio/ProcessAnatomyHero";
import ProcessChapter from "@/components/portfolio/ProcessChapter";
import { processEvidence } from "@/data/portfolioContent";
import {
  decisionAxes,
  decisionStages,
  emotionalTags,
  lyricEditRecords,
  processChapters,
  songFormMarkers,
  soundLayers,
} from "@/data/processChapters";

export default function PortfolioProcess() {
  const reduceMotion = useReducedMotion();
  const lyricEvidence = processEvidence[0];
  const soundEvidence = processEvidence.slice(1);
  const [sourceMeta, lyricsMeta, soundMeta, decisionMeta] = processChapters;

  return (
    <PortfolioShell className="portfolio--process" ferro="process">
      <ProcessAnatomyHero reduceMotion={Boolean(reduceMotion)} />

      <div id="process" className="process-chapters">
        {/* ——— 01 Emotional source ——— */}
        <ProcessChapter meta={sourceMeta}>
          <div className="process-source">
            <div className="process-source__copy">
              <div className="process-source__note">
                <span className="process-source__label">VOICE NOTE · SOURCE 01</span>
                <p className="process-source__prompt">UNNAMED FEELING</p>
                <p className="process-source__stamp">02:14 AM</p>
              </div>
              <div className="process-source__spark">
                <span className="process-source__spark-label">SPARK</span>
                <p>还没有名字的瞬间，先被听见。</p>
              </div>
            </div>

            <div className="process-source__board" aria-hidden="true">
              <div className="process-source__wave">
                <svg viewBox="0 0 320 48" preserveAspectRatio="none" focusable="false">
                  <path
                    className="process-source__wave-path"
                    d="M0 24 L10 18 L20 30 L30 12 L40 34 L50 16 L60 28 L70 10 L80 32 L90 20 L100 26 L110 14 L120 30 L130 18 L140 24 L150 12 L160 28 L170 20 L180 24 L190 16 L200 26 L210 22 L220 24 L230 20 L240 25 L250 22 L260 24 L280 23 L300 24 L320 24"
                    fill="none"
                    stroke="rgba(185, 180, 216, 0.5)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <ul className="process-source__tags">
                {emotionalTags.map((tag, index) => (
                  <li
                    key={tag}
                    className="process-source__tag"
                    style={{ animationDelay: reduceMotion ? undefined : `${0.12 * index}s` }}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <div className="process-source__card">
                <span>VOICE NOTE</span>
                <strong>SOURCE 01</strong>
                <small>UNNAMED FEELING · 02:14 AM</small>
              </div>
            </div>
          </div>
        </ProcessChapter>

        {/* ——— 02 Lyrics & form ——— */}
        <ProcessChapter meta={lyricsMeta}>
          <div className="process-lyrics">
            <div className="process-lyrics__layout">
              <motion.figure
                className="process-shot process-lyrics__stack"
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="process-lyrics__stage">
                  <div className="lyric-stack" aria-label="四张歌词创作过程截图占位">
                    {lyricEvidence.files.map((file, layerIndex) => (
                      <div className="lyric-stack__sheet" key={file}>
                        <Image
                          src={`/process/${file}`}
                          alt={`歌词创作草稿 ${layerIndex + 1}`}
                          fill
                          sizes="(max-width: 767px) 78vw, 34vw"
                        />
                        <span>LYRIC / {String(layerIndex + 1).padStart(2, "0")}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <figcaption>
                  <span>02</span>
                  <div>
                    <h3>{lyricEvidence.title}</h3>
                    <p>{lyricEvidence.note}</p>
                  </div>
                </figcaption>
              </motion.figure>

              <aside className="process-lyrics__revision">
                {lyricEditRecords.original || lyricEditRecords.revision || lyricEditRecords.why ? (
                  <div className="process-lyrics__ledger" aria-label="歌词编辑记录">
                    {lyricEditRecords.original ? (
                      <div className="process-lyrics__row">
                        <span>ORIGINAL</span>
                        <p>{lyricEditRecords.original}</p>
                      </div>
                    ) : null}
                    {lyricEditRecords.revision ? (
                      <div className="process-lyrics__row">
                        <span>REVISION</span>
                        <p>{lyricEditRecords.revision}</p>
                      </div>
                    ) : null}
                    {lyricEditRecords.why ? (
                      <div className="process-lyrics__row">
                        <span>WHY</span>
                        <p>{lyricEditRecords.why}</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="process-lyrics__notes">
                    <span>LYRIC EDITING NOTES</span>
                    <span className="process-lyrics__notes-rule" aria-hidden="true" />
                    <p>{lyricEvidence.note}</p>
                  </div>
                )}
              </aside>
            </div>

            <div className="process-lyrics__form" aria-label="歌曲结构线">
              {songFormMarkers.map((marker) => (
                <span
                  key={marker}
                  className={marker === "HOOK" ? "process-lyrics__form-mark is-hook" : "process-lyrics__form-mark"}
                >
                  {marker}
                </span>
              ))}
            </div>
          </div>
        </ProcessChapter>

        {/* ——— 03 Sound construction ——— */}
        <ProcessChapter meta={soundMeta}>
          <div className="process-sound">
            <div className="process-sound__gallery">
              {soundEvidence.map((item, index) => (
                <motion.figure
                  className={`process-shot process-shot--${index + 2}`}
                  key={item.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="process-shot__media process-sound__media">
                    <span className="process-sound__overlay" aria-hidden="true" />
                    <span>IMAGE / {String(index + 2).padStart(2, "0")}</span>
                    <strong>{item.title}</strong>
                    <small>稍后替换为 {item.files[0]}</small>
                  </div>
                  <figcaption>
                    <span>{String(index + 2).padStart(2, "0")}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.note}</p>
                    </div>
                  </figcaption>
                </motion.figure>
              ))}
            </div>

            <ul className="process-sound__layers" aria-label="声音层级">
              {soundLayers.map((layer) => (
                <li key={layer.label} className="process-sound__layer">
                  <span>{layer.label}</span>
                  <span className="process-sound__layer-rule" />
                  {layer.description ? <p>{layer.description}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </ProcessChapter>

        {/* ——— 04 Decision log ——— */}
        <ProcessChapter meta={decisionMeta}>
          <div className="process-decision">
            <div className="process-decision__stages" aria-label="版本决策框架">
              {decisionStages.map((stage) => (
                <article
                  key={stage.id}
                  className={`process-decision__stage process-decision__stage--${stage.emphasis}`}
                >
                  <header>
                    <span>{stage.label}</span>
                  </header>
                  <ul className="process-decision__axes">
                    {decisionAxes.map((axis) => (
                      <li key={`${stage.id}-${axis}`}>
                        <span>{axis}</span>
                        <span className="process-decision__axis-rule" />
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <footer className="process-decision__close">
              <p>
                最终版本不是元素最多的版本，
                <br />
                而是每个选择都有理由的版本。
              </p>
              <p className="process-decision__en" aria-hidden="true">
                EVERY ELEMENT NEEDS A REASON.
              </p>
            </footer>
          </div>
        </ProcessChapter>
      </div>
    </PortfolioShell>
  );
}
