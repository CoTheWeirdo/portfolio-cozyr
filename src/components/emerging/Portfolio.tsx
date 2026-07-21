"use client";

import { motion } from "framer-motion";
import { useState, type CSSProperties } from "react";
import { works } from "@/lib/works";
import EmergingImage from "./EmergingImage";
import Scene from "./Scene";
import SmoothScroll from "./SmoothScroll";

const VARIATIONS = [0, 1, 2, 3, 4] as const;

export default function Portfolio() {
  const [type, setType] = useState(0);

  return (
    <>
      <SmoothScroll />
      <Scene />

      <main className="relative z-10">
        <header className="frame">
          <p className="frame__meta">
            <a href="#work">Selected works</a>
            <a href="mailto:hello@cozyr.studio">Contact</a>
          </p>

          <motion.h1
            className="frame__title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            Cozyr
          </motion.h1>

          <motion.p
            className="frame__lead"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Music for AI-native worlds — sound design, generative scores, and
            production for creative technology.
          </motion.p>

          <nav className="frame__demos" aria-label="Reveal variations">
            <span className="frame__demos-title">Variations</span>
            {VARIATIONS.map((value) => (
              <button
                key={value}
                type="button"
                className={`frame__demos-item${type === value ? " is-active" : ""}`}
                onClick={() => setType(value)}
                aria-pressed={type === value}
              >
                {value + 1}
              </button>
            ))}
          </nav>
        </header>

        <section id="work" className="grid" aria-label="Selected works">
          {works.map((work) => {
            const itemStyle = {
              "--r": work.row,
              "--c": work.col,
              "--s": work.span,
            } as CSSProperties;

            return (
              <figure key={work.id} className="grid__item" style={itemStyle}>
                <div className="grid__item-img">
                  <EmergingImage
                    type={type}
                    url={work.image}
                    className="grid__item-img-inner"
                  />
                </div>
                <figcaption className="grid__item-caption">
                  <h3>{work.title}</h3>
                  <span>{work.year}</span>
                </figcaption>
              </figure>
            );
          })}
        </section>

        <footer className="outro">
          <p className="outro__title">Open for AI music & creative roles.</p>
          <a className="outro__link" href="mailto:hello@cozyr.studio">
            hello@cozyr.studio
          </a>
        </footer>
      </main>
    </>
  );
}
