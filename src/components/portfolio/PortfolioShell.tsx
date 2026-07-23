import type { CSSProperties, ReactNode } from "react";
import FerroBackdrop, { type FerroScene } from "@/components/portfolio/FerroBackdrop";
import MusicCursor from "@/components/portfolio/MusicCursor";
import PortfolioNav from "@/components/portfolio/PortfolioNav";

type PortfolioShellProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  ferro?: FerroScene;
};

export default function PortfolioShell({
  children,
  className = "",
  style,
  ferro,
}: PortfolioShellProps) {
  return (
    <main className={`portfolio ${className}`.trim()} style={style}>
      <MusicCursor />
      <div className="ambient-flow" aria-hidden="true">
        <span className="ambient-flow__ribbon ambient-flow__ribbon--one" />
        <span className="ambient-flow__ribbon ambient-flow__ribbon--two" />
        <span className="ambient-flow__ribbon ambient-flow__ribbon--three" />
      </div>
      {ferro ? <FerroBackdrop scene={ferro} /> : null}
      <PortfolioNav />
      <div className="portfolio__content">{children}</div>
    </main>
  );
}
