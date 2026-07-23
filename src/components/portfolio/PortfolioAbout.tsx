"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import FuzzyText from "@/components/react-bits/FuzzyText";
import PortfolioShell from "@/components/portfolio/PortfolioShell";

export default function PortfolioAbout() {
  const reduceMotion = useReducedMotion();

  return (
    <PortfolioShell ferro="about">
      <section id="profile" className="section section--profile" aria-labelledby="profile-title">
        <header className="section__head">
          <span>03 / 关于我</span>
          <span>背景与能力</span>
        </header>
        <div className="profile-grid">
          <h2 id="profile-title" className="profile-lead profile-lead--cn" aria-label="用音乐表达情绪，也用视觉与方法建立完整的创作世界。">
            {reduceMotion ? (
              "用音乐表达情绪，也用视觉与方法建立完整的创作世界。"
            ) : (
              <FuzzyText
                className="page-fuzzy page-fuzzy--about"
                fontSize="clamp(1.6rem, 3.2vw, 2.8rem)"
                fontWeight={600}
                fontFamily='"Hiragino Sans GB", "PingFang SC", sans-serif'
                color="#ede9df"
                baseIntensity={0.12}
                hoverIntensity={0.4}
                enableHover
                fuzzRange={18}
                fps={40}
                direction="horizontal"
                transitionDuration={10}
              >
                用音乐表达情绪，也用视觉与方法建立完整的创作世界。
              </FuzzyText>
            )}
          </h2>
          <div className="profile-columns">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
            >
              <h3>音乐能力</h3>
              <p>词曲创作</p>
              <p>编曲与配器</p>
              <p>人声制作</p>
              <p>录音与混音</p>
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28 }}
            >
              <h3>制作工具</h3>
              <p>Logic Pro</p>
              <p>FL Studio</p>
              <p>AI 辅助工作流</p>
              <p>更多信息即将补充</p>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__heading">
          <span className="footer__kicker">04 / 联系</span>
          <p className="footer__title footer__title--cn">期待与你共振。</p>
        </div>
        <div className="footer__meta">
          <span>Yz香菜 · 张韵蕊</span>
          <a className="fx-link" href="mailto:2312464576@qq.com">2312464576@qq.com</a>
          <Link className="fx-link" href="/">回到首页</Link>
        </div>
      </footer>
    </PortfolioShell>
  );
}
