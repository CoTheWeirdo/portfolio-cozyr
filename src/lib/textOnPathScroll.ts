import { onScrollFrame } from "@/lib/scrollFrame";

function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

type TextTrack = {
  textPath: SVGTextPathElement;
  pathLength: number;
  bias: number;
};

export function initTextOnPathScroll(svg: SVGSVGElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tracks: TextTrack[] = [];
  svg.querySelectorAll("text").forEach((text, index) => {
    const textPath = text.querySelector("textPath");
    const href = textPath?.getAttribute("href") ?? textPath?.getAttribute("xlink:href");
    const pathId = href?.replace("#", "");
    const path = pathId ? svg.querySelector<SVGPathElement>(`#${pathId}`) : null;
    if (!textPath || !path) return;

    tracks.push({
      textPath,
      pathLength: path.getTotalLength(),
      bias: index * path.getTotalLength() * 0.04,
    });
  });

  if (tracks.length === 0) return () => {};

  const referenceLength = tracks[0].pathLength;
  let isVisible = false;
  let lastOffset = Number.NaN;
  let frameScheduled = false;

  const applyOffsets = (offset: number) => {
    if (Math.abs(offset - lastOffset) < 0.2) return;
    lastOffset = offset;

    tracks.forEach((track) => {
      const ratio = track.pathLength / referenceLength;
      track.textPath.setAttribute("startOffset", `${(offset * ratio + track.bias).toFixed(2)}`);
    });
  };

  const tick = () => {
    frameScheduled = false;
    if (!isVisible) return;

    const rect = svg.getBoundingClientRect();
    const winH = window.innerHeight;
    const offset = map(
      rect.top,
      winH * 0.92,
      winH * 0.08,
      referenceLength * 0.42,
      referenceLength * 0.08,
    );

    applyOffsets(offset);
  };

  const scheduleTick = () => {
    if (frameScheduled || !isVisible) return;
    frameScheduled = true;
    requestAnimationFrame(tick);
  };

  applyOffsets(
    map(
      svg.getBoundingClientRect().top,
      window.innerHeight * 0.92,
      window.innerHeight * 0.08,
      referenceLength * 0.42,
      referenceLength * 0.08,
    ),
  );

  if (reducedMotion) {
    return () => {};
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        lastOffset = Number.NaN;
        scheduleTick();
      }
    },
    { rootMargin: "12% 0px", threshold: 0 },
  );
  observer.observe(svg);

  const unsubscribeScroll = onScrollFrame(scheduleTick);
  window.addEventListener("scroll", scheduleTick, { passive: true });
  window.addEventListener("resize", scheduleTick, { passive: true });

  return () => {
    observer.disconnect();
    unsubscribeScroll();
    window.removeEventListener("scroll", scheduleTick);
    window.removeEventListener("resize", scheduleTick);
  };
}
