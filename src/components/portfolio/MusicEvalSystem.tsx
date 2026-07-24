"use client";

import { useState } from "react";
import { musicEvalDimensions } from "@/data/portfolioContent";

export default function MusicEvalSystem() {
  const [active, setActive] = useState<string>(musicEvalDimensions[0].id);

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
          我尝试把听感进一步拆成可描述、可讨论、可复用的判断维度。
        </p>
      </header>

      <ul className="works-eval__grid" role="list">
        {musicEvalDimensions.map((dim) => {
          const isActive = active === dim.id;
          return (
            <li key={dim.id}>
              <button
                type="button"
                className={`works-eval__card${isActive ? " works-eval__card--active" : ""}`}
                aria-pressed={isActive}
                onClick={() => setActive(dim.id)}
                onMouseEnter={() => setActive(dim.id)}
                onFocus={() => setActive(dim.id)}
              >
                <span className="works-eval__num" aria-hidden>
                  {dim.index}
                </span>
                <span className="works-eval__name">{dim.title}</span>
                <span className="works-eval__body">{dim.body}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
