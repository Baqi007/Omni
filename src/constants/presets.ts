export interface PresetPrompt {
  id: string;
  title: string;
  category: string;
  sourceLang: string;
  targetLang: string;
  tone: string;
  text: string;
  context?: string;
  highlightedIdiom: string;
}

export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: 'theater-luck',
    title: 'Break a leg (English)',
    category: 'Classic Idiom',
    sourceLang: 'English',
    targetLang: 'German',
    tone: 'Natural/Idiomatic',
    text: "Don't get cold feet before your debut tonight. Break a leg out there on stage!",
    highlightedIdiom: 'Break a leg',
  },
  {
    id: 'business-pigs',
    title: 'Corporate Realities (English)',
    category: 'Business Idiom',
    sourceLang: 'English',
    targetLang: 'Spanish',
    tone: 'Professional',
    text: "Let's bite the bullet and trim our overhead before the quarterly audit. When pigs fly will they approve this budget without cuts.",
    context: 'Executive board presentation',
    highlightedIdiom: 'Bite the bullet / When pigs fly',
  },
  {
    id: 'spanish-moros',
    title: 'No hay moros en la costa (Spanish)',
    category: 'Cultural Metaphor',
    sourceLang: 'Spanish',
    targetLang: 'English',
    tone: 'Casual/Slang',
    text: "Tranquilo hermano, no hay moros en la costa. A mal tiempo, buena cara. Vamos a pasarlo bien.",
    highlightedIdiom: 'No hay moros en la costa / A mal tiempo buena cara',
  },
  {
    id: 'french-cordes',
    title: 'Il pleut des cordes (French)',
    category: 'Weather & Society',
    sourceLang: 'French',
    targetLang: 'English',
    tone: 'Natural/Idiomatic',
    text: "Il pleut des cordes aujourd'hui ! Pourtant poser un lapin à Marc pour notre déjeuner serait vraiment impoli.",
    highlightedIdiom: 'Il pleut des cordes / Poser un lapin',
  },
  {
    id: 'japanese-ichigo',
    title: '一期一会 & お疲れ様 (Japanese)',
    category: 'Honorific & Philosophy',
    sourceLang: 'Japanese',
    targetLang: 'English',
    tone: 'Poetic/Literary',
    text: "プロジェクトの成功、本当にお疲れ様でした。この出会いは一期一会ですから、心から大切にしたいです。",
    context: 'Farewell dinner after finishing international project',
    highlightedIdiom: 'お疲れ様でした / 一期一会',
  },
  {
    id: 'german-schwein',
    title: 'Schwein haben & Kirche im Dorf (German)',
    category: 'Colloquial German',
    sourceLang: 'German',
    targetLang: 'English',
    tone: 'Casual/Slang',
    text: "Da haben wir echt Schwein gehabt! Lass uns mal die Kirche im Dorf lassen und nicht gleich durchdrehen.",
    highlightedIdiom: 'Schwein haben / Die Kirche im Dorf lassen',
  },
  {
    id: 'modern-slang',
    title: 'Spill the tea & No cap (Internet Slang)',
    category: 'Modern Colloquial',
    sourceLang: 'English',
    targetLang: 'French',
    tone: 'Casual/Slang',
    text: "You cannot just leave me hanging—spill the tea right now! That party was legendary, no cap.",
    highlightedIdiom: 'Spill the tea / No cap',
  },
];
