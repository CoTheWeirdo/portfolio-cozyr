"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  processSignalFlow,
  type ProcessChapterMeta,
} from "@/data/processChapters";

type ProcessChapterProps = {
  meta: ProcessChapterMeta;
  children: ReactNode;
};

export default function ProcessChapter({ meta, children }: ProcessChapterProps) {
  const reduceMotion = useReducedMotion();
  const signalIndex = processSignalFlow.indexOf(meta.signal);

  return (
    <motion.section
      className={`process-chapter process-chapter--${meta.variant}`}
      aria-labelledby={`process-chapter-${meta.index}-title`}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <p className="process-chapter__signal" aria-hidden="true">
        {processSignalFlow.map((step, index) => (
          <span key={step} className={index === signalIndex ? "is-active" : undefined}>
            {step}
            {index < processSignalFlow.length - 1 ? <span className="process-chapter__signal-arrow">→</span> : null}
          </span>
        ))}
      </p>

      <header className="process-chapter__header">
        <span className="process-chapter__index">CHAPTER {meta.index}</span>
        <div className="process-chapter__titles">
          <h2 id={`process-chapter-${meta.index}-title`} className="process-chapter__title">
            {meta.title}
          </h2>
          <p className="process-chapter__en" aria-hidden="true">
            {meta.englishTitle}
          </p>
        </div>
        <p className="process-chapter__subtitle">{meta.subtitle}</p>
        <p className="process-chapter__description">{meta.description}</p>
      </header>

      <div className="process-chapter__content">{children}</div>
    </motion.section>
  );
}
