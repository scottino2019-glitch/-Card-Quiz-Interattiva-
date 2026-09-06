export interface VocabularySuggestion {
  character: string;
  pinyin: string;
  italian: string;
  english: string;
  category: string;
}

export const VOCABULARY_SUGGESTIONS: VocabularySuggestion[] = [
  // Natura & Elementi
  { character: '雨', pinyin: 'yǔ', italian: 'Pioggia', english: 'Rain', category: 'Natura' },
  { character: '云', pinyin: 'yún', italian: 'Nuvola', english: 'Cloud', category: 'Natura' },
  { character: '水', pinyin: 'shuǐ', italian: 'Acqua', english: 'Water', category: 'Natura' },
  { character: '风', pinyin: 'fēng', italian: 'Vento', english: 'Wind', category: 'Natura' },
  { character: '日', pinyin: 'rì', italian: 'Sole / Giorno', english: 'Sun / Day', category: 'Natura' },
  { character: '月', pinyin: 'yuè', italian: 'Luna / Mese', english: 'Moon / Month', category: 'Natura' },
  { character: '山', pinyin: 'shān', italian: 'Montagna', english: 'Mountain', category: 'Natura' },
  { character: '木', pinyin: 'mù', italian: 'Albero / Legno', english: 'Tree / Wood', category: 'Natura' },
  { character: '火', pinyin: 'huǒ', italian: 'Fuoco', english: 'Fire', category: 'Natura' },
  { character: '土', pinyin: 'tǔ', italian: 'Terra', english: 'Soil / Earth', category: 'Natura' },
  { character: '花', pinyin: 'huā', italian: 'Fiore', english: 'Flower', category: 'Natura' },
  { character: '草', pinyin: 'cǎo', italian: 'Erba', english: 'Grass', category: 'Natura' },
  { character: '石', pinyin: 'shí', italian: 'Pietra / Roccia', english: 'Stone / Rock', category: 'Natura' },
  { character: '海', pinyin: 'hǎi', italian: 'Mare', english: 'Sea / Ocean', category: 'Natura' },
  { character: '星', pinyin: 'xīng', italian: 'Stella', english: 'Star', category: 'Natura' },

  // Animali
  { character: '猫', pinyin: 'māo', italian: 'Gatto', english: 'Cat', category: 'Animali' },
  { character: '狗', pinyin: 'gǒu', italian: 'Cane', english: 'Dog', category: 'Animali' },
  { character: '鸟', pinyin: 'niǎo', italian: 'Uccello', english: 'Bird', category: 'Animali' },
  { character: '鱼', pinyin: 'yú', italian: 'Pesce', english: 'Fish', category: 'Animali' },
  { character: '马', pinyin: 'mǎ', italian: 'Cavallo', english: 'Horse', category: 'Animali' },
  { character: '牛', pinyin: 'niú', italian: 'Mucca / Bue', english: 'Cow / Ox', category: 'Animali' },
  { character: '羊', pinyin: 'yáng', italian: 'Pecora / Capra', english: 'Sheep / Goat', category: 'Animali' },
  { character: '鸭', pinyin: 'yā', italian: 'Anatra', english: 'Duck', category: 'Animali' },
  { character: '兔', pinyin: 'tù', italian: 'Coniglio', english: 'Rabbit', category: 'Animali' },
  { character: '虫', pinyin: 'chóng', italian: 'Insetto', english: 'Insect / Bug', category: 'Animali' },

  // Oggetti, Cose & Luoghi
  { character: '门', pinyin: 'mén', italian: 'Porta', english: 'Door / Gate', category: 'Oggetti' },
  { character: '车', pinyin: 'chē', italian: 'Auto / Veicolo', english: 'Car / Vehicle', category: 'Oggetti' },
  { character: '船', pinyin: 'chuán', italian: 'Barca / Nave', english: 'Boat / Ship', category: 'Oggetti' },
  { character: '书', pinyin: 'shū', italian: 'Libro', english: 'Book', category: 'Oggetti' },
  { character: '伞', pinyin: 'sǎn', italian: 'Ombrello', english: 'Umbrella', category: 'Oggetti' },
  { character: '灯', pinyin: 'dēng', italian: 'Lampada / Luce', english: 'Lamp / Light', category: 'Oggetti' },
  { character: '包', pinyin: 'bāo', italian: 'Borsa / Zaino', english: 'Bag / Backpack', category: 'Oggetti' },
  { character: '桌', pinyin: 'zhuō', italian: 'Tavolo', english: 'Table', category: 'Oggetti' },
  { character: '椅', pinyin: 'yǐ', italian: 'Sedia', english: 'Chair', category: 'Oggetti' },
  { character: '路', pinyin: 'lù', italian: 'Strada / Sentiero', english: 'Road / Path', category: 'Oggetti' },

  // Cibo & Bevande
  { character: '茶', pinyin: 'chá', italian: 'Tè', english: 'Tea', category: 'Cibo' },
  { character: '米', pinyin: 'mǐ', italian: 'Riso', english: 'Rice', category: 'Cibo' },
  { character: '肉', pinyin: 'ròu', italian: 'Carne', english: 'Meat', category: 'Cibo' },
  { character: '蛋', pinyin: 'dàn', italian: 'Uovo', english: 'Egg', category: 'Cibo' },
  { character: '果', pinyin: 'guǒ', italian: 'Frutta', english: 'Fruit', category: 'Cibo' },

  // Persone & Azioni
  { character: '人', pinyin: 'rén', italian: 'Persona', english: 'Person', category: 'Persone' },
  { character: '子', pinyin: 'zǐ', italian: 'Bambino / Figlio', english: 'Child', category: 'Persone' },
  { character: '手', pinyin: 'shǒu', italian: 'Mano', english: 'Hand', category: 'Persone' },
  { character: '足', pinyin: 'zú', italian: 'Piede', english: 'Foot', category: 'Persone' },
  { character: '口', pinyin: 'kǒu', italian: 'Bocca', english: 'Mouth', category: 'Persone' },
  { character: '目', pinyin: 'mù', italian: 'Occhio', english: 'Eye', category: 'Persone' },
];
