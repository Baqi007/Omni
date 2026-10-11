import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { ToneSelector } from './components/ToneSelector.tsx';
import { SourceInputPane } from './components/SourceInputPane.tsx';
import { TranslationOutputPane } from './components/TranslationOutputPane.tsx';
import { ToneComparisonModal } from './components/ToneComparisonModal.tsx';
import { PresetsModal } from './components/PresetsModal.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { playPronunciation, stopPronunciation } from './utils/tts.ts';
import { TranslationResponse, HistoryItem } from './types.ts';
import { PresetPrompt, PRESET_PROMPTS } from './constants/presets.ts';
import { AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'omnitranslate_history_v1';

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('Auto-Detect');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [selectedTone, setSelectedTone] = useState('Natural/Idiomatic');
  const [culturalContext, setCulturalContext] = useState('');
  const [formality, setFormality] = useState('auto');

  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Modal states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist history:', e);
    }
  }, []);

  // Handle Translate
  const handleTranslate = async () => {
    if (!sourceText.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    stopPronunciation();
    setIsPlayingAudio(false);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLanguage,
          sourceLanguage,
          tone: selectedTone,
          context: culturalContext,
          formality,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Translation failed with status ${res.status}`);
      }

      const data: TranslationResponse = await res.json();
      setTranslationResult(data);

      // Create history entry
      const newItem: HistoryItem = {
        id: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        sourceText,
        sourceLanguage: data.detectedLanguage || sourceLanguage,
        targetLanguage,
        tone: selectedTone,
        context: culturalContext,
        result: data,
        isFavorite: false,
      };

      setActiveHistoryId(newItem.id);
      saveHistory([newItem, ...history.slice(0, 49)]); // keep up to 50 items
    } catch (err: any) {
      console.error('Translation error:', err);
      setErrorMessage(err?.message || 'Failed to complete translation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Language Swap
  const handleSwapLanguages = () => {
    if (sourceLanguage === 'Auto-Detect') return;
    const prevSource = sourceLanguage;
    const prevTarget = targetLanguage;
    setSourceLanguage(prevTarget);
    setTargetLanguage(prevSource);

    if (translationResult?.translatedText) {
      setSourceText(translationResult.translatedText);
      setTranslationResult(null);
    }
  };

  // Play audio
  const handlePlayTTS = (text: string) => {
    if (isPlayingAudio) {
      stopPronunciation();
      setIsPlayingAudio(false);
      return;
    }

    playPronunciation(
      text,
      targetLanguage,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  // Load a preset
  const handleLoadPreset = (preset: PresetPrompt) => {
    setSourceText(preset.text);
    setSourceLanguage(preset.sourceLang);
    setTargetLanguage(preset.targetLang);
    setSelectedTone(preset.tone);
    if (preset.context) {
      setCulturalContext(preset.context);
    }
  };

  // Toggle favorite for current or specified history item
  const handleToggleFavorite = (id?: string) => {
    const targetId = id || activeHistoryId;
    if (!targetId) return;

    const updated = history.map((item) =>
      item.id === targetId ? { ...item, isFavorite: !item.isFavorite } : item
    );
    saveHistory(updated);
  };

  const currentIsFavorite = history.find((h) => h.id === activeHistoryId)?.isFavorite;

  // Restore history item
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSourceText(item.sourceText);
    setSourceLanguage(item.sourceLanguage);
    setTargetLanguage(item.targetLanguage);
    setSelectedTone(item.tone);
    setTranslationResult(item.result);
    setActiveHistoryId(item.id);
    if (item.context) setCulturalContext(item.context);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    saveHistory([]);
    setActiveHistoryId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        historyCount={history.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="px-2 py-1 rounded bg-rose-900/40 hover:bg-rose-900/60 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tone & Persona Selector */}
        <section className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80 shadow-sm">
          <ToneSelector
            selectedTone={selectedTone}
            onSelectTone={(toneId) => {
              setSelectedTone(toneId);
            }}
          />
        </section>

        {/* Language Selection Header */}
        <section>
          <LanguageSelector
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSourceChange={(lang) => setSourceLanguage(lang)}
            onTargetChange={(lang) => setTargetLanguage(lang)}
            onSwap={handleSwapLanguages}
          />
        </section>

        {/* Split Panes: Source Input & Translation Output */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 items-stretch min-h-[460px]">
          {/* Left Pane: Source Input */}
          <SourceInputPane
            text={sourceText}
            onChangeText={setSourceText}
            onTranslate={handleTranslate}
            isLoading={isLoading}
            context={culturalContext}
            onChangeContext={setCulturalContext}
            formality={formality}
            onChangeFormality={setFormality}
            onLoadPreset={handleLoadPreset}
          />

          {/* Right Pane: Translation Output */}
          <TranslationOutputPane
            result={translationResult}
            isLoading={isLoading}
            targetLanguage={targetLanguage}
            onUseAlternative={(alt) => {
              if (translationResult) {
                setTranslationResult({
                  ...translationResult,
                  translatedText: alt,
                });
              }
            }}
            onPlayTTS={handlePlayTTS}
            isPlayingAudio={isPlayingAudio}
            onToggleFavorite={() => handleToggleFavorite()}
            isFavorite={currentIsFavorite}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">OmniTranslate AI</span>
            <span>· Structural accuracy, idiomatic fluency, and cultural awareness</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Automated Idiom Localization · Gemini 3.8 Flash Engine
          </div>
        </div>
      </footer>

      {/* Tone Comparison Modal */}
      <ToneComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        sourceText={sourceText || 'Break a leg out there tonight!'}
        targetLanguage={targetLanguage}
        onSelectToneResult={(text, tone) => {
          setSelectedTone(tone);
          if (translationResult) {
            setTranslationResult({
              ...translationResult,
              translatedText: text,
              toneApplied: tone,
            });
          }
        }}
      />

      {/* Preset Idiom Samples Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleLoadPreset}
      />

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onToggleFavorite={handleToggleFavorite}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
