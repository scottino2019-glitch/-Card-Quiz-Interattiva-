import React from 'react';
import { Maximize2, Sparkles } from 'lucide-react';
import { QuizItem } from '../types';

interface CardImageProps {
  imageSrc: string;
  altText: string;
  items: QuizItem[];
  showHints: boolean;
  onOpenZoom: () => void;
}

export const CardImage: React.FC<CardImageProps> = ({
  imageSrc,
  altText,
  items,
  showHints,
  onOpenZoom,
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/60 shadow-2xl aspect-[4/3] group ring-1 ring-white/10">
      {/* Quiz Scene Image */}
      <img
        src={imageSrc}
        alt={altText}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.01]"
      />

      {/* Interactive Visual Hints Overlay */}
      {showHints && (
        <div className="absolute inset-0 pointer-events-none">
          {items
            .filter((item) => item.inImage && item.boundingLocation)
            .map((item) => (
              <div
                key={`hint-${item.id}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${item.boundingLocation?.x}%`,
                  top: `${item.boundingLocation?.y}%`,
                }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center rounded-full h-7 w-7 bg-indigo-600 text-white shadow-lg border-2 border-white/90 text-xs font-bold">
                    {item.character}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Floating Action Badge / Zoom */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
        {showHints && (
          <div className="flex items-center gap-1 bg-indigo-600/90 border border-indigo-400/30 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg">
            <Sparkles className="w-3 h-3" />
            <span>Indizi attivi</span>
          </div>
        )}
        <button
          id="zoom-image-btn"
          onClick={onOpenZoom}
          aria-label="Ingrandisci immagine"
          className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 backdrop-blur-md transition-colors shadow-lg"
          title="Ingrandisci per vedere meglio i dettagli"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
