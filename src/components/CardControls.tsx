import React from 'react';
import { CheckCircle2, RotateCcw, ArrowRight, ArrowLeft, Trophy, AlertCircle, Info } from 'lucide-react';
import { QuizItem, LanguageMode } from '../types';

interface CardControlsProps {
  isVerified: boolean;
  selectedCount: number;
  correctCount: number;
  totalItems: number;
  isAllCorrect: boolean;
  items: QuizItem[];
  selectedIds: string[];
  languageMode: LanguageMode;
  onVerify: () => void;
  onReset: () => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastCard: boolean;
  onFinishQuiz: () => void;
}

export const CardControls: React.FC<CardControlsProps> = ({
  isVerified,
  selectedCount,
  correctCount,
  totalItems,
  isAllCorrect,
  items,
  selectedIds,
  languageMode,
  onVerify,
  onReset,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  isLastCard,
  onFinishQuiz,
}) => {
  const [showExplanationList, setShowExplanationList] = React.useState(false);

  return (
    <div className="w-full mt-4 flex flex-col gap-3">
      {/* Verification Feedback Banner */}
      {isVerified && (
        <div
          className={`p-3 sm:p-4 rounded-2xl border flex flex-col gap-2 transition-all backdrop-blur-md shadow-lg ${
            isAllCorrect
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {isAllCorrect ? (
                <div className="p-1.5 rounded-full bg-emerald-500 text-slate-950">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-1.5 rounded-full bg-amber-500 text-slate-950">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {isAllCorrect
                    ? 'Eccezionale! Hai trovato tutti gli elementi corretti!'
                    : `Punteggio: ${correctCount} su ${totalItems} elementi corretti`}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAllCorrect
                    ? 'Tutti i caratteri della scheda corrispondono esattamente alla scena.'
                    : 'Osserva bene gli elementi evidenziati in verde o tratteggiati per verificare.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowExplanationList(!showExplanationList)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 transition-colors flex items-center gap-1 text-slate-200 shadow-sm"
            >
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showExplanationList ? 'Chiudi' : 'Spiegazioni'}</span>
            </button>
          </div>

          {/* Collapsible explanations */}
          {showExplanationList && (
            <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {items.map((it) => {
                const isSelected = selectedIds.includes(it.id);
                const isCorrect = (isSelected && it.inImage) || (!isSelected && !it.inImage);
                return (
                  <div
                    key={`exp-${it.id}`}
                    className={`p-2 rounded-xl border flex items-start gap-2 ${
                      isCorrect ? 'bg-slate-900/90 border-emerald-500/30' : 'bg-slate-900/90 border-rose-500/30'
                    }`}
                  >
                    <span className="text-base font-bold font-serif text-white">
                      {it.character}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-200">
                        {it.italian} ({it.pinyin}) -{' '}
                        <span className={it.inImage ? 'text-emerald-400' : 'text-slate-400'}>
                          {it.inImage ? 'Presente nel disegno' : 'NON presente'}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        {languageMode === 'chinese'
                          ? it.explanationZh
                          : languageMode === 'italian'
                          ? it.explanationIt
                          : it.explanationEn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Bottom Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Left: Previous Card & Reset */}
        <div className="flex items-center gap-2">
          {canGoPrev && (
            <button
              id="prev-btn"
              onClick={onPrev}
              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Precedente</span>
            </button>
          )}

          {isVerified && (
            <button
              id="reset-card-btn"
              onClick={onReset}
              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Ricomincia questa scheda"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Riprova</span>
            </button>
          )}
        </div>

        {/* Right: Verify button or Next Card / Finish */}
        <div className="flex items-center gap-2">
          {!isVerified ? (
            <button
              id="verify-quiz-btn"
              onClick={onVerify}
              disabled={selectedCount === 0}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm sm:text-base font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verifica Scheda ({selectedCount})</span>
            </button>
          ) : (
            <button
              id="next-card-action-btn"
              onClick={isLastCard ? onFinishQuiz : onNext}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm sm:text-base font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 border border-emerald-400/30 transition-all"
            >
              <span>{isLastCard ? 'Vedi Risultati Finali' : 'Prossima Scheda'}</span>
              {isLastCard ? <Trophy className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 text-emerald-100" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
