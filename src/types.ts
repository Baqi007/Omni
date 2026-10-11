export interface IdiomContext {
  original: string;
  translation: string;
  explanation: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedLanguage: string;
  toneApplied: string;
  idiomsAndContext: IdiomContext[];
  alternativePhrases: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  context?: string;
  result: TranslationResponse;
  isFavorite?: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ToneOption {
  id: string;
  label: string;
  badge: string;
  description: string;
  iconName: string;
  color: string;
}
