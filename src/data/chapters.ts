export type ChapterId =
  | "about"
  | "education"
  | "skills"
  | "experience"
  | "selected-works"
  | "production"
  | "contact";

export type ChapterPage = {
  id: ChapterId;
  title: string;
  /** Short editorial label shown above the title */
  kicker: string;
  /** Placeholder body copy — replace with real content later */
  body: string[];
  /** Optional secondary note / caption block */
  note?: string;
};

/**
 * Portfolio chapter placeholders.
 * Swap `body` / `note` (and later media fields) without touching the book shell.
 */
export const chapters: ChapterPage[] = [
  {
    id: "about",
    title: "About",
    kicker: "01",
    body: [
      "Placeholder introduction. A brief statement of practice will live here — music, visual work, and process — without fixed biographical claims for now.",
      "This page is a structural stand-in so the book shell can be reviewed independently of final copy.",
    ],
    note: "Content forthcoming.",
  },
  {
    id: "education",
    title: "Education",
    kicker: "02",
    body: [
      "Placeholder education notes. Institutions, programs, and dates will be listed here when ready.",
      "Layout supports an asymmetrical editorial column; real entries can replace these lines later.",
    ],
    note: "Details to be added.",
  },
  {
    id: "skills",
    title: "Skills",
    kicker: "03",
    body: [
      "Placeholder skills overview. Categories such as production, composition, and visual tools will appear in this chapter.",
      "Keep entries concise; the book shell is designed for short editorial blocks rather than dense lists.",
    ],
  },
  {
    id: "experience",
    title: "Experience",
    kicker: "04",
    body: [
      "Placeholder experience chapter. Roles, collaborations, and timelines will replace this text.",
      "Each spread can later hold a mix of short paragraphs and annotated lists.",
    ],
    note: "Resume content reserved.",
  },
  {
    id: "selected-works",
    title: "Selected Works",
    kicker: "05",
    body: [
      "A short list of tracks and pieces. Titles below are placeholders for the archive layout.",
    ],
    note: "Works archive pending.",
  },
  {
    id: "production",
    title: "Production",
    kicker: "06",
    body: [
      "Placeholder production notes. Process, tools, and workflow commentary will live on this page.",
      "Space is reserved for diagrams or stills once assets are prepared.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    kicker: "07",
    body: [
      "Placeholder contact page. Email, links, and availability will replace this copy.",
      "No personal contact details are published in this shell build.",
    ],
    note: "Reach-out details forthcoming.",
  },
];

export const totalChapterPages = chapters.length;

/** Desktop shows two pages per spread. */
export function getSpreadCount(pageCount: number = totalChapterPages): number {
  return Math.ceil(pageCount / 2);
}

export function getSpreadPages(
  spreadIndex: number,
  pages: ChapterPage[] = chapters,
): [ChapterPage | null, ChapterPage | null] {
  const left = pages[spreadIndex * 2] ?? null;
  const right = pages[spreadIndex * 2 + 1] ?? null;
  return [left, right];
}
