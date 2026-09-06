import React from 'react';
import { Volume2, VolumeX, Lightbulb, Languages, ChevronLeft, ChevronRight, Edit3, Plus, Layers, Share2 } from 'lucide-react';
import { LanguageMode } from '../types';

interface CardHeaderProps {
  titleZh: string;
  titleIt: string;
  titleEn: string;
  instructionZh: string;
  instructionIt: string;
  instructionEn: string;
  currentCardIndex: number;
  totalCards: number;
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showHints: boolean;
  onToggleHints: () => void;
  onPrevCard: () => void;
  onNextCard: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  onEditCard?: () => void;
  onCreateCard?: () => void;
  onOpenDeckManager?: () => void;
  onExportCard?: () => void;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  titleZh,
  titleIt,
  titleEn,
  instructionZh,
  instructionIt,
  instructionEn,
  currentCardIndex,
  totalCards,
  languageMode,
  onLanguageChange,
  soundEnabled,
  onToggleSound,
  showHints,
  onToggleHints,
  onPrevCard,
  onNextCard,
  canGoPrev,
  canGoNext,
  onEditCard,
  onCreateCard,
  onOpenDeckManager,
  onExportCard,
}) => {
  return (
    <header className="w-full flex flex-col items-center">
      {/* Utility Bar */}
      <div className="w-full flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800/80">
        {/* Card Sequencer Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            id="prev-card-btn"
            onClick={onPrevCard}
            disabled={!canGoPrev}
            aria-label="Carta precedente"
            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenDeckManager}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 rounded-full border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors"
            title="Visualizza tutte le schede"
          >
            <span>Carta {currentCardIndex + 1} / {totalCards}</span>
            <Layers className="w-3 h-3 text-indigo-400 ml-0.5" />
          </button>

          <button
            id="next-card-btn"
            onClick={onNextCard}
            disabled={!canGoNext}
            aria-label="Carta successiva"
            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-200 shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls: Language, Hints, Audio, Edit & New */}
        <div className="flex items-center gap-1.5">
          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 shadow-sm text-xs font-medium">
            <Languages className="w-3.5 h-3.5 ml-1.5 text-indigo-400" />
            <button
              id="lang-zh-btn"
              onClick={() => onLanguageChange('chinese')}
              className={`px-2 py-1 rounded-md transition-all ${
                languageMode === 'chinese'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cinese con Pinyin e Traduzione"
            >
              中 / Pinyin
            </button>
            <button
              id="lang-it-btn"
              onClick={() => onLanguageChange('italian')}
              className={`px-2 py-1 rounded-md transition-all ${
                languageMode === 'italian'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Italiano"
            >
              IT
            </button>
            <button
              id="lang-en-btn"
              onClick={() => onLanguageChange('english')}
              className={`px-2 py-1 rounded-md transition-all ${
                languageMode === 'english'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Hint Toggle */}
          <button
            id="hint-toggle-btn"
            onClick={onToggleHints}
            className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 shadow-sm ${
              showHints
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold ring-2 ring-amber-400/40'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
            }`}
            title={showHints ? 'Nascondi indizi' : 'Mostra indizi'}
          >
            <Lightbulb className={`w-4 h-4 ${showHints ? 'fill-amber-400 text-amber-300' : ''}`} />
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/80 transition-all text-slate-300 shadow-sm"
            title={soundEnabled ? 'Disattiva suoni' : 'Attiva suoni'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Edit Card Button */}
          {onEditCard && (
            <button
              id="edit-card-header-btn"
              onClick={onEditCard}
              className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-indigo-950/60 hover:border-indigo-500/60 hover:text-indigo-300 text-slate-300 transition-all shadow-sm"
              title="Modifica questa scheda"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Create New Card Button */}
          {onCreateCard && (
            <button
              id="create-card-header-btn"
              onClick={onCreateCard}
              className="p-1.5 rounded-lg border border-indigo-500/40 bg-indigo-600/80 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-600/25"
              title="Crea nuova scheda"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Export / Print Card Button */}
          {onExportCard && (
            <button
              id="export-card-header-btn"
              onClick={onExportCard}
              className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-emerald-950/60 hover:border-emerald-500/60 hover:text-emerald-300 text-slate-300 transition-all shadow-sm"
              title="Esporta / Stampa scheda (PDF o JSON)"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Card Title styled exactly like reference */}
      <div className="text-center my-1.5">
        <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white font-serif flex items-center justify-center gap-2">
          <span>{titleZh}</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-indigo-300/90 tracking-wide mt-0.5">
          {languageMode === 'chinese' ? titleIt : (languageMode === 'italian' ? titleIt : titleEn)}
        </p>

        {/* Card Instruction with checkmark graphic */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/80 text-xs sm:text-sm text-slate-200 font-medium shadow-sm">
          <span>
            {languageMode === 'chinese'
              ? instructionZh
              : (languageMode === 'italian' ? instructionIt : instructionEn)}
          </span>
          <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-emerald-500 text-slate-950 text-[10px] font-black">
            ✓
          </span>
        </div>
      </div>
    </header>
  );
};
