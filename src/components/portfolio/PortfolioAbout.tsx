"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import PortfolioShell from "@/components/portfolio/PortfolioShell";

const FOCUS_NOTES = [
  {
    id: "voice",
    vague: "这里听起来有点假。",
    en: "SOMETHING FEELS ARTIFICIAL",
    answer:
      "我会先听人声：咬字有没有被拉扯，换气是不是出现在不自然的位置，句尾和颤音是否像真的人在控制。",
    signals: ["咬字", "换气", "句尾", "颤音"],
  },
  {
    id: "style",
    vague: "好像不是这个风格。",
    en: "THE STYLE DOESN'T QUITE LAND",
    answer:
      "问题往往不在某一个音色，而在整套语汇没有对上。鼓组的力度、和声走向和乐器进入的方式，可能分别来自不同的审美。",
    signals: ["鼓组", "和声", "配器", "音色"],
  },
  {
    id: "emotion",
    vague: "就是没什么感觉。",
    en: "THE EMOTION ISN'T THERE YET",
    answer:
      "我会比较旋律、人声和编曲是不是在表达同一种情绪。有时关键词写对了，真正的情绪却没有落在声音里。",
    signals: ["旋律", "演唱", "动态", "情绪"],
  },
] as const;

const LISTENING_NOTES = [
  {
    index: "01",
    en: "FIRST LISTEN",
    title: "先别急着挑细节",
    copy: "第一遍先听它想把人带到哪里。方向没站稳，后面的精致也很难救回来。",
  },
  {
    index: "02",
    en: "LISTEN AGAIN",
    title: "找到让我出戏的那一下",
    copy: "可能是一个咬字、一件乐器，也可能是情绪突然断掉。先记住身体比语言更早发现的地方。",
  },
  {
    index: "03",
    en: "WRITE IT DOWN",
    title: "把问题写成下一步",
    copy: "不止留下“奇怪”或“不好听”。说明问题出现在哪里、影响了什么，下一版才知道往哪走。",
  },
] as const;

const LYRIC_DRAFTS = [
  {
    title: "爱与厌",
    year: "2025",
    src: "/about/studio/lyric-love-hate-2025.png",
  },
  {
    title: "褪黑素",
    year: "2026",
    src: "/about/studio/lyric-melatonin-2026.png",
  },
  {
    title: "融化",
    year: "2025",
    src: "/about/studio/lyric-melt-2025.png",
  },
  {
    title: "没啥灵感",
    year: "2022",
    src: "/about/studio/lyric-no-idea-2022.png",
  },
  {
    title: "早期片段 01",
    year: "ARCHIVE",
    src: "/process/lyrics-01.png",
  },
  {
    title: "早期片段 02",
    year: "ARCHIVE",
    src: "/process/lyrics-02.png",
  },
  {
    title: "早期片段 03",
    year: "ARCHIVE",
    src: "/process/lyrics-03.png",
  },
  {
    title: "早期片段 04",
    year: "ARCHIVE",
    src: "/process/lyrics-04.png",
  },
  {
    title: "早期片段 05",
    year: "ARCHIVE",
    src: "/process/lyrics-05.png",
  },
] as const;

type PreviewImage = {
  src: string;
  alt: string;
};

export default function PortfolioAbout() {
  const reduceMotion = useReducedMotion();
  const [activeFocus, setActiveFocus] = useState(0);
  const [activeLyric, setActiveLyric] = useState(0);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const focus = FOCUS_NOTES[activeFocus];
  const lyric = LYRIC_DRAFTS[activeLyric];

  useEffect(() => {
    if (!previewImage) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewImage(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [previewImage]);

  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <PortfolioShell ferro="about" className="portfolio--about-page about-reframe">
      <section className="about-hero" aria-labelledby="about-title">
        <header className="about-chapter">
          <span>03 / ABOUT</span>
          <span>MAKE MUSIC / LISTEN CLOSELY</span>
        </header>

        <div className="about-hero__layout">
          <motion.div
            className="about-hero__copy"
            {...reveal}
            transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="about-hero__kicker">张韵蕊 · 独立唱作人 / 音乐制作人</p>
            <h1 id="about-title" className="about-hero__title">
              我做歌，
              <br />
              <em>也挑歌里的毛病。</em>
            </h1>
            <p className="about-hero__intro">
              写词、编曲、录人声、做混音，我都自己走过一遍。
              学数据分析以后，我开始习惯把“这里不太对”继续往下拆：
              是人声不自然，风格跑了，还是情绪没有落到位？
            </p>
          </motion.div>

          <motion.div
            className="about-calibrator"
            role="img"
            aria-label="反复聆听，直到能说清楚为什么"
            {...reveal}
            transition={{ duration: 0.86, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="about-calibrator__ring about-calibrator__ring--outer" aria-hidden="true" />
            <span className="about-calibrator__ring about-calibrator__ring--inner" aria-hidden="true" />
            <span className="about-calibrator__axis about-calibrator__axis--one" aria-hidden="true" />
            <span className="about-calibrator__axis about-calibrator__axis--two" aria-hidden="true" />
            <span className="about-calibrator__node about-calibrator__node--music" aria-hidden="true">
              MAKE
            </span>
            <span className="about-calibrator__node about-calibrator__node--data" aria-hidden="true">
              NOTICE
            </span>
            <span className="about-calibrator__node about-calibrator__node--ai" aria-hidden="true">
              NAME
            </span>
            <span className="about-calibrator__pulse" aria-hidden="true" />
            <div className="about-calibrator__center about-calibrator__center--portrait" aria-hidden="true">
              <div className="about-avatar-slot">
                <Image
                  className="about-avatar-slot__portrait"
                  src="/about/avatar-animated-exact-face-necklace.png"
                  alt=""
                  fill
                  sizes="12rem"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="about-identity-strip" aria-label="关于我的三个事实">
          <div>
            <span>NOW</span>
            <strong>在做自己的歌，也做完整制作</strong>
          </div>
          <div>
            <span>TRAINED IN</span>
            <strong>数据分析</strong>
          </div>
          <div>
            <span>NEXT</span>
            <strong>AI 音乐评测与音乐数据</strong>
          </div>
        </div>
      </section>

      <section className="about-focus" aria-labelledby="about-focus-title">
        <header className="about-focus__head">
          <span>LISTENING, IN FOCUS</span>
          <div>
            <h2 id="about-focus-title">“有点怪”只是开始。</h2>
            <p>点一句平时会脱口而出的评价，看看我会继续听什么。</p>
          </div>
        </header>

        <div className="about-focus__stage">
          <div className="about-focus__choices" role="group" aria-label="选择一种模糊听感">
            {FOCUS_NOTES.map((item, index) => {
              const active = index === activeFocus;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`about-focus__choice${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => setActiveFocus(index)}
                  onMouseEnter={() => setActiveFocus(index)}
                  onFocus={() => setActiveFocus(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.vague}</strong>
                  <small>{item.en}</small>
                </button>
              );
            })}
          </div>

          <div className="about-focus__answer" aria-live="polite">
            <span className="about-focus__crosshair" aria-hidden="true" />
            <motion.div
              key={focus.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.34, ease: "easeOut" }}
            >
              <span className="about-focus__answer-label">听感对焦 / {focus.en}</span>
              <p>{focus.answer}</p>
              <div className="about-focus__signals" aria-label="判断维度">
                {focus.signals.map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="about-studio" aria-labelledby="about-studio-title">
        <header className="about-studio__head">
          <span>CREATION IN PROGRESS</span>
          <div>
            <h2 id="about-studio-title">歌不是一下写完的。</h2>
            <p>
              左边是工程，右边是当时写下来的句子。
              一首歌通常是在反复写、听和修改里慢慢成形。
            </p>
          </div>
        </header>

        <div className="about-studio__layout">
          <div className="about-studio__scene" aria-label="真实音乐工程截图">
            <motion.button
              type="button"
              className="about-session about-session--arrangement"
              aria-label="放大查看 FL Studio 编曲工程"
              onClick={() =>
                setPreviewImage({
                  src: "/about/studio/project-arrangement.png",
                  alt: "FL Studio 编曲工程截图",
                })
              }
              initial={reduceMotion ? false : { opacity: 0, y: 28, rotate: -1.2 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1.2 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65 }}
            >
              <Image
                src="/about/studio/project-arrangement.png"
                alt="FL Studio 编曲工程截图"
                fill
                sizes="(max-width: 700px) 92vw, (max-width: 1100px) 78vw, 58vw"
              />
              <span className="about-session__shade" aria-hidden="true" />
              <span className="about-session__label">
                <small>01 / ARRANGEMENT</small>
                <strong>编曲工程</strong>
              </span>
              <span className="about-session__zoom" aria-hidden="true">↗</span>
            </motion.button>

            <motion.button
              type="button"
              className="about-session about-session--vocals"
              aria-label="放大查看人声编辑工程"
              onClick={() =>
                setPreviewImage({
                  src: "/about/studio/project-vocals.png",
                  alt: "人声录制与编辑工程截图",
                })
              }
              initial={reduceMotion ? false : { opacity: 0, x: -24, y: 18, rotate: 1.8 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: 1.8 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.68, delay: 0.12 }}
            >
              <Image
                src="/about/studio/project-vocals.png"
                alt="人声录制与编辑工程截图"
                fill
                sizes="(max-width: 700px) 72vw, (max-width: 1100px) 44vw, 30vw"
              />
              <span className="about-session__shade" aria-hidden="true" />
              <span className="about-session__label">
                <small>02 / VOCAL SESSION</small>
                <strong>人声工程</strong>
              </span>
              <span className="about-session__zoom" aria-hidden="true">↗</span>
            </motion.button>

            <motion.button
              type="button"
              className="about-session about-session--rhythm"
              aria-label="放大查看节奏与鼓组工程"
              onClick={() =>
                setPreviewImage({
                  src: "/about/studio/project-rhythm.png",
                  alt: "节奏、鼓组与自动化工程截图",
                })
              }
              initial={reduceMotion ? false : { opacity: 0, x: 22, y: 22, rotate: -2.3 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: -2.3 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.68, delay: 0.18 }}
            >
              <Image
                src="/about/studio/project-rhythm.png"
                alt="节奏、鼓组与自动化工程截图"
                fill
                sizes="(max-width: 700px) 56vw, (max-width: 1100px) 38vw, 25vw"
              />
              <span className="about-session__shade" aria-hidden="true" />
              <span className="about-session__label">
                <small>03 / RHYTHM LAYERS</small>
                <strong>节奏工程</strong>
              </span>
              <span className="about-session__zoom" aria-hidden="true">↗</span>
            </motion.button>

            <div className="about-studio__scene-meta" aria-hidden="true">
              <span>03 REAL PROJECT FILES</span>
              <span>点开看细节</span>
            </div>
          </div>

          <motion.aside
            className="about-lyrics"
            aria-labelledby="about-lyrics-title"
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.68, delay: 0.08 }}
          >
            <header className="about-lyrics__head">
              <div>
                <span id="about-lyrics-title">LYRIC DRAFTS</span>
                <strong>歌词草稿</strong>
              </div>
              <small>09 PAGES / 2022 — 2026</small>
            </header>

            <div className="about-lyrics__stack" role="group" aria-label="选择一份歌词草稿">
              {LYRIC_DRAFTS.map((draft, index) => {
                const offset =
                  (index - activeLyric + LYRIC_DRAFTS.length) % LYRIC_DRAFTS.length;
                const isActive = offset === 0;

                return (
                  <button
                    key={`${draft.title}-${draft.year}`}
                    type="button"
                    className={`about-lyrics__sheet about-lyrics__sheet--${offset}${
                      isActive ? " is-active" : ""
                    }`}
                    aria-hidden={offset > 3}
                    aria-label={
                      isActive
                        ? `放大查看《${draft.title}》歌词草稿`
                        : `切换到《${draft.title}》歌词草稿`
                    }
                    aria-pressed={isActive}
                    tabIndex={offset > 3 ? -1 : 0}
                    onClick={() =>
                      isActive
                        ? setPreviewImage({
                            src: draft.src,
                            alt: `《${draft.title}》歌词草稿`,
                          })
                        : setActiveLyric(index)
                    }
                  >
                    <Image
                      src={draft.src}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 64vw, (max-width: 1100px) 38vw, 22vw"
                    />
                    <span>
                      {draft.year} / {draft.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="about-lyrics__controls">
              <button
                type="button"
                aria-label="上一份歌词草稿"
                onClick={() =>
                  setActiveLyric(
                    (activeLyric - 1 + LYRIC_DRAFTS.length) % LYRIC_DRAFTS.length,
                  )
                }
              >
                ←
              </button>
              <span>
                {String(activeLyric + 1).padStart(2, "0")} /{" "}
                {String(LYRIC_DRAFTS.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                aria-label="下一份歌词草稿"
                onClick={() =>
                  setActiveLyric((activeLyric + 1) % LYRIC_DRAFTS.length)
                }
              >
                →
              </button>
            </div>

            <p className="about-lyrics__caption" aria-live="polite">
              <span>{lyric.year}</span>
              <strong>《{lyric.title}》</strong>
              <small>点纸张或箭头翻阅，再点当前页放大</small>
            </p>
          </motion.aside>
        </div>

        <div className="about-studio__notes" aria-labelledby="about-notes-title">
          <header>
            <span>EAR NOTES</span>
            <h3 id="about-notes-title">耳朵备忘录</h3>
          </header>

          <div className="about-studio__note-list">
            {LISTENING_NOTES.map((note, index) => (
              <motion.article
                key={note.index}
                className="about-studio-note"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 0.52, delay: index * 0.08 }}
              >
                <div>
                  <span>{note.index}</span>
                  <small>{note.en}</small>
                </div>
                <h4>{note.title}</h4>
                <p>{note.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {previewImage ? createPortal(
        <motion.div
          className="about-preview"
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.alt}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="about-preview__close"
            aria-label="关闭大图"
            onClick={() => setPreviewImage(null)}
          >
            关闭 ×
          </button>
          <div className="about-preview__image" onClick={(event) => event.stopPropagation()}>
            <Image
              src={previewImage.src}
              alt={previewImage.alt}
              fill
              sizes="94vw"
              priority
            />
          </div>
        </motion.div>,
        document.body,
      ) : null}

      <footer className="about-contact">
        <div className="about-contact__meta">
          <span>04 / CONTACT</span>
          <span>OPEN TO AI MUSIC &amp; CREATIVE ROLES</span>
        </div>

        <div className="about-contact__layout">
          <div className="about-contact__statement">
            <p>
              <span>我想把做音乐时练出来的耳朵，</span>
              <span>和数据分析的训练，</span>
              <span>一起带到这个岗位里。</span>
            </p>
            <span>想继续聊的话，给我写信。</span>
          </div>

          <div className="about-contact__actions">
            <a className="about-contact__primary" href="mailto:2312464576@qq.com">
              <span>给我写信</span>
              <strong>↗</strong>
            </a>
            <a
              className="about-contact__link"
              href="https://music.163.com/#/artist?id=35141857"
              target="_blank"
              rel="noreferrer"
            >
              先听一首歌 <span aria-hidden="true">↗</span>
            </a>
            <Link className="about-contact__link" href="/">
              回到首页 <span aria-hidden="true">←</span>
            </Link>
          </div>
        </div>

        <div className="about-contact__foot">
          <span>Yz香菜 · 张韵蕊</span>
          <span>音乐制作 / AI 音乐评测 / 音乐数据</span>
          <a href="mailto:2312464576@qq.com">2312464576@qq.com</a>
        </div>
      </footer>
    </PortfolioShell>
  );
}
