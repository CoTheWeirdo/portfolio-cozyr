import Image from "next/image";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import { autoRenewalCase } from "@/data/autoRenewalCase";
import ProcessAudioExperience from "./ProcessAudioExperience";
import TasteAudioButton from "./TasteAudioButton";
import styles from "./process-page.module.css";

// The process case study stays server-rendered; audio controls hydrate separately.
const COVER = "/assets/works/auto-renewal/cover.png";
const TEMPO = autoRenewalCase.brief.sonic.tempo;

/** Top → bottom: texture down to emotion */
const SOUND_LAYERS = [
  { en: "TEXTURE", cn: "质感", layerClass: "sliceLayer1" },
  { en: "VOICE", cn: "人声", layerClass: "sliceLayer2" },
  { en: "RHYTHM", cn: "节奏", layerClass: "sliceLayer3" },
  { en: "LYRICS", cn: "歌词", layerClass: "sliceLayer4" },
  { en: "EMOTION", cn: "情绪", layerClass: "sliceLayer5" },
] as const;

const HERO_NOTES = [
  { label: "BASE", copy: "毕业后的求职焦虑" },
  { label: "FLAVOR", copy: "带一点自嘲" },
  { label: "TONE", copy: "不卖惨的深夜 R&B" },
] as const;

const VERSIONS = [
  {
    id: "V01",
    note: "偏离",
    tone: "dim",
    audio: "/audio/auto-renewal/version-deviated.mp3",
  },
  {
    id: "V02",
    note: "接近",
    tone: "mid",
    audio: "/audio/auto-renewal/version-close.mp3",
  },
  {
    id: "V03",
    note: "留下",
    tone: "final",
    audio: "/audio/auto-renewal/version-retained.mp3",
  },
] as const;

const OBSERVE = ["旋律记忆点", "人声自然度", "情绪贴合度"] as const;

const WAVE_HEIGHTS = [
  [34, 48, 62, 40, 72, 55, 38, 66, 44, 58, 36, 70, 48, 42, 60, 35],
  [40, 58, 46, 68, 52, 74, 44, 62, 50, 70, 42, 56, 64, 48, 72, 38],
  [46, 64, 52, 78, 58, 70, 48, 74, 56, 66, 50, 80, 60, 54, 72, 44],
] as const;

export default function ProcessPage() {
  return (
    <PortfolioShell className="portfolio--process" ferro="process">
      <div className={styles.page}>
        <section className={styles.hero} aria-labelledby="process-hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>CASE FILE / 自动续费</p>
            <h1 id="process-hero-title" className={styles.heroTitle}>
              一首歌的切面
            </h1>
            <p className={styles.heroEn} aria-hidden="true">
              THE LAYERS OF A SONG
            </p>
            <div className={styles.heroLead}>
              <p>做一首歌，像把不同的味道一层层叠起来。</p>
              <p>
                AI 生成不同的可能，
                <br />
                我负责试听、调整和选择。
              </p>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.sliceBlock}>
              <div className={styles.sliceStack} aria-hidden="true">
                {SOUND_LAYERS.map((layer) => (
                  <div
                    key={layer.en}
                    className={`${styles.sliceLayer} ${styles[layer.layerClass]}`}
                  >
                    <span className={styles.sliceEn}>{layer.en}</span>
                    <span className={styles.sliceCn}>{layer.cn}</span>
                  </div>
                ))}
              </div>
              <div
                className={styles.bpmStamp}
                aria-label={`${TEMPO.bpm} ${TEMPO.unit}`}
              >
                <span className={styles.bpmNumber}>{TEMPO.bpm}</span>
                <span className={styles.bpmUnit}>{TEMPO.unit}</span>
              </div>
            </div>

            <ul className={styles.heroNotes}>
              {HERO_NOTES.map((note) => (
                <li key={note.label}>
                  <span>{note.label}</span>
                  {note.copy}
                </li>
              ))}
            </ul>

            <p className={styles.recipeLine}>
              深夜 R&B · 低声贴耳 · 稀疏鼓点 · 朦胧电吉他
            </p>
            <p className={styles.avoidNote}>
              <span>AVOID</span>
              欢快律动 · 高音炫技 · 过度煽情 · 网络热歌感
            </p>
          </div>
        </section>

        <section className={styles.taste} aria-labelledby="process-taste-title">
          <header className={styles.tasteHead}>
            <div className={styles.tasteHeading}>
              <p className={styles.tasteEn} aria-hidden="true">
                TASTE TEST / SAME SOURCE
              </p>
              <h2 id="process-taste-title" className={styles.tasteTitle}>
                版本试味
              </h2>
              <p className={styles.tasteMeta} aria-hidden="true">
                ONE RECIPE / THREE RESULTS
              </p>
            </div>
            <p className={styles.tasteLead}>
              同一份配方，三次试味。
              <br />
              把差异放在同一条线上，选择才真正能够被听见。
            </p>
            <div className={styles.tasteCount} aria-hidden="true">
              <strong>03</strong>
              <span>GENERATED CUTS</span>
            </div>
          </header>

          <div className={styles.compareDesk}>
            <div className={styles.compareTop} aria-hidden="true">
              <span className={styles.liveState}>
                <i />
                COMPARISON MONITOR
              </span>
              <span>20 SEC / SELECTED MOMENTS</span>
            </div>

            <div className={styles.compareBody}>
              <aside className={styles.sourcePanel} aria-label="试听素材">
                <div className={styles.sourceArtwork}>
                  <div className={styles.coverEchoes} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.sourceCover}>
                    <Image
                      src={COVER}
                      alt="《自动续费》封面"
                      fill
                      sizes="(max-width: 700px) 62vw, 240px"
                      className={styles.coverImg}
                    />
                  </div>
                </div>
                <div className={styles.sourceCaption}>
                  <span>
                    SOURCE / {TEMPO.bpm} {TEMPO.unit}
                  </span>
                  <strong>自动续费</strong>
                  <p>深夜 R&amp;B · 不同段落 · 同一时长</p>
                </div>
              </aside>

              <div className={styles.versionRack}>
                <div className={styles.rackScale} aria-hidden="true">
                  <span>VERSION</span>
                  <span>SIGNAL / 00:20</span>
                  <span>DECISION</span>
                </div>

                {VERSIONS.map((version, index) => (
                  <article
                    key={version.id}
                    className={`${styles.version} ${styles[`version_${version.tone}`]}`}
                  >
                    <header className={styles.versionHead}>
                      <span className={styles.versionId}>{version.id}</span>
                      <span className={styles.versionIndex}>
                        0{index + 1} / 03
                      </span>
                    </header>

                    <div className={styles.versionSignal}>
                      <TasteAudioButton
                        src={version.audio}
                        label={`${version.id} ${version.note}版本`}
                        className={styles.playDot}
                        activeClassName={styles.playDotActive}
                      />
                      <div className={styles.wave} aria-hidden="true">
                        {WAVE_HEIGHTS[index].map((height, barIndex) => (
                          <span
                            key={barIndex}
                            className={styles.waveBar}
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <span className={styles.time}>00:20</span>
                    </div>

                    <div className={styles.versionDecision}>
                      <span className={styles.versionNote}>{version.note}</span>
                      {version.tone === "final" ? (
                        <span className={styles.keepTag}>RETAINED</span>
                      ) : (
                        <span className={styles.passTag}>PASS</span>
                      )}
                    </div>
                  </article>
                ))}

                <footer className={styles.listenFor}>
                  <span>LISTEN FOR</span>
                  <ul>
                    {OBSERVE.map((label) => (
                      <li key={label}>
                        <i aria-hidden="true" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </footer>
              </div>
            </div>

            <div className={styles.compareFoot} aria-hidden="true">
              <span>GENERATE</span>
              <i />
              <span>COMPARE</span>
              <i />
              <span>ADJUST</span>
              <i />
              <strong>RETAIN / V03</strong>
            </div>
          </div>
        </section>

        <ProcessAudioExperience />
      </div>
    </PortfolioShell>
  );
}
