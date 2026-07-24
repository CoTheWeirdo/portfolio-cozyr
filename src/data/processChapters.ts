export type ProcessChapterVariant = "source" | "lyrics" | "sound" | "decision";

export type ProcessChapterMeta = {
  index: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  description: string;
  variant: ProcessChapterVariant;
  signal: "SOURCE" | "LANGUAGE" | "SOUND" | "DECISION";
};

export const processChapters: readonly ProcessChapterMeta[] = [
  {
    index: "01",
    title: "情绪采样",
    englishTitle: "EMOTIONAL SOURCE",
    subtitle: "情绪还没有名字的时候",
    description:
      "创作通常不是从完整的旋律开始，而是一句话、一个动作，或某个无法准确描述的瞬间。",
    variant: "source",
    signal: "SOURCE",
  },
  {
    index: "02",
    title: "语言与结构",
    englishTitle: "LYRICS & FORM",
    subtitle: "一句话如何找到它的位置",
    description: "歌词不只是表达情绪，也需要承担节奏、画面与段落推进。",
    variant: "lyrics",
    signal: "LANGUAGE",
  },
  {
    index: "03",
    title: "声音搭建",
    englishTitle: "SOUND CONSTRUCTION",
    subtitle: "让情绪拥有空间和重量",
    description:
      "旋律确定方向，编曲决定距离；声音的密度、位置与进入时机，共同塑造听感。",
    variant: "sound",
    signal: "SOUND",
  },
  {
    index: "04",
    title: "选择与淘汰",
    englishTitle: "DECISION LOG",
    subtitle: "最终版本来自不断排除",
    description:
      "创作并不是持续增加元素，而是在不同选择之间判断什么成立、什么应该被放弃。",
    variant: "decision",
    signal: "DECISION",
  },
] as const;

export const processSignalFlow = ["SOURCE", "LANGUAGE", "SOUND", "DECISION"] as const;

export const emotionalTags = ["DISTANCE", "LOW LIGHT", "UNFINISHED", "INTIMATE"] as const;

export const songFormMarkers = [
  "VERSE 01",
  "PRE",
  "HOOK",
  "VERSE 02",
  "BRIDGE",
  "FINAL",
] as const;

/** Optional lyric edit fields — empty strings are not rendered. */
export const lyricEditRecords = {
  original: "",
  revision: "",
  why: "",
} as const;

export type SoundLayer = {
  label: string;
  description: string;
};

export const soundLayers: readonly SoundLayer[] = [
  { label: "VOICE", description: "" },
  { label: "CHORD", description: "" },
  { label: "BASS", description: "" },
  { label: "TEXTURE", description: "" },
  { label: "RHYTHM", description: "" },
];

export const decisionAxes = ["OBSERVATION", "KEPT", "REMOVED", "FINAL DECISION"] as const;

export const decisionStages = [
  { id: "demo-01", label: "DEMO 01", emphasis: "low" as const },
  { id: "demo-02", label: "DEMO 02", emphasis: "low" as const },
  { id: "final", label: "FINAL", emphasis: "high" as const },
];
