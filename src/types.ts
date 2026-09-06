export type LanguageMode = 'chinese' | 'italian' | 'english';

export interface QuizItem {
  id: string;
  character: string;
  pinyin: string;
  italian: string;
  english: string;
  inImage: boolean;
  explanationIt: string;
  explanationEn: string;
  explanationZh: string;
  iconName?: string;
  boundingLocation?: {
    x: number; // percentage from left
    y: number; // percentage from top
  };
}

export interface QuizCardData {
  id: string;
  cardNumber: number;
  titleZh: string;
  titleIt: string;
  titleEn: string;
  instructionZh: string;
  instructionIt: string;
  instructionEn: string;
  imageSrc: string;
  themeColor: 'amber' | 'emerald' | 'indigo' | 'sky' | 'rose';
  items: QuizItem[];
}

export interface CardResult {
  cardId: string;
  selectedIds: string[];
  isVerified: boolean;
  score: number; // e.g. correct checks + correct unchecks
  maxScore: number;
  allCorrect: boolean;
}
