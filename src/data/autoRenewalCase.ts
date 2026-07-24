export type AiCaseLyricBlock = {
  section: string;
  lines: readonly string[];
  source: "me" | "ai-assisted" | "ai-expansion";
  sourceLabel: string;
};

export type AiCaseHighlight = {
  id: "post-chorus" | "verse-2";
  label: string;
  en: string;
  startSec: number;
  endSec: number;
  fadeStartSec: number;
  timeLabel: string;
  lyric: string;
  note: string;
};

export type AiCaseEvalRow = {
  id: string;
  dimension: string;
  level: string;
};

export type MusicEvalDimension = {
  id: string;
  index: string;
  title: string;
  englishTitle: string;
  body: string;
  evidence: string;
};

export const autoRenewalCase = {
  id: "auto-renewal",
  caseLabel: "案例 01",
  caseLabelEn: "CASE STUDY",
  title: "自动续费",
  englishTitle: "AUTOMATIC RENEWAL",
  cover: "/assets/works/auto-renewal/cover.png",
  coverAlt: "《自动续费》AI 音乐案例概念封面",
  audio: "/audio/auto-renewal/final.m4a",
  displayDuration: "02:29",
  oneLiner: [
    "把毕业后的求职焦虑，",
    "写成一首关于成年人生活被“默认续订”的自嘲 R&B。",
  ] as const,
  meta: [
    { label: "工具", en: "TOOL", value: "Suno" },
    { label: "年份", en: "YEAR", value: "2026" },
    { label: "歌曲时长", en: "DURATION", value: "02:29" },
    { label: "生成版本", en: "GENERATED", value: "6 个" },
    { label: "保留版本", en: "RETAINED", value: "4 个" },
    { label: "后期处理", en: "POST-PRODUCTION", value: "无 / 直接使用 Suno 输出" },
  ] as const,
  rolesTitle: "我的职责",
  rolesTitleEn: "MY ROLE",
  roles: [
    "核心概念与主题设定",
    "关键歌词段落创作",
    "创作要求整理",
    "版本比较与筛选",
    "最终版本选择",
  ] as const,
  collaborationTitle: "AI 协作",
  collaborationTitleEn: "AI COLLABORATION",
  collaboration: ["文本内容辅助", "音乐生成", "人声生成"] as const,
  collaborationNotes: [
    "关键歌词段落与核心概念由我完成，",
    "其余段落在生成式文本工具辅助下补全。",
  ] as const,
  generationNotes: [
    "作曲、编曲与演唱由 Suno 生成，",
    "我负责创意方向、声音要求、生成迭代与最终版本筛选。",
  ] as const,
  context: {
    title: "01 / 创作起点",
    en: "CREATIVE CONTEXT",
    paragraphs: [
      "毕业之后，生活开始进入求职、通勤与工作的预演。每天像一个没有确认按钮的订阅服务，被默认续上下一天。",
      "我想把这种日复一日的疲惫写得轻松一点：不是严肃控诉，而是用一首自嘲的 R&B，给烦闷、枯燥的生活增加一点乐趣。",
    ] as const,
    metaphor:
      "“自动续费”指每天的生活被默认继续：通勤、工作、生活成本和压力持续扣除，人却很难找到真正的暂停或退订按钮。",
    conceptLines: ["生活自动续费", "退订键藏在哪里"] as const,
    sceneLines: ["下班的人流向前移动", "像一条熟练运行的河"] as const,
  },
  brief: {
    title: "02 / 生成配方",
    en: "PROMPT RECIPE",
    subtitle: "给模型的声音说明书",
    intro: ["把曲风、速度、人声与情绪，", "调成一份可以被执行的音乐输入。"] as const,
    reconstructedLabel: "RECONSTRUCTED",
    reconstructedNote: "根据实际生成设定整理",
    body: [
      "一首轻松、自嘲但不过度欢快的中文另类 R&B。整体融合 bedroom R&B、lo-fi pop 与轻微 trap 元素，速度约 70–75 BPM。",
      "使用中低音区的柔和女声，避免尖锐高音、炫技与过度爆发。",
      "主歌接近低声自言自语，Verse 2 可以出现自然、抓耳的 Rap flow。",
      "副歌需要简洁、重复、容易记住，但整体仍然保持冷静和克制。",
      "编曲以朦胧电吉他、柔和合成器、克制的 808 和稀疏鼓点为主，在轻松听感中保留一点深夜式的疲惫感。",
    ] as const,
    sonic: {
      title: "声音配方",
      titleEn: "SONIC RECIPE",
      lead: ["先确定声音的骨架，", "再控制人声、记忆点与情绪距离。"] as const,
      style: {
        title: "曲风方向",
        titleEn: "STYLE DIRECTION",
        lines: [
          { text: "Alternative R&B", weight: "lead" },
          { text: "Bedroom R&B", weight: "mid" },
          { text: "Lo-fi Pop", weight: "soft" },
          { text: "Light Trap Elements", weight: "soft" },
        ] as const,
      },
      tempo: {
        title: "速度",
        titleEn: "TEMPO",
        bpm: "72",
        unit: "BPM",
        feel: "慢速 / 克制推进",
        rangeNote: "目标范围 70–75 BPM",
      },
      vocal: {
        title: "人声设定",
        titleEn: "VOCAL DIRECTION",
        desiredLabel: "希望获得",
        desiredLabelEn: "DESIRED",
        avoidLabel: "避免",
        avoidLabelEn: "AVOID",
        desired: ["柔和女声", "中低音区", "自然呼吸感"] as const,
        avoid: ["尖锐高音", "过度爆发", "炫技式演唱"] as const,
      },
      tracks: [
        {
          id: "hook",
          title: "记忆点",
          titleEn: "HOOK",
          nodes: ["简洁", "重复", "容易记住"] as const,
        },
        {
          id: "mood",
          title: "情绪基调",
          titleEn: "MOOD",
          nodes: ["轻松自嘲", "疲惫但不沉重", "克制而连贯"] as const,
        },
      ] as const,
    },
  },
  selection: {
    title: "03 / 生成与筛选",
    en: "ITERATION & SELECTION",
    summary: [
      "总计生成六个版本，当前保留四个。",
      "Suno 每轮会同时生成两个差异明显的结果；不同版本在旋律、调式、情绪和 R&B 风格上存在变化。",
    ] as const,
    versions: ["V01", "V02", "V03", "V04", "V05", "V06"] as const,
    selectedVersion: "V06",
    directionVariations: [
      "偏安静",
      "偏活泼",
      "流行 R&B",
      "抒情 R&B",
      "调式与结构变化",
    ] as const,
    rejectionReasons: [
      {
        index: "01",
        text: "旋律缺少记忆点，部分高音听感刺耳。",
      },
      {
        index: "02",
        text: "整体风格偏离设定的克制、自嘲 R&B。",
      },
      {
        index: "03",
        text: "部分段落结构松散，前后听感缺少连贯性。",
      },
    ] as const,
    finalSelection: [
      "最终版本的 Hook 更洗脑，Verse 2 的 Rap 具有明显节奏感，段落之间衔接自然。",
      "歌词与旋律结合得比较丝滑，整体完成度也是六个版本中最高的。",
    ] as const,
  },
  finalOutput: {
    title: "04 / 最终版本",
    en: "FINAL OUTPUT",
    playerLabel: "Suno 生成版本",
  },
  highlights: [
    {
      id: "post-chorus",
      label: "试听重点 01",
      en: "POST-CHORUS",
      startSec: 58,
      endSec: 70,
      fadeStartSec: 69,
      timeLabel: "00:58—01:10",
      lyric: "又一天\n又一天\n还没准备好就又一天",
      note: "重复句式与简洁旋律形成了最直接的记忆点，也强化了“日复一日”的主题。",
    },
    {
      id: "verse-2",
      label: "试听重点 02",
      en: "VERSE 2 / RAP FLOW",
      startSec: 70,
      endSec: 79,
      fadeStartSec: 78,
      timeLabel: "01:10—01:19",
      lyric: "午餐照片看起来不错\n其实味道也就差不多\n群聊里都在庆祝生活\n我打了个笑脸跟着附和",
      note: "这一段的语速、押韵与旋律流动感比较自然。\n\n日常化的表达和轻松的 Rap flow，让求职与工作焦虑听起来不至于过于沉重，同时保持了整首歌自嘲、松弛的语气。",
    },
  ] as const satisfies readonly AiCaseHighlight[],
  evaluation: {
    title: "06 / 输出评估",
    en: "OUTPUT EVALUATION",
    rows: [
      { id: "melody", dimension: "旋律与 Hook", level: "高" },
      { id: "style", dimension: "风格贴合", level: "高" },
      { id: "structure", dimension: "结构连贯度", level: "高" },
      { id: "vocal", dimension: "人声与歌词适配", level: "中高" },
      { id: "ending", dimension: "结尾完整度", level: "中" },
    ] as const satisfies readonly AiCaseEvalRow[],
    strengths: [
      "Hook 具有较强的重复记忆点，Verse 2 Rap 抓耳，整体段落衔接连贯。",
      "轻松的旋律与自嘲歌词形成反差，让关于“牛马生活”的主题不会显得过于沉重。",
    ] as const,
    improvements: [
      "结尾处理略显仓促。",
      "最后一句唱完约三秒后歌曲便结束，缺少足够的收束空间。",
      "更理想的处理是延长约八拍，让伴奏或主题动机自然淡出。",
    ] as const,
  },
  lyricsNote:
    "关键歌词段落与核心概念由我完成，其余内容在生成式文本工具辅助下补全。",
  lyrics: [
    {
      section: "Intro",
      lines: ["闹钟响得很准", "我醒得不完整"],
      source: "ai-assisted",
      sourceLabel: "AI-ASSISTED TEXT",
    },
    {
      section: "Verse 1",
      lines: [
        "七点二十挤进电梯",
        "镜子里的人都没表情",
        "咖啡负责维持清醒",
        "我负责假装一切还行",
        "",
        "昨天剩下一半情绪",
        "塞进今天穿的外衣",
        "门一关就没人看得清",
        "我把叹气换成了呼吸",
      ],
      source: "me",
      sourceLabel: "WRITTEN BY ME",
    },
    {
      section: "Pre-Chorus",
      lines: ["没有确认", "没有提醒", "天一亮", "又默认我继续"],
      source: "ai-assisted",
      sourceLabel: "AI-ASSISTED TEXT",
    },
    {
      section: "Chorus",
      lines: [
        "生活自动续费",
        "我还没点同意",
        "天亮照常扣走",
        "昨晚剩下的力气",
        "",
        "生活自动续费",
        "退订键藏在哪里",
        "我说今天不奉陪",
        "身体却已经出门去",
      ],
      source: "me",
      sourceLabel: "WRITTEN BY ME",
    },
    {
      section: "Post-Chorus",
      lines: [
        "又一天",
        "又一天",
        "还没准备好就又一天",
        "",
        "又一天",
        "又一天",
        "我的人生自动续费",
      ],
      source: "ai-assisted",
      sourceLabel: "AI-ASSISTED TEXT",
    },
    {
      section: "Verse 2",
      lines: [
        "午餐照片看起来不错",
        "其实味道也就差不多",
        "群聊里都在庆祝生活",
        "我打了个笑脸跟着附和",
        "",
        "下班的人流向前移动",
        "像一条熟练运行的河",
        "偶尔也想逆着走一走",
        "最后还是赶上那班末班车",
      ],
      source: "me",
      sourceLabel: "WRITTEN BY ME",
    },
    {
      section: "Pre-Chorus",
      lines: ["没有确认", "没有提醒", "天一亮", "又默认我继续"],
      source: "ai-assisted",
      sourceLabel: "AI-ASSISTED TEXT",
    },
    {
      section: "Chorus",
      lines: [
        "生活自动续费",
        "我还没点同意",
        "天亮照常扣走",
        "昨晚剩下的力气",
        "",
        "生活自动续费",
        "退订键藏在哪里",
        "我说今天不奉陪",
        "身体却已经出门去",
      ],
      source: "me",
      sourceLabel: "WRITTEN BY ME",
    },
    {
      section: "Bridge",
      lines: [
        "也不是想消失",
        "只是想暂停一次",
        "让世界先往前走",
        "不用等我解释",
        "",
        "我会回来处理",
        "那些未完成的事",
        "但今晚先让我",
        "只属于我自己",
      ],
      source: "ai-assisted",
      sourceLabel: "AI-ASSISTED TEXT",
    },
    {
      section: "Final Chorus",
      lines: [
        "生活自动续费",
        "这次我不再着急",
        "没完成的明天",
        "也不会判我出局",
        "",
        "生活自动续费",
        "偶尔欠费也可以",
        "若今天只剩一点力气",
        "就留给自己",
      ],
      source: "ai-expansion",
      sourceLabel: "AI-ASSISTED EXPANSION / BASED ON MY CHORUS",
    },
    {
      section: "Outro",
      lines: [
        "又一天",
        "又一天",
        "没那么完美也算一天",
        "",
        "又一天",
        "又一天",
        "这次由我决定怎么续费",
      ],
      source: "ai-assisted",
      sourceLabel: "AI-ASSISTED TEXT",
    },
  ] as const satisfies readonly AiCaseLyricBlock[],
} as const;

export const autoRenewalEvalDimensions: readonly MusicEvalDimension[] = [
  {
    id: "melody-hook",
    index: "01",
    title: "旋律与 Hook",
    englishTitle: "MELODY & HOOK",
    body: "核心旋律是否容易识别，副歌是否具有重复记忆点，同时避免旋律过于平直或高音过度刺激。",
    evidence: "淘汰旋律不抓耳、高音刺耳的版本；保留 Hook 最具记忆点的最终版本。",
  },
  {
    id: "style-alignment",
    index: "02",
    title: "风格贴合",
    englishTitle: "STYLE ALIGNMENT",
    body: "输出是否持续符合最初设定的曲风、情绪和声音距离，而不是生成成另一种流行模板。",
    evidence: "淘汰过于活泼、过度抒情，或偏离 Alternative R&B 方向的版本。",
  },
  {
    id: "vocal-listenability",
    index: "03",
    title: "人声可听性",
    englishTitle: "VOCAL LISTENABILITY",
    body: "音域、音色、中文咬字和情绪是否自然；高音是否尖锐，演唱是否符合歌曲需要的克制感。",
    evidence: "部分版本因为高音听感刺耳而被淘汰。",
  },
  {
    id: "structural-coherence",
    index: "04",
    title: "结构连贯性",
    englishTitle: "STRUCTURAL COHERENCE",
    body: "Verse、Pre-Chorus、Chorus、Rap 与 Bridge 是否自然衔接，歌曲是否具有明确推进。",
    evidence: "最终版本获选的重要原因是整体连贯；部分其他版本存在结构松散的问题。",
  },
  {
    id: "output-usability",
    index: "05",
    title: "输出可用性",
    englishTitle: "OUTPUT USABILITY",
    body: "成品是否具备发布或继续编辑的价值；问题是局部可修复，还是需要重新生成。",
    evidence: "《自动续费》整体已经可用；主要不足集中在结尾，可以通过延长约八拍改善，不需要推翻整首。",
  },
] as const;
