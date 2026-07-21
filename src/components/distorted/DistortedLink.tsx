"use client";

import gsap from "gsap";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react";

type SharedProps = {
  children: ReactNode;
  className?: string;
  /** Keep underline visible when not hovered */
  decoAlwaysVisible?: boolean;
};

type DistortedLinkAsAnchor = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    as?: "a";
  };

type DistortedLinkAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    as: "button";
  };

export type DistortedLinkProps = DistortedLinkAsAnchor | DistortedLinkAsButton;

function useCanDistort() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");

    const update = () => {
      setEnabled(!motion.matches && hover.matches);
    };

    update();
    motion.addEventListener("change", update);
    hover.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      hover.removeEventListener("change", update);
    };
  }, []);

  return enabled;
}

/**
 * Subtle SVG-displaced underline on hover.
 * Distorts the decorative line only — label text stays crisp.
 * Art direction borrowed from Codrops DistortedLinkEffects; not a demo clone.
 */
export default function DistortedLink(props: DistortedLinkProps) {
  const {
    children,
    className = "",
    decoAlwaysVisible = false,
    as = "a",
    onMouseEnter,
    onMouseLeave,
    ...rest
  } = props;

  const reactId = useId();
  const filterId = `distorted-deco-${reactId.replace(/:/g, "")}`;
  const canDistort = useCanDistort();
  const [filtersReady, setFiltersReady] = useState(false);

  const decoRef = useRef<HTMLSpanElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    setFiltersReady(true);
  }, []);

  const resetFilterTargets = useCallback(() => {
    if (decoRef.current) decoRef.current.style.filter = "none";
    if (displacementRef.current) displacementRef.current.scale.baseVal = 0;
    if (turbulenceRef.current) {
      turbulenceRef.current.setAttribute("baseFrequency", "0.015 0.55");
    }
  }, []);

  const killTimeline = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
    resetFilterTargets();
  }, [resetFilterTargets]);

  const playDistort = useCallback(() => {
    if (
      !canDistort ||
      !filtersReady ||
      !decoRef.current ||
      !displacementRef.current
    ) {
      return;
    }

    killTimeline();

    const deco = decoRef.current;
    const displacement = displacementRef.current;
    const turbulence = turbulenceRef.current;
    const values = { scale: 0, freqY: 0.55 };

    deco.style.filter = `url(#${filterId})`;

    const tl = gsap.timeline({
      onComplete: () => {
        resetFilterTargets();
      },
    });

    tl.eventCallback("onUpdate", () => {
      displacement.scale.baseVal = values.scale;
      if (turbulence) {
        turbulence.setAttribute("baseFrequency", `0.015 ${values.freqY}`);
      }
    });

    tl.fromTo(
      values,
      { scale: 0, freqY: 0.85 },
      {
        scale: 10,
        freqY: 0.35,
        duration: 0.22,
        ease: "power2.out",
      },
    ).to(values, {
      scale: 0,
      freqY: 0.55,
      duration: 0.55,
      ease: "power3.out",
    });

    timelineRef.current = tl;
  }, [canDistort, filterId, filtersReady, killTimeline, resetFilterTargets]);

  useEffect(() => () => killTimeline(), [killTimeline]);

  const handleMouseEnter: MouseEventHandler<HTMLElement> = (event) => {
    if (canDistort) playDistort();
    onMouseEnter?.(event as never);
  };

  const handleMouseLeave: MouseEventHandler<HTMLElement> = (event) => {
    if (canDistort) killTimeline();
    onMouseLeave?.(event as never);
  };

  const decoClassName = [
    "distorted-link__deco",
    "distorted-link__deco--line",
    decoAlwaysVisible ? "distorted-link__deco--visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rootClassName = ["distorted-link", className].filter(Boolean).join(" ");

  const inner = (
    <>
      {filtersReady ? (
        <svg
          className="distorted-link__svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter
              id={filterId}
              x="-20%"
              y="-400%"
              width="140%"
              height="900%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                ref={turbulenceRef}
                type="fractalNoise"
                baseFrequency="0.015 0.55"
                numOctaves="2"
                seed="3"
                result="noise"
              />
              <feDisplacementMap
                ref={displacementRef}
                in="SourceGraphic"
                in2="noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      ) : null}
      <span className="distorted-link__label">{children}</span>
      <span ref={decoRef} className={decoClassName} aria-hidden="true" />
    </>
  );

  if (as === "button") {
    const buttonProps = rest as Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "className" | "children" | "onMouseEnter" | "onMouseLeave"
    >;
    return (
      <button
        type={buttonProps.type ?? "button"}
        className={rootClassName}
        {...buttonProps}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {inner}
      </button>
    );
  }

  const anchorProps = rest as Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "className" | "children" | "onMouseEnter" | "onMouseLeave"
  >;
  return (
    <a
      className={rootClassName}
      {...anchorProps}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {inner}
    </a>
  );
}
