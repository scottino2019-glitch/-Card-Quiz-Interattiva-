import React, { useState, useRef } from 'react';
import { QuizCardData } from '../types';
import {
  X,
  Printer,
  Download,
  Upload,
  FileJson,
  Share2,
  Check,
  Copy,
  FileText,
  Sparkles,
  Info,
  CheckCircle2,
  Code2,
  Globe,
  ExternalLink,
} from 'lucide-react';
import {
  generateStandaloneCardHtml,
  generateStandaloneDeckHtml,
  generateEmbedIframeCode,
  downloadTextAsFile,
} from '../utils/htmlExport';

interface CardExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCard: QuizCardData;
  allCards: QuizCardData[];
  onImportCards: (importedCards: QuizCardData[]) => void;
}

export const CardExportModal: React.FC<CardExportModalProps> = ({
  isOpen,
  onClose,
  currentCard,
  allCards,
  onImportCards,
}) => {
  const [activeTab, setActiveTab] = useState<'worksheet' | 'html' | 'json' | 'app'>('html');
  const [includePinyin, setIncludePinyin] = useState<boolean>(true);
  const [includeTranslation, setIncludeTranslation] = useState<boolean>(true);
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedEmbed, setCopiedEmbed] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Print worksheet
  const handlePrint = () => {
    window.print();
  };

  // Standalone HTML Exports
  const handleDownloadCardHtml = () => {
    const html = generateStandaloneCardHtml(currentCard);
    const filename = `scheda-quiz-${currentCard.cardNumber}-${currentCard.titleIt.toLowerCase().replace(/\s+/g, '-')}.html`;
    downloadTextAsFile(html, filename);
  };

  const handleDownloadDeckHtml = () => {
    const html = generateStandaloneDeckHtml(allCards);
    const filename = `mazzo-schede-quiz-${allCards.length}-schede.html`;
    downloadTextAsFile(html, filename);
  };

  const handlePreviewCardHtml = () => {
    const html = generateStandaloneCardHtml(currentCard);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleCopyEmbed = () => {
    const embedCode = generateEmbedIframeCode(window.location.href);
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  // Download single card as JSON
  const handleDownloadSingleCard = () => {
    const filename = `scheda-quiz-${currentCard.cardNumber}-${currentCard.titleIt.toLowerCase().replace(/\s+/g, '-')}.json`;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentCard, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download entire deck as JSON
  const handleDownloadAllCards = () => {
    const filename = `mazzo-schede-quiz-cinese-${allCards.length}-schede.json`;
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      totalCards: allCards.length,
      cards: allCards,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy card text to clipboard
  const handleCopyCardText = () => {
    const lines = [
      `Scheda #${currentCard.cardNumber}: ${currentCard.titleZh} (${currentCard.titleIt})`,
      `Istruzione: ${currentCard.instructionIt}`,
      '',
      'VOCABOLI:',
      ...currentCard.items.map((it, idx) => 
        `${idx + 1}. ${it.character} [${it.pinyin}] - ${it.italian} (Presente nel disegno: ${it.inImage ? 'SÌ' : 'NO'})`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Handle JSON Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let importedList: QuizCardData[] = [];

        if (Array.isArray(parsed)) {
          importedList = parsed;
        } else if (parsed && Array.isArray(parsed.cards)) {
          importedList = parsed.cards;
        } else if (parsed && parsed.id && parsed.items && parsed.titleZh) {
          // Single card imported
          importedList = [parsed];
        } else {
          throw new Error('Il file JSON non contiene schede quiz nel formato atteso.');
        }

        if (importedList.length === 0) {
          throw new Error('Nessuna scheda trovata nel file.');
        }

        onImportCards(importedList);
        setImportSuccess(`Importate con successo ${importedList.length} schede!`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'File JSON non valido.';
        setImportError(errorMsg);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 print:hidden"
      >
        <div className="relative w-full max-w-3xl bg-slate-900/95 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-800 ring-1 ring-white/10 text-slate-100">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 border border-white/20">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  Esporta per Siti Web, Stampa & Backup
                </h2>
                <p className="text-xs text-emerald-300/80">
                  Esporta in HTML autonomo per qualsiasi sito, stampa schede A4 o scarica in JSON
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 px-5 pt-2 bg-slate-950/40 gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('html')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'html'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>HTML per Siti Web (File & Iframe)</span>
            </button>

            <button
              onClick={() => setActiveTab('worksheet')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'worksheet'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Scheda Didattica (PDF / Stampa)</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'json'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Backup & Condivisione JSON</span>
            </button>

            <button
              onClick={() => setActiveTab('app')}
              className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'app'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Esporta Codice App</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {/* TAB: HTML EXPORT (FOR WEBSITES) */}
            {activeTab === 'html' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Esporta in HTML Autonomo (Nessuna dipendenza o installazione richiesta)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Scarica un singolo file <strong>.html</strong> pronto e completo: include la grafica della scheda, le opzioni interattive, la verifica con punteggio e persino la <strong>sintesi vocale cinese</strong> (Web Speech API). Puoi caricarlo su <strong>WordPress, Google Sites, Wix, Moodle, Notion</strong> o su qualsiasi server web.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Single Card HTML */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-2">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        File HTML Scheda Singola
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Esporta solo la scheda corrente (#{currentCard.cardNumber}: {currentCard.titleIt}) in un file .html leggero da incorporare.
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleDownloadCardHtml}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Scarica .HTML</span>
                      </button>
                      <button
                        onClick={handlePreviewCardHtml}
                        className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center border border-slate-700"
                        title="Anteprima rapida in nuova scheda"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Option 2: Full Deck HTML */}
                  <div className="p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center mb-2">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        File HTML Mazzo Completo ({allCards.length} Schede)
                      </h4>
                      <p className="text-xs text-slate-300/80 mt-1">
                        Un unico file .html contenente tutte le schede con pulsanti di navigazione per scorrere tra le lezioni.
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadDeckHtml}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/25 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Scarica Mazzo (.HTML)</span>
                    </button>
                  </div>
                </div>

                {/* Option 3: Embed Iframe Code */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-emerald-400" />
                        <span>Codice Embed Iframe per Siti Web & Blog</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Incolla questo codice nel tuo CMS (WordPress, Wix, Google Sites, Webflow) per mostrare l'app interattiva nella tua pagina:
                      </p>
                    </div>
                    <button
                      onClick={handleCopyEmbed}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedEmbed ? 'Copiato!' : 'Copia Codice Embed'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto select-all">
                      {generateEmbedIframeCode(window.location.href)}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <strong className="text-slate-200 block mb-0.5">WordPress:</strong>
                      Aggiungi un blocco <em>"HTML personalizzato"</em> e incolla il codice.
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <strong className="text-slate-200 block mb-0.5">Google Sites:</strong>
                      Fai clic su <em>"Inserisci" &gt; "Incorpora" &gt; "Codice"</em> e incolla.
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <strong className="text-slate-200 block mb-0.5">Wix / Squarespace:</strong>
                      Aggiungi l'elemento <em>"Incorpora HTML / Iframe"</em>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: WORKSHEET & PRINT */}
            {activeTab === 'worksheet' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Scheda Didattica Formato A4</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Pronta da stampare
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Perfetta per verifiche in classe, compiti o studio su carta con quadratini di spunta e riga per scrivere.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Stampa / Salva in PDF</span>
                    </button>
                  </div>
                </div>

                {/* Print Options */}
                <div className="flex flex-wrap gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">Opzioni di stampa:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includePinyin}
                      onChange={(e) => setIncludePinyin(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Mostra Pinyin</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeTranslation}
                      onChange={(e) => setIncludeTranslation(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Mostra Traduzione</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeAnswerKey}
                      onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Includi Chiave Soluzioni in calce</span>
                  </label>
                </div>

                {/* Printable Worksheet Preview (Styled like paper) */}
                <div className="border border-slate-700/80 rounded-2xl p-4 sm:p-6 bg-white text-slate-900 shadow-inner overflow-hidden">
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-2 mb-3">
                    <div>
                      <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Scheda Didattica di Osservazione #{currentCard.cardNumber}
                      </div>
                      <h2 className="text-2xl font-black text-slate-950 font-serif">
                        {currentCard.titleZh} • {currentCard.titleIt}
                      </h2>
                      <p className="text-xs text-slate-600 italic">
                        {currentCard.instructionIt}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-600 border border-slate-300 rounded-lg p-2 bg-slate-50">
                      <div>Nome: _________________</div>
                      <div className="mt-1">Data: ____/____/________</div>
                      <div className="mt-1">Punteggio: _____ / 8</div>
                    </div>
                  </div>

                  {/* Thumbnail and Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="rounded-xl overflow-hidden border-2 border-slate-300 aspect-[4/3] bg-slate-100 flex items-center justify-center">
                      <img
                        src={currentCard.imageSrc}
                        alt={currentCard.titleIt}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* 8 Character Cards for Worksheet */}
                    <div className="grid grid-cols-2 gap-2">
                      {currentCard.items.map((it, idx) => (
                        <div
                          key={it.id}
                          className="border-2 border-slate-300 rounded-xl p-2 flex items-center justify-between bg-slate-50/60"
                        >
                          <div>
                            <div className="text-2xl font-serif font-black text-slate-950 leading-none">
                              {it.character}
                            </div>
                            {includePinyin && (
                              <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                                {it.pinyin}
                              </div>
                            )}
                            {includeTranslation && (
                              <div className="text-[10px] text-slate-600">
                                {it.italian}
                              </div>
                            )}
                          </div>
                          {/* Student checkbox */}
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-6 h-6 rounded-lg border-2 border-slate-400 flex items-center justify-center text-xs font-bold text-slate-400">
                              {idx + 1}
                            </div>
                            <span className="text-[9px] text-slate-400 mt-0.5">Spunta</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Answer Key Footer if enabled */}
                  {includeAnswerKey && (
                    <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>
                        <strong>Soluzioni: </strong>
                        Presenti nel disegno: {currentCard.items.filter(i => i.inImage).map(i => i.character).join(', ')}
                        {' '}({currentCard.items.filter(i => i.inImage).length}/8)
                      </span>
                      <span>Card Quiz Interattiva - Stampa A4</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: JSON BACKUP & IMPORT/EXPORT */}
            {activeTab === 'json' && (
              <div className="space-y-4">
                {/* Feedback notifications */}
                {importSuccess && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{importSuccess}</span>
                  </div>
                )}
                {importError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Download current card */}
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Scarica Scheda Corrente
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Salva solo la scheda attiva (#{currentCard.cardNumber}: {currentCard.titleIt}) in un file JSON.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadSingleCard}
                      className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Scarica Scheda ({currentCard.titleIt})</span>
                    </button>
                  </div>

                  {/* Download entire deck */}
                  <div className="p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/40 text-indigo-300 flex items-center justify-center mb-2">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Scarica Tutto il Mazzo ({allCards.length} Schede)
                      </h4>
                      <p className="text-xs text-slate-300/80 mt-1">
                        Crea un backup completo di tutte le schede e le tue creazioni personali in un unico file JSON.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadAllCards}
                      className="mt-4 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Scarica Mazzo Completo (.json)</span>
                    </button>
                  </div>
                </div>

                {/* Import cards section */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>Importa Schede da File JSON</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Carica un file JSON precedentemente esportato per aggiungere o ripristinare le schede.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Copy Text Summary */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Copia Vocabolario Scheda negli Appunti
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Copia elenco testo formattato (carattere, pinyin, traduzione, presenza)
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCardText}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedText ? 'Copiato!' : 'Copia Testo'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: APP EXPORT GUIDELINES */}
            {activeTab === 'app' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Come Esportare l'Intera Applicazione
                      </h4>
                      <p className="text-xs text-slate-400">
                        In Google AI Studio puoi esportare e distribuire liberamente il progetto:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-bold text-indigo-300 mb-1">
                        1. Scarica Archivio ZIP
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Nel menu in alto a destra di Google AI Studio, fai clic sui tre puntini o su <strong>Settings/Export</strong> per scaricare l'intero codice sorgente in formato .ZIP.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-bold text-indigo-300 mb-1">
                        2. Esporta su GitHub
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Puoi sincronizzare il repository direttamente con il tuo account GitHub per versionare e clonare l'app in locale.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-bold text-indigo-300 mb-1">
                        3. Condividi Link
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Usa il pulsante <strong>Share</strong> in alto a destra per ottenere un link pubblico dell'app giocabile da qualsiasi browser o tablet!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Scheda attiva: <strong className="text-white">{currentCard.titleIt}</strong> (#{currentCard.cardNumber})
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>

      {/* Hidden container for Clean Print Output */}
      <div id="printable-worksheet" className="hidden print:block text-slate-900 bg-white p-6 font-sans">
        {/* Printable Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Scheda Didattica di Osservazione & Vocabolario #{currentCard.cardNumber}
            </div>
            <h1 className="text-3xl font-black text-slate-950 font-serif mt-1">
              {currentCard.titleZh} • {currentCard.titleIt}
            </h1>
            <p className="text-sm text-slate-700 italic mt-0.5">
              {currentCard.instructionIt}
            </p>
          </div>
          <div className="text-right text-xs text-slate-700 border-2 border-slate-300 rounded-xl p-3 bg-slate-50 min-w-[200px]">
            <div className="font-semibold">Nome: _______________________</div>
            <div className="mt-2 font-semibold">Data: _____ / _____ / _________</div>
            <div className="mt-2 font-semibold">Punteggio: ________ / 8</div>
          </div>
        </div>

        {/* Printable Visual & Questions */}
        <div className="grid grid-cols-2 gap-6 my-4 items-start">
          {/* Main Image */}
          <div className="border-2 border-slate-400 rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 flex items-center justify-center">
            <img
              src={currentCard.imageSrc}
              alt={currentCard.titleIt}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>

          {/* 8 Question Boxes */}
          <div className="grid grid-cols-2 gap-3">
            {currentCard.items.map((it, idx) => (
              <div
                key={it.id}
                className="border-2 border-slate-300 rounded-xl p-2.5 flex items-center justify-between bg-slate-50/50"
              >
                <div>
                  <div className="text-3xl font-serif font-black text-slate-950 leading-none">
                    {it.character}
                  </div>
                  {includePinyin && (
                    <div className="text-xs font-bold text-indigo-800 mt-1">
                      {it.pinyin}
                    </div>
                  )}
                  {includeTranslation && (
                    <div className="text-xs text-slate-600 mt-0.5">
                      {it.italian}
                    </div>
                  )}
                </div>

                {/* Box to check */}
                <div className="flex flex-col items-center justify-center pl-2">
                  <div className="w-7 h-7 rounded-lg border-2 border-slate-600 flex items-center justify-center font-bold text-xs text-slate-400">
                    {idx + 1}
                  </div>
                  <span className="text-[8px] text-slate-500 mt-0.5 uppercase tracking-wider">C'è?</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Task Directions */}
        <div className="my-4 p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-700">
          <strong>Istruzioni per l'alunno:</strong> Osserva attentamente l'illustrazione a sinistra. Segna con una spunta (✓) nella casella numerata solo i caratteri/oggetti che riesci a individuare nel disegno. Lascia vuoti gli altri!
        </div>

        {/* Answer Key Footer */}
        {includeAnswerKey && (
          <div className="mt-6 pt-3 border-t-2 border-dashed border-slate-300 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Chiave delle risposte: </strong>
              Presenti nel disegno: {currentCard.items.filter(i => i.inImage).map(i => `${i.character} (${i.italian})`).join(', ')}
            </span>
            <span>Card Quiz Interattiva</span>
          </div>
        )}
      </div>
    </>
  );
};

