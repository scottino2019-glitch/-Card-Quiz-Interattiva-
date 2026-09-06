import React, { useState, useRef } from 'react';
import { QuizCardData, QuizItem } from '../types';
import { PRESET_IMAGE_OPTIONS, PRESET_THEMES } from '../utils/storage';
import { VOCABULARY_SUGGESTIONS, VocabularySuggestion } from '../data/characterLibrary';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  CheckCircle2,
  Trash2,
  Copy,
  MapPin,
  HelpCircle,
  Layers,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: QuizCardData) => void;
  onDelete?: (cardId: string) => void;
  initialCard: QuizCardData | null;
  totalCardsCount: number;
}

const DEFAULT_INSTRUCTION_ZH = '仔细看看图里有什么，找到对应的汉字打 "✓"';
const DEFAULT_INSTRUCTION_IT = 'Osserva attentamente l\'immagine e seleziona i vocaboli presenti!';
const DEFAULT_INSTRUCTION_EN = 'Look closely at what is in the picture, check the matching words!';

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialCard,
  totalCardsCount,
}) => {
  const isEditing = Boolean(initialCard);

  // Active step/tab: 'info' or 'items'
  const [activeTab, setActiveTab] = useState<'info' | 'items'>('info');

  // Form State
  const [titleZh, setTitleZh] = useState<string>(initialCard?.titleZh || '汉字捉迷藏');
  const [titleIt, setTitleIt] = useState<string>(initialCard?.titleIt || 'Nuova Caccia ai Caratteri');
  const [titleEn, setTitleEn] = useState<string>(initialCard?.titleEn || 'Character Hide & Seek');
  const [instructionZh, setInstructionZh] = useState<string>(initialCard?.instructionZh || DEFAULT_INSTRUCTION_ZH);
  const [instructionIt, setInstructionIt] = useState<string>(initialCard?.instructionIt || DEFAULT_INSTRUCTION_IT);
  const [instructionEn, setInstructionEn] = useState<string>(initialCard?.instructionEn || DEFAULT_INSTRUCTION_EN);
  const [themeColor, setThemeColor] = useState<QuizCardData['themeColor']>(initialCard?.themeColor || 'indigo');
  const [imageSrc, setImageSrc] = useState<string>(initialCard?.imageSrc || PRESET_IMAGE_OPTIONS[0].url);

  // 8 items state
  const [items, setItems] = useState<QuizItem[]>(() => {
    if (initialCard && initialCard.items && initialCard.items.length > 0) {
      return JSON.parse(JSON.stringify(initialCard.items));
    }
    // Generate 8 initial empty items
    return Array.from({ length: 8 }, (_, idx) => ({
      id: `item-${Date.now()}-${idx + 1}`,
      character: '',
      pinyin: '',
      italian: '',
      english: '',
      inImage: idx < 4, // default 4 present, 4 absent
      explanationIt: '',
      explanationEn: '',
      explanationZh: '',
    }));
  });

  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [isPinpointing, setIsPinpointing] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [vocabCategory, setVocabCategory] = useState<string>('Tutti');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewImageRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // File Upload Handlers (Supports both Drag-and-Drop and Manual selection via click)
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setValidationError('Seleziona un file immagine valido (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
        setValidationError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  // Interactive Click Pinpointing on Preview Image
  const handleImageClickForPinpoint = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinpointing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    setItems((prev) => {
      const copy = [...prev];
      copy[activeItemIndex] = {
        ...copy[activeItemIndex],
        boundingLocation: { x, y },
        inImage: true, // If pinpointed, it's marked as present in image
      };
      return copy;
    });

    setIsPinpointing(false);
  };

  // Update specific field of active item
  const updateActiveItem = <K extends keyof QuizItem>(field: K, value: QuizItem[K]) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[activeItemIndex] = {
        ...copy[activeItemIndex],
        [field]: value,
      };
      return copy;
    });
  };

  // Apply character suggestion to active item
  const applyVocabularySuggestion = (sug: VocabularySuggestion) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[activeItemIndex] = {
        ...copy[activeItemIndex],
        character: sug.character,
        pinyin: sug.pinyin,
        italian: sug.italian,
        english: sug.english,
        explanationIt: `Riconosci "${sug.character}" (${sug.italian}) nella scena.`,
        explanationEn: `Spot "${sug.character}" (${sug.english}) in the scene.`,
        explanationZh: `在图画中寻找汉字 "${sug.character}"。`,
      };
      return copy;
    });
  };

  // Validation & Save
  const handleSaveCard = () => {
    // Check title
    if (!titleIt.trim() || !titleZh.trim()) {
      setValidationError('Inserisci un titolo valido per la scheda (in Italiano e Cinese).');
      setActiveTab('info');
      return;
    }

    // Check that at least 4 items have characters
    const validItems = items.filter((it) => it.character.trim().length > 0);
    if (validItems.length < 4) {
      setValidationError('Compila almeno 4 caratteri cinesi tra gli 8 riquadri.');
      setActiveTab('items');
      return;
    }

    // Check that there is at least one item present in image
    const presentItems = items.filter((it) => it.character.trim().length > 0 && it.inImage);
    if (presentItems.length === 0) {
      setValidationError('Almeno un elemento deve essere contrassegnato come "Presente nel disegno".');
      setActiveTab('items');
      return;
    }

    const cardToSave: QuizCardData = {
      id: initialCard ? initialCard.id : `custom-card-${Date.now()}`,
      cardNumber: initialCard ? initialCard.cardNumber : totalCardsCount + 1,
      titleZh: titleZh.trim(),
      titleIt: titleIt.trim(),
      titleEn: titleEn.trim() || titleIt.trim(),
      instructionZh: instructionZh.trim() || DEFAULT_INSTRUCTION_ZH,
      instructionIt: instructionIt.trim() || DEFAULT_INSTRUCTION_IT,
      instructionEn: instructionEn.trim() || DEFAULT_INSTRUCTION_EN,
      themeColor,
      imageSrc,
      items: items.map((it, idx) => ({
        ...it,
        id: it.id || `item-${Date.now()}-${idx + 1}`,
        character: it.character.trim() || '？',
        pinyin: it.pinyin.trim() || '',
        italian: it.italian.trim() || 'Vocabolo',
        english: it.english.trim() || 'Word',
        explanationIt: it.explanationIt.trim() || (it.inImage ? 'Presente nella scena.' : 'Non presente nella scena.'),
        explanationEn: it.explanationEn.trim() || (it.inImage ? 'Present in the scene.' : 'Not in the scene.'),
        explanationZh: it.explanationZh.trim() || (it.inImage ? '在画面中可见。' : '未在画面中出现。'),
      })),
    };

    onSave(cardToSave);
    onClose();
  };

  const categories = ['Tutti', 'Natura', 'Animali', 'Oggetti', 'Cibo', 'Persone'];
  const filteredSuggestions =
    vocabCategory === 'Tutti'
      ? VOCABULARY_SUGGESTIONS
      : VOCABULARY_SUGGESTIONS.filter((s) => s.category === vocabCategory);

  const currentItem = items[activeItemIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-slate-900/95 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-800 ring-1 ring-white/10 text-slate-100">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25 border border-white/20">
              {isEditing ? '✎' : '+'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {isEditing ? `Modifica Scheda #${initialCard?.cardNumber}` : 'Crea Nuova Scheda Quiz'}
              </h2>
              <p className="text-xs text-indigo-300/80">
                Personalizza immagine, caratteri, pinyin e posizioni
              </p>
            </div>
          </div>

          <button
            id="close-card-editor-btn"
            onClick={onClose}
            aria-label="Chiudi editor"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>1. Scena & Titoli</span>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'items'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Gli 8 Caratteri ({items.filter((i) => i.character).length}/8)</span>
          </button>

          {validationError && (
            <div className="ml-auto text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SCENE & TITLES */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Titles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Titolo in Cinese (汉字标题) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={titleZh}
                    onChange={(e) => setTitleZh(e.target.value)}
                    placeholder="Es: 汉字捉迷藏"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-serif"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Titolo in Italiano <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={titleIt}
                    onChange={(e) => setTitleIt(e.target.value)}
                    placeholder="Es: Caccia ai Caratteri: Nella Cucina"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Istruzione / Consegna (Italiano)
                  </label>
                  <input
                    type="text"
                    value={instructionIt}
                    onChange={(e) => setInstructionIt(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Tema Cromatico
                  </label>
                  <div className="flex items-center gap-2">
                    {PRESET_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setThemeColor(theme.color)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          themeColor === theme.color
                            ? 'bg-indigo-600/80 border-indigo-400 text-white shadow-sm ring-2 ring-indigo-400/40'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Selection Section */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Immagine della Scena</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Carica una foto/disegno oppure scegli dalla galleria
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDraggingFile
                        ? 'border-indigo-400 bg-indigo-950/40 text-indigo-200'
                        : 'border-slate-700 hover:border-indigo-500/80 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Trascina qui l'immagine o fai clic
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Supporta PNG, JPG, WebP (foto, illustrazioni o disegni)
                    </span>
                  </div>

                  {/* Image Live Preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[4/3] flex items-center justify-center group shadow-xl">
                    <img
                      src={imageSrc}
                      alt="Anteprima scena"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setValidationError('Impossibile caricare l\'immagine. Prova con un\'altra immagine.');
                      }}
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Anteprima Scena</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Pronta
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preset Gallery */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-400">
                    O scegli una scena predefinita:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_IMAGE_OPTIONS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setImageSrc(preset.url);
                          setValidationError(null);
                        }}
                        className={`p-1.5 rounded-xl border text-left transition-all overflow-hidden relative group ${
                          imageSrc === preset.url
                            ? 'border-indigo-400 ring-2 ring-indigo-500/40 bg-indigo-950/40'
                            : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden mb-1.5">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="px-1 truncate text-xs font-medium text-slate-200">
                          {preset.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THE 8 ITEMS */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              {/* 8 Items Selector Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    I Riquadri del Quiz (8 Caratteri)
                  </label>
                  <span className="text-xs text-indigo-300">
                    Seleziona uno slot per compilare il carattere
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {items.map((it, idx) => {
                    const isSelected = activeItemIndex === idx;
                    const hasChar = Boolean(it.character.trim());
                    return (
                      <button
                        key={it.id || idx}
                        type="button"
                        onClick={() => {
                          setActiveItemIndex(idx);
                          setIsPinpointing(false);
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-950/70 ring-2 ring-indigo-500/40 shadow-lg text-white'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 font-bold mb-0.5">
                          #{idx + 1}
                        </span>
                        <span className="text-2xl font-black font-serif leading-none h-7 flex items-center justify-center">
                          {hasChar ? it.character : '＋'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-full mt-1">
                          {it.italian || (it.inImage ? 'Nel disegno' : 'Assente')}
                        </span>
                        {it.inImage && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" title="Presente nel disegno" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Item Form */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-600/40 text-indigo-300 border border-indigo-500/30">
                      Riquadro #{activeItemIndex + 1}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {currentItem.character ? `Carattere: ${currentItem.character}` : 'Compila Carattere'}
                    </span>
                  </div>

                  {/* Present in Image Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">
                      Presente nel disegno?
                    </span>
                    <button
                      type="button"
                      onClick={() => updateActiveItem('inImage', !currentItem.inImage)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentItem.inImage
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {currentItem.inImage ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>SÌ (✓ Da trovare)</span>
                        </>
                      ) : (
                        <span>NO (Distrattore)</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Carattere (汉字) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentItem.character}
                      onChange={(e) => updateActiveItem('character', e.target.value)}
                      placeholder="es. 雨"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-serif font-black text-xl text-center focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Pinyin
                    </label>
                    <input
                      type="text"
                      value={currentItem.pinyin}
                      onChange={(e) => updateActiveItem('pinyin', e.target.value)}
                      placeholder="es. yǔ"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 font-medium text-sm text-center focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Significato Italiano <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentItem.italian}
                      onChange={(e) => updateActiveItem('italian', e.target.value)}
                      placeholder="es. Pioggia"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      English
                    </label>
                    <input
                      type="text"
                      value={currentItem.english}
                      onChange={(e) => updateActiveItem('english', e.target.value)}
                      placeholder="es. Rain"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Explanation text */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Spiegazione / Indizio per la verifica (Italiano)
                  </label>
                  <input
                    type="text"
                    value={currentItem.explanationIt}
                    onChange={(e) => updateActiveItem('explanationIt', e.target.value)}
                    placeholder="es. Le gocce di pioggia scendono fitte dal cielo..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Interactive Pinpoint Tool */}
                {currentItem.inImage && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-slate-200">
                          Posizione dell'indizio sulla scena:
                        </span>
                        {currentItem.boundingLocation ? (
                          <span className="text-xs text-emerald-400 font-medium">
                            Coordinate impostate ({currentItem.boundingLocation.x}%, {currentItem.boundingLocation.y}%)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Nessun punto fissato
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsPinpointing(!isPinpointing)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isPinpointing
                            ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                            : 'bg-indigo-600/80 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{isPinpointing ? 'Clicca sull\'immagine qui sotto' : 'Fissa Posizione'}</span>
                      </button>
                    </div>

                    {/* Pinpoint Target Image */}
                    <div
                      ref={previewImageRef}
                      onClick={handleImageClickForPinpoint}
                      className={`relative w-full rounded-xl overflow-hidden border border-slate-700 aspect-[4/3] max-h-56 bg-slate-950 select-none ${
                        isPinpointing ? 'cursor-crosshair ring-2 ring-amber-400' : 'cursor-default'
                      }`}
                    >
                      <img
                        src={imageSrc}
                        alt="Pinpoint canvas"
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {/* Render current item pin if exists */}
                      {currentItem.boundingLocation && (
                        <div
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                          style={{
                            left: `${currentItem.boundingLocation.x}%`,
                            top: `${currentItem.boundingLocation.y}%`,
                          }}
                        >
                          <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex items-center justify-center rounded-full h-7 w-7 bg-indigo-600 text-white font-bold text-xs border-2 border-white shadow-lg">
                            {currentItem.character || '#'}
                          </span>
                        </div>
                      )}

                      {/* Pinpoint instruction banner */}
                      {isPinpointing && (
                        <div className="absolute top-2 left-2 right-2 bg-amber-500 text-slate-950 text-xs font-bold py-1.5 px-3 rounded-lg text-center shadow-lg pointer-events-none">
                          Fai clic sul punto esatto dell'immagine dove si trova "{currentItem.character || currentItem.italian}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Pick Vocabulary Library */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Suggerimenti Rapidi Caratteri:</span>
                    </span>

                    {/* Category Filter */}
                    <div className="flex items-center gap-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setVocabCategory(cat)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                            vocabCategory === cat
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Character Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {filteredSuggestions.map((sug) => (
                      <button
                        key={`${sug.character}-${sug.pinyin}`}
                        type="button"
                        onClick={() => applyVocabularySuggestion(sug)}
                        className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-indigo-900/40 hover:border-indigo-500/60 transition-all flex items-center gap-1.5 text-xs text-slate-200 group"
                        title={`Applica ${sug.character} (${sug.pinyin} - ${sug.italian})`}
                      >
                        <span className="font-serif font-black text-sm text-white group-hover:text-indigo-300">
                          {sug.character}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {sug.italian}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div>
            {isEditing && onDelete && (
              <div className="relative">
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2 bg-rose-950/60 p-1.5 rounded-xl border border-rose-500/50">
                    <span className="text-xs text-rose-300 font-semibold px-1">
                      Confermi eliminazione?
                    </span>
                    <button
                      id="confirm-delete-card-btn"
                      type="button"
                      onClick={() => {
                        if (initialCard) onDelete(initialCard.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                    >
                      Sì, elimina
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                    >
                      Annulla
                    </button>
                  </div>
                ) : (
                  <button
                    id="trigger-delete-card-btn"
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 rounded-xl border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 transition-colors text-xs flex items-center gap-1.5"
                    title="Elimina questa scheda"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Elimina Scheda</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="cancel-card-editor-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
            >
              Annulla
            </button>

            {activeTab === 'info' ? (
              <button
                type="button"
                onClick={() => setActiveTab('items')}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Continua ai Caratteri</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="save-card-btn"
                type="button"
                onClick={handleSaveCard}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 border border-emerald-400/30 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salva Scheda</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
