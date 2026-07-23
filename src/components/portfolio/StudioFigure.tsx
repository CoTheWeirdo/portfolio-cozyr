"use client";

/**
 * Easter egg — user-provided guitar-cat GIF.
 */
export default function StudioFigure() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="hero-studio"
      src="/easter/playing-guitar-cat.gif"
      alt=""
      width={139}
      height={200}
      decoding="async"
      draggable={false}
    />
  );
}
