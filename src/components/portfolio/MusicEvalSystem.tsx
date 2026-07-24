"use client";

import { motion, useReducedMotion } from "framer-motion";
import { autoRenewalEvalDimensions } from "@/data/autoRenewalCase";

export default function MusicEvalSystem() {
  const reduceMotion = useReducedMotion();
  const fade = reduceMotion
    ? undefined
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.18 },
        transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const },
      };

  return (
    <section className="works-eval" aria-labelledby="works-eval-title">
      <header className="works-chapter-head">
        <div className="works-chapter-head__row">
          <span className="works-chapter-head__index">03 / 音乐评测框架</span>
          <span className="works-chapter-head__en" aria-hidden>
            MUSIC EVALUATION
            <br />
            SYSTEM
          </span>
        </div>
        <h2 id="works-eval-title" className="works-chapter-head__title">
          把“好不好听”，拆成可描述的判断
        </h2>
        <p className="works-chapter-head__lead">
          我尝试把“好不好听”，
          <br className="works-bridge__br" />
          拆成可描述、可比较、可复用的判断维度。
        </p>
        <p className="works-eval__origin">
          这套框架来自《自动续费》的六版生成与筛选经验，不是一套脱离案例的通用模板。
        </p>
      </header>

      <motion.ol className="works-eval__manual" {...(fade ?? {})}>
        {autoRenewalEvalDimensions.map((dim) => (
          <li key={dim.id} className="works-eval__row">
            <span className="works-eval__num" aria-hidden>
              {dim.index}
            </span>
            <div className="works-eval__titles">
              <span className="works-eval__name">{dim.title}</span>
              <span className="works-eval__en" aria-hidden>
                {dim.englishTitle}
              </span>
            </div>
            <div className="works-eval__copy">
              <p>{dim.body}</p>
              <p className="works-eval__evidence">
                <span>案例证据</span>
                {dim.evidence}
              </p>
            </div>
          </li>
        ))}
      </motion.ol>
    </section>
  );
}
