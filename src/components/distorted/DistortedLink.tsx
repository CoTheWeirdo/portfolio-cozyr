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

export type DistortedDeco =
  | "line"
  | "circle"
  | "box"
  | "linethrough"
  | "twolines"
  | "diagonal";

type SharedProps = {
  children: ReactNode;
  className?: string;
  /** Decorative shape that receives the SVG displacement */
  deco?: DistortedDeco;
  /** Keep deco visible when not hovered */
  decoAlwaysVisible?: boolean;
  /** Also ripple the label briefly (still restrained) */
  distortText?: boolean;
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
 * Codrops-inspired link with SVG-displaced decorative shape on hover.
 * Distorts the deco (and optionally a soft pass on text) — never a heavy loop.
 */
export default function DistortedLink(props: DistortedLinkProps) {
  const {
    children,
    className = "",
    deco = "line",
    decoAlwaysVisible = false,
    distortText = false,
    as = "a",
    onMouseEnter,
    onMouseLeave,
    ...rest
  } = props;

  const reactId = useId();
  const filterId = `distorted-deco-${reactId.replace(/:/g, "")}`;
  const canDistort = useCanDistort();

  const labelRef = useRef<HTMLSpanElement>(null);
  const decoRef = useRef<HTMLSpanElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const resetFilterTargets = useCallback(() => {
    if (decoRef.current) decoRef.current.style.filter = "none";
    if (labelRef.current) labelRef.current.style.filter = "none";
    if (displacementRef.current) displacementRef.current.scale.baseVal = 0;
    if (turbulenceRef.current) {
      turbulenceRef.current.setAttribute("baseFrequency", "0.02 0.45");
    }
  }, []);

  const killTimeline = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
    resetFilterTargets();
  }, [resetFilterTargets]);

  const playDistort = useCallback(() => {
    if (!canDistort || !decoRef.current || !displacementRef.current) return;

    killTimeline();

    const decoEl = decoRef.current;
    const labelEl = labelRef.current;
    const displacement = displacementRef.current;
    const turbulence = turbulenceRef.current;
    const values = { scale: 0, freqY: 0.45 };

    decoEl.style.filter = `url(#${filterId})`;
    if (distortText && labelEl) {
      labelEl.style.filter = `url(#${filterId})`;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        resetFilterTargets();
      },
    });

    tl.eventCallback("onUpdate", () => {
      displacement.scale.baseVal = values.scale;
      if (turbulence) {
        turbulence.setAttribute("baseFrequency", `0.02 ${values.freqY}`);
      }
    });

    tl.fromTo(
      values,
      { scale: 0, freqY: 0.75 },
      {
        scale: distortText ? 14 : 12,
        freqY: 0.28,
        duration: 0.2,
        ease: "power2.out",
      },
    ).to(values, {
      scale: 0,
      freqY: 0.45,
      duration: 0.55,
      ease: "power3.out",
    });

    timelineRef.current = tl;
  }, [canDistort, distortText, filterId, killTimeline, resetFilterTargets]);

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
    `distorted-link__deco--${deco}`,
    decoAlwaysVisible ? "distorted-link__deco--visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rootClassName = ["distorted-link", className].filter(Boolean).join(" ");

  const inner = (
    <>
      <svg className="distorted-link__svg" aria-hidden focusable="false">
        <defs>
          <filter
            id={filterId}
            x="-40%"
            y="-400%"
            width="180%"
            height="900%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.02 0.45"
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
      <span ref={labelRef} className="distorted-link__label">
        {children}
      </span>
      <span ref={decoRef} className={decoClassName} aria-hidden />
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
