"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { type CSSProperties, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import CurvedTextInterlude from "@/components/portfolio/CurvedTextInterlude";

/** Cover-matched audition accents (hex → CSS rgb channels via hexToRgb). */
function hexToRgb(hex: string) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const n = Number.parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

const works = [
  {
    id: 1,
    image: "/works/utopia.jpg",
    clip: "/audio/track-01.mp3",
    label: "Utopia",
    subtitle: "（乌托邦）",
    glow: "#C41E1A",
    glowSoft: "#7A1412",
    type: "原创歌曲",
  },
  {
    id: 2,
    image: "/works/juzi-qishui.png",
    clip: "/audio/track-02.mp3",
    label: "橘子汽水",
    subtitle: "（Feat. Saxon）",
    glow: "#F08A3C",
    glowSoft: "#E8729A",
    type: "原创歌曲",
  },
  {
    id: 3,
    image: "/works/ronghua.png",
    clip: "/audio/track-03.mp3",
    label: "融化",
    subtitle: undefined,
    glow: "#5BC4F0",
    glowSoft: "#2A7EB8",
    type: "原创歌曲",
  },
  {
    id: 4,
    image: "/works/na-wo-ne.png",
    clip: "/audio/track-04.mp3",
    label: "那我呢",
    subtitle: undefined,
    glow: "#FF6BB5",
    glowSoft: "#6FE0F0",
    type: "原创歌曲",
  },
  {
    id: 5,
    image: "/works/bianqu-01.png",
    clip: "/audio/track-05.mp3",
    label: "Fire the hole",
    subtitle: undefined,
    glow: "#E85A1A",
    glowSoft: "#FFB347",
    type: "编曲作品",
  },
  {
    id: 6,
    image: "/works/langman-yinzi.png",
    clip: "/audio/track-06.mp3",
    label: "浪漫因子",
    subtitle: undefined,
    glow: "#C45BA8",
    glowSoft: "#5B7FD4",
    type: "编曲作品",
  },
];

const processEvidence = [
  { title: "写词草稿", note: "五段不同时期的歌词记录：从一句灵感，到逐渐成形的段落。", files: ["lyrics-01.png", "lyrics-02.png", "lyrics-03.png", "lyrics-04.png", "lyrics-05.png"] },
  { title: "工程全景", note: "用完整轨道结构呈现段落、配器与动态推进", files: ["daw-overview.jpg"] },
  { title: "编曲细节", note: "MIDI、鼓组、音色与自动化的局部设计", files: ["arrangement-detail.jpg"] },
  { title: "人声与混音", note: "主唱编辑、和声叠层、插件链与空间处理", files: ["vocal-mix.jpg"] },
];

export default function PortfolioHome() {
  const portfolioRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const worksRailRef = useRef<HTMLDivElement>(null);
  const worksSequenceRef = useRef<HTMLDivElement>(null);
  const worksRailPausedRef = useRef({ hover: false, interaction: false, focus: false, visible: false });
  const clipHoverCountRef = useRef(0);
  const dragRef = useRef({ active: false, lastX: 0, moved: false });
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  /** True only while the card 「试听片段」 clip is audibly playing. */
  const [isPlaying, setIsPlaying] = useState(false);
  /** 0–1 audition progress, synced to real playback (not CSS-duration guesses). */
  const [clipProgress, setClipProgress] = useState(0);
  const [audioMissing, setAudioMissing] = useState<number | null>(null);
  const [isDraggingWorks, setIsDraggingWorks] = useState(false);
  /** Drives listening atmosphere + cover glow; null when paused/ended. */
  const playingTrack = isPlaying ? activeTrack : null;
  const activeWork = playingTrack === null ? null : works.find((work) => work.id === playingTrack);
  const CLIP_DURATION_SEC = 20;

  const syncClipProgress = useCallback((audio: HTMLAudioElement) => {
    // Always map against the declared 20s audition length so the bar
    // matches the UI seconds even if browser metadata is slightly off.
    const next = audio.currentTime / CLIP_DURATION_SEC;
    setClipProgress(Math.min(1, Math.max(0, next)));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) syncClipProgress(audio);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, syncClipProgress]);

  const listeningStyle = {
    "--listening-a": activeWork ? hexToRgb(activeWork.glow) : "185 180 216",
    "--listening-b": activeWork ? hexToRgb(activeWork.glowSoft) : "80 137 169",
    "--listening-c": activeWork ? hexToRgb(activeWork.glow) : "164 92 72",
  } as CSSProperties;

  useEffect(() => () => audioRef.current?.pause(), []);

  const normalizeWorksRail = useCallback(() => {
    const rail = worksRailRef.current;
    const sequence = worksSequenceRef.current;
    if (!rail || !sequence) return;

    const loopDistance = sequence.offsetWidth;
    if (!loopDistance) return;

    if (rail.scrollLeft < loopDistance * .5) {
      rail.scrollLeft += loopDistance;
    } else if (rail.scrollLeft >= loopDistance * 1.5) {
      rail.scrollLeft -= loopDistance;
    }
  }, []);

  useEffect(() => {
    const rail = worksRailRef.current;
    const sequence = worksSequenceRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 1023px)").matches;
    if (!rail || !sequence) return;

    const placeInMiddleCopy = () => {
      const loopDistance = sequence.offsetWidth;
      if (loopDistance) rail.scrollLeft = loopDistance;
    };

    placeInMiddleCopy();
    const resizeObserver = new ResizeObserver(placeInMiddleCopy);
    let frame = 0;
    let previousTime = 0;

    const moveRail = (time: number) => {
      frame = 0;
      if (!worksRailPausedRef.current.visible) {
        previousTime = 0;
        return;
      }

      if (!previousTime) previousTime = time;
      const elapsed = Math.min(time - previousTime, 40);
      const pauseState = worksRailPausedRef.current;

      if (!pauseState.hover && !pauseState.interaction && !pauseState.focus) {
        rail.scrollLeft += elapsed * .042;
        normalizeWorksRail();
      }

      previousTime = time;
      frame = window.requestAnimationFrame(moveRail);
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      worksRailPausedRef.current.visible = entry.isIntersecting;
      if (reduceMotion || coarsePointer || narrow) return;

      if (entry.isIntersecting && !frame) {
        frame = window.requestAnimationFrame(moveRail);
      } else if (!entry.isIntersecting && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      }
    }, { rootMargin: "160px 0px" });
    resizeObserver.observe(sequence);
    visibilityObserver.observe(rail);
    rail.addEventListener("scroll", normalizeWorksRail, { passive: true });

    if (reduceMotion || coarsePointer || narrow) {
      return () => {
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        rail.removeEventListener("scroll", normalizeWorksRail);
      };
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      rail.removeEventListener("scroll", normalizeWorksRail);
    };
  }, [normalizeWorksRail]);

  function startWorksDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("button, a")) return;
    dragRef.current = { active: true, lastX: event.clientX, moved: false };
    worksRailPausedRef.current.interaction = true;
    setIsDraggingWorks(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveWorksDrag(event: PointerEvent<HTMLDivElement>) {
    const rail = worksRailRef.current;
    const drag = dragRef.current;
    if (!rail || !drag.active) return;

    const delta = event.clientX - drag.lastX;
    if (Math.abs(delta) > 1) drag.moved = true;
    rail.scrollLeft -= delta;
    drag.lastX = event.clientX;
    normalizeWorksRail();
  }

  function finishWorksDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    worksRailPausedRef.current.interaction = false;
    setIsDraggingWorks(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function toggleTrack(id: number, clip: string) {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrack === id) {
      if (!audio.paused) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      setAudioMissing(null);
      try {
        if (audio.ended) {
          audio.currentTime = 0;
          setClipProgress(0);
        }
        await audio.play();
        setIsPlaying(true);
      } catch {
        setActiveTrack(null);
        setIsPlaying(false);
        setAudioMissing(id);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
    audio.src = clip;
    audio.load();
    audio.currentTime = 0;
    setClipProgress(0);
    setAudioMissing(null);
    setActiveTrack(id);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setActiveTrack(null);
      setIsPlaying(false);
      setClipProgress(0);
      setAudioMissing(id);
    }
  }

  function pauseRailForHover() {
    clipHoverCountRef.current += 1;
    worksRailPausedRef.current.hover = true;
  }

  function resumeRailFromHover() {
    clipHoverCountRef.current = Math.max(0, clipHoverCountRef.current - 1);
    worksRailPausedRef.current.hover = clipHoverCountRef.current > 0;
  }

  function renderWork(work: (typeof works)[number], duplicate = false) {
    const clipDuration = CLIP_DURATION_SEC;
    const isTrackPlaying = activeTrack === work.id && isPlaying;
    const isTrackActive = activeTrack === work.id;
    const workGlowStyle = {
      "--work-glow": hexToRgb(work.glow),
      "--work-glow-soft": hexToRgb(work.glowSoft),
    } as CSSProperties;

    return (
      <motion.article
        className={`work ${isTrackPlaying ? "work--active" : ""} ${playingTrack !== null && playingTrack !== work.id ? "work--muted" : ""}`}
        key={`${duplicate ? "loop" : "original"}-${work.id}`}
        style={workGlowStyle}
        initial={duplicate ? false : { opacity: 0, y: 30 }}
        whileInView={duplicate ? undefined : { opacity: 1, y: 0 }}
        viewport={duplicate ? undefined : { once: true, amount: .2 }}
        aria-hidden={duplicate || undefined}
      >
        <div
          className="work__image"
          onMouseEnter={pauseRailForHover}
          onMouseLeave={resumeRailFromHover}
        >
          <Image src={work.image} alt={duplicate ? "" : `${work.label} 封面`} fill sizes="(max-width: 767px) 88vw, (max-width: 1023px) 42vw, 18vw" />
        </div>
        <div className="work__meta">
          <div>
            <span className="work__name fx-link">
              <span>{work.label}</span>
              {work.subtitle ? <span className="work__name-detail">{work.subtitle}</span> : null}
            </span>
            <span className="work__note">{work.type}</span>
          </div>
          <div
            className="clip-control"
            onMouseEnter={pauseRailForHover}
            onMouseLeave={resumeRailFromHover}
          >
            <button
              className={`clip-button ${isTrackPlaying ? "clip-button--playing" : ""}`}
              type="button"
              tabIndex={duplicate ? -1 : 0}
              aria-label={`${isTrackPlaying ? "Pause" : "Play"} ${work.label}${work.subtitle ?? ""} ${clipDuration}-second clip`}
              onClick={() => toggleTrack(work.id, work.clip)}
              onFocus={() => { worksRailPausedRef.current.focus = true; }}
              onBlur={() => { worksRailPausedRef.current.focus = false; }}
            >
              <span className="clip-button__icon" aria-hidden>{isTrackPlaying ? "Ⅱ" : "▶"}</span>
              <span>{isTrackPlaying ? "播放中" : "试听片段"}</span>
              <span className="clip-button__time">
                {isTrackActive
                  ? `00:${String(Math.min(clipDuration, Math.floor(clipProgress * clipDuration))).padStart(2, "0")}`
                  : `00:${String(clipDuration).padStart(2, "0")}`}
              </span>
            </button>
            <span className="clip-button__progress" aria-hidden="true">
              <span
                style={
                  isTrackActive
                    ? { transform: `scaleX(${clipProgress})` }
                    : undefined
                }
              />
            </span>
          </div>
        </div>
        {audioMissing === work.id && !duplicate ? <p className="clip-missing">试听暂时未加载，请刷新页面后再试。</p> : null}
      </motion.article>
    );
  }

  return (
    <main
      ref={portfolioRef}
      className={`portfolio ${playingTrack !== null ? "portfolio--listening" : ""}`}
      style={listeningStyle}
    >
      <div className="ambient-flow" aria-hidden="true">
        <span className="ambient-flow__ribbon ambient-flow__ribbon--one" />
        <span className="ambient-flow__ribbon ambient-flow__ribbon--two" />
        <span className="ambient-flow__ribbon ambient-flow__ribbon--three" />
      </div>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          if (audioRef.current) syncClipProgress(audioRef.current);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setClipProgress(1);
        }}
        onLoadedMetadata={(event) => syncClipProgress(event.currentTarget)}
        onTimeUpdate={(event) => syncClipProgress(event.currentTarget)}
      />
      <nav className="nav" aria-label="Primary navigation">
        <a className="nav__brand" href="#top" aria-label="Yz香菜，回到首页">
          <span className="nav__brand-yz">Yz</span>
          <span className="nav__brand-cn">香菜</span>
          <span className="nav__brand-dot" aria-hidden />
        </a>
        <span className="nav__status">音乐作品集</span>
        <div className="nav__links">
          <a className="fx-link" href="#works">作品</a>
          <a className="fx-link" href="#process">制作</a>
          <a className="fx-link" href="#profile">关于</a>
        </div>
      </nav>

      <section id="top" className="hero">
        <motion.p className="hero__eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }}>
          编曲<br />音乐制作<br />AI 音乐工作流
        </motion.p>
        <motion.aside className="hero__about" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .2 }} aria-label="自我介绍">
          <span className="hero__about-index">INTRO / 00</span>
          <h2>你好，我是张韵蕊。</h2>
          <p>一名独立唱作人和音乐制作人，持续创作并发行个人音乐，重视旋律、和声、配器与声音质感。</p>
          <p>我可以使用 Logic Pro、FL Studio 独立完成从作曲、编曲、人声录制到混音的制作流程，并探索 AI 在风格研究、素材迭代与音乐内容生产中的应用。</p>
          <div className="hero__about-tags"><span>作曲</span><span>编曲</span><span>人声制作</span><span>混音</span><span>AI 音乐</span></div>
        </motion.aside>
        <div className="hero__brand-lockup">
          <motion.h1 className="hero__title hero__title--brand" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, ease: [.2,.8,.2,1] }}>
            <span className="hero__yz">Yz</span><span className="hero__coriander">香菜</span>
          </motion.h1>
          <motion.a
            className="hero__netease"
            href="https://music.163.com/#/artist?id=35141857"
            target="_blank"
            rel="noreferrer"
            aria-label="在新窗口打开 Yz香菜的网易云音乐歌手主页"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .65, delay: .7 }}
          >
            <span className="hero__netease-dot" aria-hidden />
            <span>网易云主页</span>
            <span aria-hidden>↗</span>
          </motion.a>
        </div>
        <p className="hero__roman">张韵蕊 / 音乐作品集</p>
        <p className="hero__identity">唱作人 / 音乐制作人<br />作曲、编曲与声音制作</p>
      </section>

      <CurvedTextInterlude />

      <section id="works" className="section section--works" aria-labelledby="works-title">
        <header className="section__head"><span>01 / 精选作品</span><span>4 首原创 · 2 个编曲作品　横向浏览 →</span></header>
        <h2 id="works-title" className="section__title section__title--cn">传统音乐制作</h2>
        <div
          ref={worksRailRef}
          className={`works-rail ${isDraggingWorks ? "works-rail--dragging" : ""}`}
          aria-label="可左右拖动、无限循环展示六个音乐作品，鼠标移入封面或试听片段时暂停"
          onPointerDown={startWorksDrag}
          onPointerMove={moveWorksDrag}
          onPointerUp={finishWorksDrag}
          onPointerCancel={finishWorksDrag}
        >
          <div className="works-track">
            <div className="works-sequence" aria-hidden="true">
              {works.map((work) => renderWork(work, true))}
            </div>
            <div ref={worksSequenceRef} className="works-sequence">
              {works.map((work) => renderWork(work))}
            </div>
            <div className="works-sequence" aria-hidden="true">
              {works.map((work) => renderWork(work, true))}
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="section section--dark" aria-labelledby="process-title">
        <header className="section__head"><span>02 / 创作现场</span><span>歌词草稿 · 工程文件 · 制作细节</span></header>
        <div className="process">
          <div className="process__intro">
            <h2 id="process-title" className="section__title section__title--cn">不是结果，<br />是留下的痕迹。</h2>
            <p>从一句尚未完成的歌词，到逐渐成形的工程文件。这里展示音乐真正被写下、拆开与重组的过程。</p>
          </div>
          <div className="process__gallery">
            {processEvidence.map((item, index) => (
              <motion.figure
                className={`process-shot process-shot--${index + 1}`}
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: .2 }}
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
                  <div><h3>{item.title}</h3><p>{item.note}</p></div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section id="profile" className="section section--profile" aria-labelledby="profile-title">
        <header className="section__head"><span>03 / 关于我</span><span>背景与能力</span></header>
        <div className="profile-grid">
          <h2 id="profile-title" className="profile-lead profile-lead--cn">用音乐表达情绪，也用视觉与方法建立完整的创作世界。</h2>
          <div className="profile-columns">
            <div><h3>音乐能力</h3><p>词曲创作</p><p>编曲与配器</p><p>人声制作</p><p>录音与混音</p></div>
            <div><h3>制作工具</h3><p>Logic Pro</p><p>FL Studio</p><p>AI 辅助工作流</p><p>更多信息即将补充</p></div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__heading">
          <span className="footer__kicker">04 / 联系</span>
          <p className="footer__title footer__title--cn">期待与你共振。</p>
        </div>
        <div className="footer__meta"><span>Yz香菜 · 张韵蕊</span><a className="fx-link" href="mailto:2312464576@qq.com">2312464576@qq.com</a><a className="fx-link" href="#top">回到顶部</a></div>
      </footer>
    </main>
  );
}
