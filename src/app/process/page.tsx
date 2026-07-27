import Image from "next/image";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import ProcessAudioExperience from "./ProcessAudioExperience";
import styles from "./process-page.module.css";

const COVER = "/assets/works/auto-renewal/cover.png";

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
  { id: "V01", note: "偏离", tone: "dim", ghosts: 5 },
  { id: "V02", note: "接近", tone: "mid", ghosts: 4 },
  { id: "V03", note: "留下", tone: "final", ghosts: 3 },
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
              <div className={styles.bpmStamp} aria-label="72 BPM">
                <span className={styles.bpmNumber}>72</span>
                <span className={styles.bpmUnit}>BPM</span>
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
            <p className={styles.tasteEn} aria-hidden="true">
              TASTE TEST / SAME SECTION · SAME LENGTH
            </p>
            <h2 id="process-taste-title" className={styles.tasteTitle}>
              版本试味
            </h2>
            <p className={styles.tasteLead}>
              同一份配方，三次试味。
              <br />
              把三个版本放在一起，
              <br />
              差异才真正能够被听见。
            </p>
            <p className={styles.tasteMeta} aria-hidden="true">
              ONE RECIPE / THREE RESULTS
            </p>
          </header>

          <div className={styles.versionGrid}>
            {VERSIONS.map((version, index) => (
              <article
                key={version.id}
                className={`${styles.version} ${styles[`version_${version.tone}`]}`}
              >
                <header className={styles.versionHead}>
                  <span className={styles.versionId}>{version.id}</span>
                  <span className={styles.versionNote}>{version.note}</span>
                </header>

                <div className={styles.versionVisual} aria-hidden="true">
                  <div className={styles.versionGhosts}>
                    {Array.from({ length: version.ghosts }, (_, ghostIndex) => (
                      <span
                        key={ghostIndex}
                        className={styles.versionGhost}
                        style={{ ["--g" as string]: String(ghostIndex) }}
                      />
                    ))}
                  </div>
                  <div className={styles.cover}>
                    <Image
                      src={COVER}
                      alt=""
                      fill
                      sizes="(max-width: 860px) 42vw, 11vw"
                      className={styles.coverImg}
                    />
                  </div>
                </div>

                <div className={styles.playRow}>
                  <span
                    className={styles.playDot}
                    aria-disabled="true"
                    aria-hidden="true"
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
                </div>

                <p className={styles.time}>00:00 / 00:12</p>
                <p className={styles.clipTag}>SAME SECTION / SAME LENGTH</p>

                <ul className={styles.observe}>
                  {OBSERVE.map((label) => (
                    <li key={label}>
                      <span>{label}</span>
                      <span className={styles.observeLine} aria-hidden="true">
                        —————
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <ProcessAudioExperience />
      </div>
    </PortfolioShell>
  );
}
