import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, RotateCcw, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { CardResult, QuizCardData } from '../types';
import { soundManager } from '../utils/audio';

interface QuizResultsModalProps {
  isOpen: boolean;
  onRestart: () => void;
  results: Record<string, CardResult>;
  cards: QuizCardData[];
}

export const QuizResultsModal: React.FC<QuizResultsModalProps> = ({
  isOpen,
  onRestart,
  results,
  cards,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playFanfareSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate total score
  let totalScore = 0;
  let maxPossibleScore = 0;
  let cardsAllCorrectCount = 0;

  cards.forEach((card) => {
    const res = results[card.id];
    if (res) {
      totalScore += res.score;
      maxPossibleScore += res.maxScore;
      if (res.allCorrect) cardsAllCorrectCount += 1;
    }
  });

  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900/95 rounded-[2rem] shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center border border-slate-800 ring-1 ring-white/10">
        {/* Trophy Icon */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
          Complimenti! Quiz Completato!
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Hai completato tutte le schede di osservazione e caccia ai caratteri!
        </p>

        {/* Stars Display */}
        <div className="flex items-center gap-1.5 my-4">
          {[1, 2, 3, 4, 5].map((starIdx) => {
            const isFilled = starIdx <= Math.round((percentage / 100) * 5);
            return (
              <Star
                key={`star-${starIdx}`}
                className={`w-7 h-7 transition-all ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-md'
                    : 'text-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Score Card Stats */}
        <div className="w-full grid grid-cols-3 gap-2 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-5">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 font-medium">Precisione</span>
            <span className="text-xl font-black text-indigo-400">{percentage}%</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Punti</span>
            <span className="text-xl font-black text-white">
              {totalScore} / {maxPossibleScore}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 font-medium">Schede Perfette</span>
            <span className="text-xl font-black text-emerald-400">
              {cardsAllCorrectCount} / {cards.length}
            </span>
          </div>
        </div>

        {/* Cards Breakdown List */}
        <div className="w-full text-left mb-6 flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
          {cards.map((card) => {
            const res = results[card.id];
            const isPerf = res?.allCorrect;
            return (
              <div
                key={`summary-${card.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-white text-sm">
                    {card.titleZh}
                  </span>
                  <span className="text-slate-400 font-medium">{card.titleIt}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  {isPerf ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Perfetto!
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      {res ? `${res.score}/${res.maxScore}` : '0'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all active:scale-[0.98]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Gioca di Nuovo</span>
        </button>
      </div>
    </div>
  );
};
