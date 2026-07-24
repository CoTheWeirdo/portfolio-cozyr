"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import CreativeUniverse from "@/components/portfolio/CreativeUniverse";
import FuzzyText from "@/components/react-bits/FuzzyText";
import PortfolioShell from "@/components/portfolio/PortfolioShell";
import {
  IntroProvider,
  IntroStudioCat,
  REVEAL_DELAY,
  useIntro,
} from "@/components/portfolio/IntroOrchestrator";

/** Phone-only FuzzyText size — canvas measures fontSize at init. */
function useIsPhone(bp = 767) {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [bp]);
  return phone;
}

const marqueeItems = [
  "作曲",
  "编曲",
  "人声制作",
  "混音",
  "Logic Pro",
  "FL Studio",
  "AI 音乐工作流",
  "独立发行",
];

const ease = [0.22, 1, 0.36, 1] as const;

function IntroStage() {
  const reduceMotion = useReducedMotion();
  const isPhone = useIsPhone();
  const { reveal, playIntro, ready } = useIntro();
  const gate = ready && (reveal || !playIntro);
  const initial = reduceMotion || !playIntro ? false : "hidden";
  const animateTo = gate ? "show" : "hidden";
  const nameFontSize = isPhone
    ? "clamp(44px, 13vw, 60px)"
    : "clamp(2.8rem, 7.5vw, 5.5rem)";

  const enter = {
    meta: {
      hidden: { opacity: 0, x: -48, filter: "blur(8px)" },
      show: {
        opacity: 0.62,
        x: 0,
        filter: "blur(0px)",
        transition: {
          duration: playIntro ? 1.15 : 1.4,
          delay: playIntro ? REVEAL_DELAY.meta : 0.2,
          ease,
        },
      },
    },
    title: {
      hidden: { opacity: 0, x: -72, filter: "blur(16px)" },
      show: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
          duration: playIntro ? 1.35 : 1.75,
          delay: playIntro ? REVEAL_DELAY.title : 0.55,
          ease,
        },
      },
    },
    alias: {
      hidden: { opacity: 0, x: -56, filter: "blur(10px)" },
      show: {
        opacity: 0.72,
        x: 0,
        filter: "blur(0px)",
        transition: {
          duration: playIntro ? 1.2 : 1.5,
          delay: playIntro ? REVEAL_DELAY.alias : 1.1,
          ease,
        },
      },
    },
    pitch: {
      hidden: { opacity: 0, x: -44, filter: "blur(8px)" },
      show: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
          duration: playIntro ? 1.15 : 1.45,
          delay: playIntro ? REVEAL_DELAY.pitch : 1.45,
          ease,
        },
      },
    },
    pitchSecond: {
      hidden: { opacity: 0, x: -40, filter: "blur(8px)" },
      show: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
          duration: playIntro ? 1.1 : 1.4,
          delay: playIntro ? REVEAL_DELAY.pitchSecond : 1.75,
          ease,
        },
      },
    },
    actions: {
      hidden: { opacity: 0, x: -36 },
      show: {
        opacity: 1,
        x: 0,
        transition: {
          duration: playIntro ? 1.05 : 1.35,
          delay: playIntro ? REVEAL_DELAY.actions : 2.05,
          ease,
        },
      },
    },
    universe: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          duration: playIntro ? 1.2 : 1.8,
          delay: playIntro ? REVEAL_DELAY.universe : 0.9,
          ease,
        },
      },
    },
    marquee: {
      hidden: { opacity: 0, x: -28 },
      show: {
        opacity: 1,
        x: 0,
        transition: {
          duration: playIntro ? 1.1 : 1.4,
          delay: playIntro ? REVEAL_DELAY.marquee : 2.35,
          ease,
        },
      },
    },
  };

  return (
    <PortfolioShell
      className={`portfolio--intro${ready ? " intro-ready" : ""}${playIntro && !reveal ? " intro-holding" : ""}`}
      ferro="intro"
    >
      <section className="intro-stage" aria-labelledby="intro-title">
        <div className="intro-stage__copy">
          <motion.div
            className="intro-stage__meta"
            initial={initial}
            animate={animateTo}
            variants={enter.meta}
          >
            <p className="intro-stage__meta-primary">独立音乐人 · 音乐制作人</p>
            <p className="intro-stage__meta-secondary">数据分析背景 · AI 音乐数据与评测</p>
          </motion.div>

          <div className="intro-stage__masthead">
            <motion.h1
              id="intro-title"
              className="intro-stage__title"
              aria-label="张韵蕊"
              initial={initial}
              animate={animateTo}
              variants={enter.title}
            >
              {reduceMotion ? (
                <span className="intro-stage__name">张韵蕊</span>
              ) : (
                <FuzzyText
                  className="intro-stage__fuzzy"
                  fontSize={nameFontSize}
                  fontWeight={700}
                  fontFamily='"Hiragino Sans GB", "PingFang SC", sans-serif'
                  color="#b9b4d8"
                  baseIntensity={0.16}
                  hoverIntensity={0.55}
                  enableHover
                  fuzzRange={28}
                  fps={48}
                  direction="horizontal"
                  transitionDuration={8}
                  letterSpacing={4}
                >
                  张韵蕊
                </FuzzyText>
              )}
            </motion.h1>
            <motion.p
              className={`intro-stage__alias${playIntro && gate ? " intro-stage__alias--reveal" : ""}`}
              aria-label="aka Yz香菜"
              initial={initial}
              animate={animateTo}
              variants={enter.alias}
            >
              <span className="intro-stage__aka">aka</span>
              Yz香菜
            </motion.p>
          </div>

          <motion.p
            className="intro-stage__pitch"
            initial={initial}
            animate={animateTo}
            variants={enter.pitch}
          >
            我在音乐里写情绪，也在 AI 里寻找新的表达。
          </motion.p>

          <motion.p
            className="intro-stage__pitch intro-stage__pitch--second"
            initial={initial}
            animate={animateTo}
            variants={enter.pitchSecond}
          >
            创作于我，是表达，也是探索。音乐如此，AI 亦如此。
          </motion.p>

          <motion.div
            className="intro-stage__actions"
            initial={initial}
            animate={animateTo}
            variants={enter.actions}
          >
            <Link className="intro-stage__cta" href="/works">
              <span className="intro-stage__cta-note" aria-hidden>♪</span>
              探索我的作品
              <span aria-hidden>→</span>
            </Link>
            <a
              className="intro-stage__netease"
              href="https://music.163.com/#/artist?id=35141857"
              target="_blank"
              rel="noreferrer"
            >
              网易云主页 ↗
            </a>
          </motion.div>
        </div>

        <motion.div
          className="intro-stage__universe"
          initial={initial}
          animate={animateTo}
          variants={enter.universe}
        >
          <CreativeUniverse />
        </motion.div>

        <div className="intro-stage__studio" aria-hidden>
          <IntroStudioCat />
        </div>

        <motion.div
          className="intro-stage__marquee"
          aria-hidden
          initial={initial}
          animate={animateTo}
          variants={enter.marquee}
        >
          <div className={`intro-stage__marquee-track${reduceMotion ? " intro-stage__marquee-track--static" : ""}`}>
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`}>
                <span className="intro-stage__marquee-note">♩</span>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>
    </PortfolioShell>
  );
}

export default function PortfolioIntro() {
  return (
    <IntroProvider>
      <IntroStage />
    </IntroProvider>
  );
}
