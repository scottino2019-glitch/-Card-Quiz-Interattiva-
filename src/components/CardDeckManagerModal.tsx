import React from 'react';
import { QuizCardData } from '../types';
import { X, Plus, Edit3, Copy, Trash2, RotateCcw, Check, Sparkles, Layers, Share2, Printer, Download } from 'lucide-react';

interface CardDeckManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: QuizCardData[];
  currentCardIndex: number;
  onSelectCard: (index: number) => void;
  onCreateNew: () => void;
  onEditCard: (card: QuizCardData) => void;
  onDuplicateCard: (card: QuizCardData) => void;
  onDeleteCard: (cardId: string) => void;
  onResetDefaults: () => void;
  onOpenExport?: (card?: QuizCardData) => void;
}

export const CardDeckManagerModal: React.FC<CardDeckManagerModalProps> = ({
  isOpen,
  onClose,
  cards,
  currentCardIndex,
  onSelectCard,
  onCreateNew,
  onEditCard,
  onDuplicateCard,
  onDeleteCard,
  onResetDefaults,
  onOpenExport,
}) => {
  const [confirmReset, setConfirmReset] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-slate-900/95 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-800 ring-1 ring-white/10 text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Tutte le Schede Quiz ({cards.length})
              </h2>
              <p className="text-xs text-indigo-300/80">
                Sfoglia, modifica, stampa o esporta le schede didattiche
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenExport && (
              <button
                id="export-deck-btn"
                onClick={() => {
                  onClose();
                  onOpenExport();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 border border-emerald-400/30 transition-all active:scale-95"
                title="Esporta mazzo in JSON o stampa schede A4"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Esporta / Stampa</span>
              </button>
            )}

            <button
              id="new-card-deck-btn"
              onClick={() => {
                onClose();
                onCreateNew();
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuova Scheda</span>
            </button>

            <button
              id="close-deck-manager-btn"
              onClick={onClose}
              aria-label="Chiudi gestione schede"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card List Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.map((card, idx) => {
              const isCurrent = idx === currentCardIndex;
              const presentCount = card.items.filter((i) => i.inImage).length;

              return (
                <div
                  key={card.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between group ${
                    isCurrent
                      ? 'border-indigo-400/80 bg-indigo-950/40 ring-2 ring-indigo-500/30 shadow-xl'
                      : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-700/80 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700/80 shrink-0 bg-slate-900 relative">
                      <img
                        src={card.imageSrc}
                        alt={card.titleIt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-[10px] font-bold text-white backdrop-blur-xs border border-white/20">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-black text-white text-base leading-tight">
                          {card.titleZh}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-600/80 text-white">
                            In corso
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                        {card.titleIt}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {card.items.length} vocaboli ({presentCount} nel disegno)
                      </p>

                      {/* Characters mini badges */}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {card.items.slice(0, 6).map((item) => (
                          <span
                            key={item.id}
                            className={`text-[11px] font-serif font-bold px-1 rounded ${
                              item.inImage ? 'text-indigo-300 bg-indigo-950/60' : 'text-slate-500 bg-slate-900'
                            }`}
                          >
                            {item.character}
                          </span>
                        ))}
                        {card.items.length > 6 && (
                          <span className="text-[10px] text-slate-500">+{card.items.length - 6}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        onSelectCard(idx);
                        onClose();
                      }}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Gioca questa scheda</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {onOpenExport && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenExport(card);
                          }}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-emerald-700 bg-slate-900 text-slate-300 hover:text-emerald-300 transition-colors"
                          title="Stampa scheda didattica o esporta in JSON"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onClose();
                          onEditCard(card);
                        }}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors"
                        title="Modifica scheda"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDuplicateCard(card)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors"
                        title="Duplica scheda"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {cards.length > 1 && (
                        <button
                          onClick={() => onDeleteCard(card.id)}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-800 bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Elimina scheda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <div>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-medium">Ripristinare le 4 schede originali?</span>
                <button
                  onClick={() => {
                    onResetDefaults();
                    setConfirmReset(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Sì, ripristina
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ripristina schede originali</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
