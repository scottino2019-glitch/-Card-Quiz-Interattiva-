import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QUIZ_CARDS } from './data/quizCards';
import { LanguageMode, CardResult, QuizItem, QuizCardData } from './types';
import { CardHeader } from './components/CardHeader';
import { CardImage } from './components/CardImage';
import { QuizOptionsGrid } from './components/QuizOptionsGrid';
import { CardControls } from './components/CardControls';
import { ImageDetailModal } from './components/ImageDetailModal';
import { QuizResultsModal } from './components/QuizResultsModal';
import { CardEditorModal } from './components/CardEditorModal';
import { CardDeckManagerModal } from './components/CardDeckManagerModal';
import { CardExportModal } from './components/CardExportModal';
import { loadQuizCards, saveQuizCards, resetQuizCards } from './utils/storage';
import { soundManager } from './utils/audio';
import { Sparkles, CheckCircle2, RotateCcw, BookOpen, Layers, Plus, Edit3, Share2, Printer } from 'lucide-react';

export default function App() {
  const [cards, setCards] = useState<QuizCardData[]>(() => loadQuizCards());
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [selectedIdsByCard, setSelectedIdsByCard] = useState<Record<string, string[]>>({});
  const [verifiedByCard, setVerifiedByCard] = useState<Record<string, boolean>>({});
  const [resultsByCard, setResultsByCard] = useState<Record<string, CardResult>>({});
  const [languageMode, setLanguageMode] = useState<LanguageMode>('chinese');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [isResultsOpen, setIsResultsOpen] = useState<boolean>(false);
  const [selectedItemForExplanation, setSelectedItemForExplanation] = useState<QuizItem | null>(null);

  // Editor, Deck & Export modals
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<QuizCardData | null>(null);
  const [isDeckManagerOpen, setIsDeckManagerOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [exportTargetCard, setExportTargetCard] = useState<QuizCardData | null>(null);

  // Guard against out-of-range index
  const safeCardIndex = Math.min(currentCardIndex, Math.max(0, cards.length - 1));
  const currentCard = cards[safeCardIndex] || cards[0];
  const currentSelectedIds = selectedIdsByCard[currentCard.id] || [];
  const isCurrentCardVerified = verifiedByCard[currentCard.id] || false;
  const currentResult = resultsByCard[currentCard.id];

  // Toggle selection of an item on the current card
  const handleToggleItem = (itemId: string) => {
    if (isCurrentCardVerified) return; // Prevent changing after verification until reset

    const alreadySelected = currentSelectedIds.includes(itemId);
    let newSelected: string[];

    if (alreadySelected) {
      newSelected = currentSelectedIds.filter((id) => id !== itemId);
      soundManager.playUncheckSound();
    } else {
      newSelected = [...currentSelectedIds, itemId];
      soundManager.playCheckSound();
    }

    setSelectedIdsByCard((prev) => ({
      ...prev,
      [currentCard.id]: newSelected,
    }));
  };

  // Verify answers for current card
  const handleVerifyCurrentCard = () => {
    let score = 0;
    const maxScore = currentCard.items.length;

    currentCard.items.forEach((item) => {
      const isSelected = currentSelectedIds.includes(item.id);
      // Point for selecting items in the image, or leaving out items not in image
      if ((isSelected && item.inImage) || (!isSelected && !item.inImage)) {
        score += 1;
      }
    });

    const allCorrect = score === maxScore;
    if (allCorrect) {
      soundManager.playSuccessSound();
    } else {
      soundManager.playPartialSound();
    }

    const result: CardResult = {
      cardId: currentCard.id,
      selectedIds: currentSelectedIds,
      isVerified: true,
      score,
      maxScore,
      allCorrect,
    };

    setResultsByCard((prev) => ({ ...prev, [currentCard.id]: result }));
    setVerifiedByCard((prev) => ({ ...prev, [currentCard.id]: true }));
  };

  // Reset current card
  const handleResetCurrentCard = () => {
    setSelectedIdsByCard((prev) => ({
      ...prev,
      [currentCard.id]: [],
    }));
    setVerifiedByCard((prev) => ({
      ...prev,
      [currentCard.id]: false,
    }));
    setResultsByCard((prev) => {
      const updated = { ...prev };
      delete updated[currentCard.id];
      return updated;
    });
  };

  // Sound toggle
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundManager.setSoundEnabled(nextVal);
  };

  // Navigation between cards
  const handlePrevCard = () => {
    if (safeCardIndex > 0) {
      setCurrentCardIndex((idx) => idx - 1);
    }
  };

  const handleNextCard = () => {
    if (safeCardIndex < cards.length - 1) {
      setCurrentCardIndex((idx) => idx + 1);
    }
  };

  const handleSelectCard = (index: number) => {
    setCurrentCardIndex(index);
  };

  const handleFinishQuiz = () => {
    setIsResultsOpen(true);
  };

  const handleRestartEntireQuiz = () => {
    setSelectedIdsByCard({});
    setVerifiedByCard({});
    setResultsByCard({});
    setCurrentCardIndex(0);
    setIsResultsOpen(false);
  };

  // Card Management Actions
  const handleOpenCreateCard = () => {
    setEditingCard(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditCard = (card?: QuizCardData) => {
    setEditingCard(card || currentCard);
    setIsEditorOpen(true);
  };

  const handleSaveCard = (savedCard: QuizCardData) => {
    const existingIndex = cards.findIndex((c) => c.id === savedCard.id);
    let updatedCards: QuizCardData[];

    if (existingIndex >= 0) {
      // Edit existing card
      updatedCards = [...cards];
      updatedCards[existingIndex] = savedCard;
    } else {
      // Add new card
      updatedCards = [...cards, savedCard];
      // Jump to newly created card
      setCurrentCardIndex(updatedCards.length - 1);
    }

    setCards(updatedCards);
    saveQuizCards(updatedCards);

    // Reset verification for this card
    setSelectedIdsByCard((prev) => ({ ...prev, [savedCard.id]: [] }));
    setVerifiedByCard((prev) => ({ ...prev, [savedCard.id]: false }));
    setResultsByCard((prev) => {
      const copy = { ...prev };
      delete copy[savedCard.id];
      return copy;
    });
  };

  const handleDeleteCard = (cardId: string) => {
    if (cards.length <= 1) return; // Keep at least one card
    const updatedCards = cards.filter((c) => c.id !== cardId).map((c, i) => ({
      ...c,
      cardNumber: i + 1,
    }));
    setCards(updatedCards);
    saveQuizCards(updatedCards);
    setCurrentCardIndex((prev) => Math.max(0, Math.min(prev, updatedCards.length - 1)));
  };

  const handleDuplicateCard = (cardToDup: QuizCardData) => {
    const newCard: QuizCardData = {
      ...cardToDup,
      id: `custom-card-${Date.now()}`,
      cardNumber: cards.length + 1,
      titleIt: `${cardToDup.titleIt} (Copia)`,
      titleZh: cardToDup.titleZh,
      items: JSON.parse(JSON.stringify(cardToDup.items)),
    };
    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    saveQuizCards(updatedCards);
    setCurrentCardIndex(updatedCards.length - 1);
  };

  const handleResetDefaults = () => {
    const defaultDeck = resetQuizCards();
    setCards(defaultDeck);
    setCurrentCardIndex(0);
    setSelectedIdsByCard({});
    setVerifiedByCard({});
    setResultsByCard({});
  };

  // Export & Print Actions
  const handleOpenExport = (card?: QuizCardData) => {
    setExportTargetCard(card || currentCard);
    setIsExportOpen(true);
  };

  const handleImportCards = (importedList: QuizCardData[]) => {
    const validCards = importedList.filter((c) => c && c.items && c.titleZh);
    if (validCards.length === 0) return;

    const newCards = [...cards];
    validCards.forEach((imp) => {
      const existingIdx = newCards.findIndex((c) => c.id === imp.id);
      if (existingIdx >= 0) {
        newCards[existingIdx] = imp;
      } else {
        newCards.push({
          ...imp,
          id: imp.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          cardNumber: newCards.length + 1,
        });
      }
    });

    const reindexed = newCards.map((c, i) => ({ ...c, cardNumber: i + 1 }));
    setCards(reindexed);
    saveQuizCards(reindexed);
  };

  // Card stats
  const correctCount = currentResult ? currentResult.score : 0;
  const isAllCorrect = currentResult ? currentResult.allCorrect : false;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Immersive Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-0" />

      {/* App Top Branding Banner & Card Switcher */}
      <div className="w-full max-w-xl flex items-center justify-between px-2 mb-3 text-slate-300 relative z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-serif font-black shadow-lg shadow-indigo-500/25 border border-white/20">
            捉
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none flex items-center gap-1.5">
              <span>Card Quiz Interattiva</span>
            </h1>
            <p className="text-[11px] text-indigo-300/80 font-medium mt-0.5">
              Caccia ai Caratteri & Osservazione Visiva
            </p>
          </div>
        </div>

        {/* Quick card badges & creator actions */}
        <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md p-1 rounded-xl border border-slate-800/80">
          {cards.map((c, idx) => {
            const isCompleted = verifiedByCard[c.id];
            const isPerf = resultsByCard[c.id]?.allCorrect;
            const isCurrent = idx === safeCardIndex;
            return (
              <button
                key={`badge-${c.id}`}
                onClick={() => handleSelectCard(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : isCompleted
                    ? isPerf
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={`Scheda ${idx + 1}: ${c.titleIt}`}
              >
                {idx + 1}
              </button>
            );
          })}

          {/* New Card Action Button */}
          <button
            id="top-add-card-btn"
            onClick={handleOpenCreateCard}
            className="w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-400/30 shadow-sm"
            title="Crea nuova scheda didattica"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* Deck Manager Button */}
          <button
            id="top-deck-manager-btn"
            onClick={() => setIsDeckManagerOpen(true)}
            className="w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80"
            title="Tutte le schede (Gestione)"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Export & Print Button */}
          <button
            id="top-export-btn"
            onClick={() => handleOpenExport(currentCard)}
            className="w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center bg-emerald-600/80 hover:bg-emerald-500 text-white border border-emerald-400/30 shadow-sm"
            title="Esporta o Stampa Schede Didattiche (PDF / JSON)"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Physical Card Canvas */}
      <main className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full bg-slate-900/70 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 shadow-2xl border border-slate-800/90 ring-1 ring-white/10 flex flex-col items-center relative overflow-hidden"
          >
            {/* Top Card Header with Edit, Add & Export triggers */}
            <CardHeader
              titleZh={currentCard.titleZh}
              titleIt={currentCard.titleIt}
              titleEn={currentCard.titleEn}
              instructionZh={currentCard.instructionZh}
              instructionIt={currentCard.instructionIt}
              instructionEn={currentCard.instructionEn}
              currentCardIndex={safeCardIndex}
              totalCards={cards.length}
              languageMode={languageMode}
              onLanguageChange={setLanguageMode}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              showHints={showHints}
              onToggleHints={() => setShowHints(!showHints)}
              onPrevCard={handlePrevCard}
              onNextCard={handleNextCard}
              canGoPrev={safeCardIndex > 0}
              canGoNext={safeCardIndex < cards.length - 1}
              onEditCard={() => handleOpenEditCard(currentCard)}
              onCreateCard={handleOpenCreateCard}
              onOpenDeckManager={() => setIsDeckManagerOpen(true)}
              onExportCard={() => handleOpenExport(currentCard)}
            />

            {/* Central Quiz Illustration */}
            <div className="w-full mt-3">
              <CardImage
                imageSrc={currentCard.imageSrc}
                altText={currentCard.titleIt}
                items={currentCard.items}
                showHints={showHints}
                onOpenZoom={() => setIsZoomOpen(true)}
              />
            </div>

            {/* The 2x4 Character/Word Selection Grid */}
            <QuizOptionsGrid
              items={currentCard.items}
              selectedIds={currentSelectedIds}
              isVerified={isCurrentCardVerified}
              languageMode={languageMode}
              onToggleItem={handleToggleItem}
              onSelectItemForExplanation={(it) => {
                setSelectedItemForExplanation(it);
                setIsZoomOpen(true);
              }}
            />

            {/* Card Controls & Results Summary */}
            <CardControls
              isVerified={isCurrentCardVerified}
              selectedCount={currentSelectedIds.length}
              correctCount={correctCount}
              totalItems={currentCard.items.length}
              isAllCorrect={isAllCorrect}
              items={currentCard.items}
              selectedIds={currentSelectedIds}
              languageMode={languageMode}
              onVerify={handleVerifyCurrentCard}
              onReset={handleResetCurrentCard}
              onNext={handleNextCard}
              onPrev={handlePrevCard}
              canGoNext={safeCardIndex < cards.length - 1}
              canGoPrev={safeCardIndex > 0}
              isLastCard={safeCardIndex === cards.length - 1}
              onFinishQuiz={handleFinishQuiz}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom card navigation dots & help instructions with Edit shortcut */}
        <div className="mt-4 flex flex-col items-center text-center gap-2 px-2">
          <div className="flex items-center gap-3 text-xs font-semibold text-indigo-300/90 flex-wrap justify-center">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tocca un riquadro per la spunta (✓) e l'altoparlante per la pronuncia</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <button
              id="edit-this-card-footer-btn"
              onClick={() => handleOpenEditCard(currentCard)}
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Modifica questa scheda</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 max-w-md">
            Ispirato alle schede didattiche di osservazione per bambini: puoi risolvere i quiz, modificare i vocaboli o creare schede personalizzate con le tue immagini!
          </p>
        </div>
      </main>

      {/* Image Detail & Zoom Lightbox Modal */}
      <ImageDetailModal
        isOpen={isZoomOpen}
        onClose={() => {
          setIsZoomOpen(false);
          setSelectedItemForExplanation(null);
        }}
        imageSrc={currentCard.imageSrc}
        title={currentCard.titleIt}
        items={currentCard.items}
        selectedItem={selectedItemForExplanation}
        languageMode={languageMode}
      />

      {/* Quiz Completion & Results Modal */}
      <QuizResultsModal
        isOpen={isResultsOpen}
        onRestart={handleRestartEntireQuiz}
        results={resultsByCard}
        cards={cards}
      />

      {/* Card Creation & Modification Editor Modal */}
      <CardEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        initialCard={editingCard}
        totalCardsCount={cards.length}
      />

      {/* Deck Overview & Management Modal */}
      <CardDeckManagerModal
        isOpen={isDeckManagerOpen}
        onClose={() => setIsDeckManagerOpen(false)}
        cards={cards}
        currentCardIndex={safeCardIndex}
        onSelectCard={handleSelectCard}
        onCreateNew={handleOpenCreateCard}
        onEditCard={handleOpenEditCard}
        onDuplicateCard={handleDuplicateCard}
        onDeleteCard={handleDeleteCard}
        onResetDefaults={handleResetDefaults}
        onOpenExport={(card) => handleOpenExport(card || currentCard)}
      />

      {/* Export & Printable Worksheet Modal */}
      <CardExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentCard={exportTargetCard || currentCard}
        allCards={cards}
        onImportCards={handleImportCards}
      />
    </div>
  );
}

