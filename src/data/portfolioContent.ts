export const CLIP_DURATION_SEC = 20;

export function hexToRgb(hex: string) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const n = Number.parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export type WorkItem = {
  id: number;
  image: string;
  clip: string;
  label: string;
  subtitle?: string;
  glow: string;
  glowSoft: string;
  type: "原创歌曲" | "编曲作品";
  /** Optional production roles — omit when unknown */
  roles?: readonly string[];
  /** Optional short music tags — omit when unknown */
  musicTags?: readonly string[];
  productionNote?: string;
};

/** Human-led catalogue — order locked for the existing rail */
export const works: readonly WorkItem[] = [
  {
    id: 1,
    image: "/works/utopia.jpg",
    clip: "/audio/track-01.mp3",
    label: "Utopia",
    subtitle: "（乌托邦）",
    glow: "#C41E1A",
    glowSoft: "#7A1412",
    type: "原创歌曲",
    roles: ["作词", "作曲", "人声制作"],
  },
  {
    id: 2,
    image: "/works/juzi-qishui.png",
    clip: "/audio/track-02.mp3",
    label: "橘子汽水",
    subtitle: "（Feat. Saxon）",
    glow: "#F08A3C",
    glowSoft: "#E8729A",
    type: "原创歌曲",
    roles: ["作词", "作曲", "人声制作"],
  },
  {
    id: 3,
    image: "/works/ronghua.png",
    clip: "/audio/track-03.mp3",
    label: "融化",
    subtitle: undefined,
    glow: "#5BC4F0",
    glowSoft: "#2A7EB8",
    type: "原创歌曲",
    roles: ["作词", "作曲", "人声制作"],
  },
  {
    id: 4,
    image: "/works/na-wo-ne.png",
    clip: "/audio/track-04.mp3",
    label: "那我呢",
    subtitle: undefined,
    glow: "#FF6BB5",
    glowSoft: "#6FE0F0",
    type: "原创歌曲",
    roles: ["作词", "作曲", "人声制作"],
  },
  {
    id: 5,
    image: "/works/bianqu-01.png",
    clip: "/audio/track-05.mp3",
    label: "Fire the hole",
    subtitle: undefined,
    glow: "#E85A1A",
    glowSoft: "#FFB347",
    type: "编曲作品",
    roles: ["编曲"],
  },
  {
    id: 6,
    image: "/works/langman-yinzi.png",
    clip: "/audio/track-06.mp3",
    label: "浪漫因子",
    subtitle: undefined,
    glow: "#C45BA8",
    glowSoft: "#5B7FD4",
    type: "编曲作品",
    roles: ["编曲"],
  },
];

/**
 * AI-assisted lab entries — reserved for lightweight catalogue cards.
 * Full case studies live in `autoRenewalCase.ts`.
 */
export type AiWorkItem = {
  id: string;
  title: string;
  cover: string;
  audio: string;
  type: "ai";
  goal?: string;
  promptControl?: readonly string[];
  iterations?: readonly {
    label: string;
    note: string;
    audio?: string;
  }[];
  evaluation?: {
    melody?: string;
    vocal?: string;
    structure?: string;
    styleMatch?: string;
  };
  finalDecision?: string;
  abCompare?: {
    a: { label: string; audio: string };
    b: { label: string; audio: string };
  };
};

export const aiWorks: readonly AiWorkItem[] = [];

export const processEvidence = [
  {
    title: "写词草稿",
    note: "五段不同时期的歌词记录：从一句灵感，到逐渐成形的段落。",
    files: ["lyrics-01.png", "lyrics-02.png", "lyrics-03.png", "lyrics-04.png", "lyrics-05.png"],
  },
  {
    title: "工程全景",
    note: "用完整轨道结构呈现段落、配器与动态推进",
    files: ["daw-overview.jpg"],
  },
  {
    title: "编曲细节",
    note: "MIDI、鼓组、音色与自动化的局部设计",
    files: ["arrangement-detail.jpg"],
  },
  {
    title: "人声与混音",
    note: "主唱编辑、和声叠层、插件链与空间处理",
    files: ["vocal-mix.jpg"],
  },
];
