"use client";

type HearVinylIntroProps = {
  mode: "intro" | "return" | "static";
  highlight: "a" | "b";
  onSelectA: () => void;
  onSelectB: () => void;
};

export default function HearVinylIntro({
  mode,
  highlight,
  onSelectA,
  onSelectB,
}: HearVinylIntroProps) {
  return (
    <section
      className={`hear-vinyl hear-vinyl--${mode}`}
      aria-labelledby="hear-vinyl-title"
    >
      <div className="hear-vinyl__stage" aria-hidden>
        <div className="hear-vinyl__disc" />
        <div className="hear-vinyl__label">
          <span className="hear-vinyl__label-yz">YZ</span>
          <span className="hear-vinyl__label-side">01 / 02</span>
        </div>
      </div>

      <div className="hear-vinyl__copy">
        <h1 id="hear-vinyl-title" className="hear-vinyl__title">
          听见
        </h1>
        <p className="hear-vinyl__lead">两面声音，各有各的来路。</p>
      </div>

      <div className="hear-vinyl__sides">
        <button
          type="button"
          className={`hear-vinyl__side${highlight === "a" ? " is-active" : ""}`}
          onClick={onSelectA}
        >
          <span className="hear-vinyl__side-mark">A 面</span>
          <span className="hear-vinyl__side-text">从空白轨道开始</span>
        </button>
        <button
          type="button"
          className={`hear-vinyl__side${highlight === "b" ? " is-active" : ""}`}
          onClick={onSelectB}
        >
          <span className="hear-vinyl__side-mark">B 面</span>
          <span className="hear-vinyl__side-text">从很多版本里，留下这一首</span>
        </button>
      </div>
    </section>
  );
}
