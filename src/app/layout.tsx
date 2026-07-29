import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const instrumentSerif = localFont({
  src: [
    {
      path: "./fonts/instrument-serif-regular-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/instrument-serif-italic-latin.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
});

const figtree = localFont({
  src: "./fonts/figtree-latin.woff2",
  variable: "--font-figtree",
  weight: "300 900",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "张韵蕊（Yz香菜）— 音乐制作人 / 唱作人",
  description:
    "张韵蕊（Yz香菜）的音乐作品、编曲作品与制作笔记。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
