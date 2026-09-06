import React from 'react';
import { X, Volume2, Sparkles } from 'lucide-react';
import { QuizItem, LanguageMode } from '../types';
import { soundManager } from '../utils/audio';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
  items: QuizItem[];
  selectedItem?: QuizItem | null;
  languageMode: LanguageMode;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  title,
  items,
  selectedItem,
  languageMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-slate-900/95 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-800 ring-1 ring-white/10">
        {/* Modal Header */}
        <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white text-sm sm:text-base">
              Esplora l'Immagine: {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Image with location markers */}
        <div className="relative overflow-auto flex-1 p-2 sm:p-4 bg-slate-950/70 flex items-center justify-center">
          <div className="relative max-w-full max-h-[60vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src={imageSrc}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[60vh] object-contain select-none"
            />
            {/* Markers on the image */}
            {items
              .filter((it) => it.inImage && it.boundingLocation)
              .map((it) => (
                <div
                  key={`modal-marker-${it.id}`}
                  style={{
                    left: `${it.boundingLocation?.x}%`,
                    top: `${it.boundingLocation?.y}%`,
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  onClick={() => {
                    soundManager.speak(it.character, 'zh-CN');
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative flex items-center justify-center rounded-full h-8 w-8 bg-indigo-600 text-white font-serif font-black text-sm shadow-lg border-2 border-white/90 group-hover:scale-110 transition-transform">
                      {it.character}
                    </span>
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center bg-slate-900/95 border border-slate-700 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap z-10">
                    <span className="font-bold">{it.character} ({it.pinyin})</span>
                    <span className="text-slate-300">{it.italian}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Modal Footer with elements summary */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Elementi da trovare in questa scena (clicca per ascoltare):
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((it) => (
              <button
                key={`modal-tag-${it.id}`}
                onClick={() => {
                  soundManager.speak(it.character, 'zh-CN');
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  it.inImage
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50'
                    : 'border-slate-800 bg-slate-900/50 text-slate-500 line-through'
                }`}
              >
                <span className="font-bold font-serif text-sm text-white">{it.character}</span>
                <span className="text-indigo-300">{it.pinyin}</span>
                <span className="text-slate-500">·</span>
                <span>{languageMode === 'italian' ? it.italian : it.english}</span>
                <Volume2 className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
