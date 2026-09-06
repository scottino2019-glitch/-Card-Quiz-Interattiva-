import React from 'react';
import { Volume2, Check, X, HelpCircle } from 'lucide-react';
import { QuizItem, LanguageMode } from '../types';
import { soundManager } from '../utils/audio';

interface QuizOptionsGridProps {
  items: QuizItem[];
  selectedIds: string[];
  isVerified: boolean;
  languageMode: LanguageMode;
  onToggleItem: (itemId: string) => void;
  onSelectItemForExplanation?: (item: QuizItem) => void;
}

export const QuizOptionsGrid: React.FC<QuizOptionsGridProps> = ({
  items,
  selectedIds,
  isVerified,
  languageMode,
  onToggleItem,
  onSelectItemForExplanation,
}) => {
  const handleSpeak = (e: React.MouseEvent, item: QuizItem) => {
    e.stopPropagation();
    if (languageMode === 'chinese') {
      soundManager.speak(item.character, 'zh-CN');
    } else if (languageMode === 'italian') {
      soundManager.speak(item.italian, 'it-IT');
    } else {
      soundManager.speak(item.english, 'en-US');
    }
  };

  return (
    <div className="w-full mt-4">
      {/* 2x4 grid mimicking authentic card layout on tablets/desktop, responsive on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isCorrect = isVerified && ((isSelected && item.inImage) || (!isSelected && !item.inImage));
          const isWrongSelection = isVerified && isSelected && !item.inImage;
          const isMissedSelection = isVerified && !isSelected && item.inImage;

          // Compute state-based container styling
          let borderClasses = 'border-slate-800/90 hover:border-slate-700/80 bg-slate-900/80 hover:bg-slate-800/70 text-slate-100';

          if (isVerified) {
            if (isWrongSelection) {
              borderClasses = 'border-rose-500/80 bg-rose-950/40 ring-2 ring-rose-500/30 text-rose-100 shadow-lg shadow-rose-950/40';
            } else if (isSelected && item.inImage) {
              borderClasses = 'border-emerald-500/80 bg-emerald-950/40 ring-2 ring-emerald-500/30 text-emerald-100 shadow-lg shadow-emerald-950/40';
            } else if (isMissedSelection) {
              borderClasses = 'border-amber-400/80 border-dashed bg-amber-950/30 text-amber-200';
            }
          } else if (isSelected) {
            borderClasses = 'border-indigo-500/90 bg-indigo-950/40 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/50';
          }

          return (
            <div
              key={item.id}
              id={`quiz-item-${item.id}`}
              role="button"
              tabIndex={0}
              onClick={() => onToggleItem(item.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onToggleItem(item.id);
                }
              }}
              className={`relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none group shadow-md backdrop-blur-md ${borderClasses}`}
            >
              {/* Audio Pronounce Button */}
              <button
                type="button"
                aria-label={`Pronuncia ${item.character}`}
                onClick={(e) => handleSpeak(e, item)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-colors"
                title="Ascolta la pronuncia"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              {/* Status Badge in verification mode */}
              {isVerified && (
                <div className="absolute top-1.5 left-1.5">
                  {isSelected && item.inImage && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  {isWrongSelection && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  {isMissedSelection && (
                    <span
                      title="Questo elemento era presente nell'immagine!"
                      className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold shadow-sm animate-bounce"
                    >
                      !
                    </span>
                  )}
                </div>
              )}

              {/* Character & Word Content */}
              <div className="flex flex-col items-center my-0.5 text-center">
                {languageMode === 'chinese' ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-black text-white font-serif leading-none tracking-tight group-hover:scale-105 transition-transform duration-200 drop-shadow-sm">
                      {item.character}
                    </span>
                    <span className="text-xs font-semibold text-indigo-300 mt-1">
                      {item.pinyin}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[90px]">
                      {item.italian}
                    </span>
                  </>
                ) : languageMode === 'italian' ? (
                  <>
                    <span className="text-lg sm:text-xl font-bold text-white leading-tight">
                      {item.italian}
                    </span>
                    <span className="text-sm font-black text-indigo-300 font-serif mt-0.5">
                      {item.character} ({item.pinyin})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-lg sm:text-xl font-bold text-white leading-tight">
                      {item.english}
                    </span>
                    <span className="text-sm font-black text-indigo-300 font-serif mt-0.5">
                      {item.character} ({item.pinyin})
                    </span>
                  </>
                )}
              </div>

              {/* The Physical-Style Checkbox Box */}
              <div className="mt-2 flex items-center justify-center">
                <div
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? isVerified
                        ? isWrongSelection
                          ? 'bg-rose-600 border-rose-500 shadow-sm'
                          : 'bg-emerald-600 border-emerald-500 shadow-sm'
                        : 'bg-indigo-600 border-indigo-400 shadow-sm shadow-indigo-500/40'
                      : 'border-slate-700 bg-slate-850 group-hover:border-slate-600'
                  }`}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white stroke-[3] animate-in zoom-in-50 duration-150" />
                  )}
                </div>
              </div>

              {/* Detail explanation toggle if verified */}
              {isVerified && onSelectItemForExplanation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItemForExplanation(item);
                  }}
                  className="mt-1 text-[10px] text-indigo-300 hover:text-indigo-200 font-medium underline inline-flex items-center gap-0.5"
                >
                  <HelpCircle className="w-2.5 h-2.5" />
                  <span>Dettaglio</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
