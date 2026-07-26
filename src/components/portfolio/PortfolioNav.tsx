"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { REVEAL_DELAY, useIntro } from "@/components/portfolio/IntroOrchestrator";

const links = [
  { href: "/works", label: "听见", note: "♪" },
  { href: "/process", label: "成形", note: "♫" },
  { href: "/about", label: "我", note: "♩" },
];

export default function PortfolioNav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const intro = useIntro();
  const onIntro = pathname === "/";
  const playIntro = onIntro && intro.playIntro;
  const reveal = !onIntro || intro.reveal || !intro.playIntro;
  const ready = !onIntro || intro.ready;

  const hidden = onIntro && (!ready || (playIntro && !reveal));

  return (
    <motion.nav
      className="nav"
      aria-label="Primary navigation"
      initial={false}
      animate={
        hidden
          ? { opacity: 0, y: -8 }
          : {
              opacity: 1,
              y: 0,
              transition:
                playIntro && reveal
                  ? { duration: 0.9, delay: REVEAL_DELAY.nav, ease: [0.22, 1, 0.36, 1] }
                  : reduceMotion
                    ? { duration: 0.2 }
                    : { duration: 0.55 },
            }
      }
      style={{ pointerEvents: hidden ? "none" : undefined }}
    >
      <Link className="nav__brand" href="/" aria-label="Yz香菜，回到首页">
        <span className="nav__brand-yz">Yz</span>
        <span className="nav__brand-cn">香菜</span>
        <span className="nav__brand-dot" aria-hidden="true" />
      </Link>
      <div className="nav__links">
        {links.map((link) => (
          <Link
            key={link.href}
            className={`fx-link ${pathname === link.href ? "fx-link--active" : ""}`}
            href={link.href}
          >
            <span className="nav__link-inner">
              <span className="nav__note" aria-hidden>{link.note}</span>
              <span>{link.label}</span>
            </span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
}
