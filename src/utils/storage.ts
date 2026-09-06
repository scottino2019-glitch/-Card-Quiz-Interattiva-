import { QuizCardData } from '../types';
import { QUIZ_CARDS } from '../data/quizCards';

const STORAGE_KEY = 'hanzi_visual_quiz_cards_v2';

export const PRESET_THEMES = [
  { id: 'sky', label: 'Cielo / Azzurro', color: 'sky' as const },
  { id: 'amber', label: 'Ambra / Caldo', color: 'amber' as const },
  { id: 'indigo', label: 'Indaco / Notturno', color: 'indigo' as const },
  { id: 'emerald', label: 'Smeraldo / Natura', color: 'emerald' as const },
  { id: 'rose', label: 'Rosa / Vivace', color: 'rose' as const },
];

export interface PresetImageOption {
  id: string;
  name: string;
  url: string;
  category: string;
}

export const PRESET_IMAGE_OPTIONS: PresetImageOption[] = [
  {
    id: 'img-rain',
    name: 'Giorno di Pioggia',
    url: QUIZ_CARDS[0].imageSrc,
    category: 'Natura',
  },
  {
    id: 'img-sunny',
    name: 'Picnic al Sole nel Prato',
    url: QUIZ_CARDS[1].imageSrc,
    category: 'Natura',
  },
  {
    id: 'img-night',
    name: 'Campeggio Sotto le Stelle',
    url: QUIZ_CARDS[2].imageSrc,
    category: 'Avventura',
  },
  {
    id: 'img-beach',
    name: 'Spiaggia e Onde dell\'Oceano',
    url: QUIZ_CARDS[3].imageSrc,
    category: 'Estate',
  },
  {
    id: 'img-forest',
    name: 'Foresta Magica con Animali',
    url: QUIZ_CARDS[4]?.imageSrc || QUIZ_CARDS[0].imageSrc,
    category: 'Animali & Natura',
  },
  {
    id: 'img-kitchen',
    name: 'Cucina & Dolci',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
    category: 'Cibo & Casa',
  },
  {
    id: 'img-garden',
    name: 'Giardino Fiorito',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80',
    category: 'Piante & Fiori',
  },
  {
    id: 'img-city',
    name: 'Città e Strade',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=80',
    category: 'Città',
  },
];

/**
 * Load cards from localStorage or fall back to default QUIZ_CARDS
 */
export function loadQuizCards(): QuizCardData[] {
  if (typeof window === 'undefined') return QUIZ_CARDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return QUIZ_CARDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Heal any broken external image URLs (like old Unsplash forest photo) with the generated artwork
      const healed = parsed.map((card: QuizCardData) => {
        if (
          !card.imageSrc ||
          card.imageSrc.includes('unsplash.com/photo-1511497584788') ||
          (card.titleIt && card.titleIt.toLowerCase().includes('foresta') && (!card.imageSrc || card.imageSrc.includes('unsplash')))
        ) {
          return { ...card, imageSrc: QUIZ_CARDS[4]?.imageSrc || card.imageSrc };
        }
        return card;
      });

      // If user had existing deck but doesn't have the new Foresta Magica card yet, add it
      const hasForestCard = healed.some(
        (c: QuizCardData) => c.id === 'card-5-forest' || (c.titleIt && c.titleIt.toLowerCase().includes('foresta'))
      );
      if (!hasForestCard && QUIZ_CARDS[4]) {
        healed.push(QUIZ_CARDS[4]);
      }

      return healed;
    }
  } catch (err) {
    console.error('Failed to parse saved cards from localStorage:', err);
  }
  return QUIZ_CARDS;
}

/**
 * Save cards to localStorage
 */
export function saveQuizCards(cards: QuizCardData[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save cards to localStorage:', err);
  }
}

/**
 * Reset cards back to the original default deck
 */
export function resetQuizCards(): QuizCardData[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  return QUIZ_CARDS;
}
