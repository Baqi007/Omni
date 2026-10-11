import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  BookMarked,
  RotateCcw,
  Code,
  ArrowRight,
  Info,
  Lightbulb,
} from 'lucide-react';
import { TranslationResponse } from '../types.ts';

interface TranslationOutputPaneProps {
  result: TranslationResponse | null;
  isLoading: boolean;
  targetLanguage: string;
  onUseAlternative: (alt: string) => void;
  onPlayTTS: (text: string) => void;
  isPlayingAudio: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export const TranslationOutputPane: React.FC<TranslationOutputPaneProps> = ({
  result,
  isLoading,
  targetLanguage,
  onUseAlternative,
  onPlayTTS,
  isPlayingAudio,
  onToggleFavorite,
  isFavorite,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);

  const handleCopyText = async () => {
    if (!result?.translatedText) return;
    try {
      await navigator.clipboard.writeText(result.translatedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleCopyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (e) {
      console.error('Copy JSON failed:', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-lg overflow-hidden backdrop-blur-sm">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/70 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Translation Output
          </span>

          {result && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                Detected: {result.detectedLanguage}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                Tone: {result.toneApplied}
              </span>
            </div>
          )}
        </div>

        {/* Action icons */}
        {result && (
          <div className="flex items-center gap-1">
            {/* Native Audio Playback */}
            <button
              onClick={() => onPlayTTS(result.translatedText)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isPlayingAudio
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isPlayingAudio ? 'Playing speech...' : 'Listen to pronunciation'}
            >
              {isPlayingAudio ? <Volume2 className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Toggle JSON raw view */}
            <button
              onClick={() => setShowJsonView(!showJsonView)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                showJsonView
                  ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Toggle JSON Output format"
            >
              <Code className="w-4 h-4" />
            </button>

            {/* Copy JSON */}
            <button
              onClick={handleCopyJson}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy OmniTranslate JSON format"
            >
              {copiedJson ? (
                <span className="text-[10px] text-emerald-400 font-semibold px-1">JSON Copied!</span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 px-1 border border-slate-700 rounded">
                  {'{}'}
                </span>
              )}
            </button>

            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy translated text"
            >
              {copiedText ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Bookmark Favorite */}
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isFavorite
                    ? 'text-amber-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Bookmark translation"
              >
                <BookMarked className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3 py-6 animate-pulse">
            <div className="h-6 bg-slate-800/70 rounded-lg w-3/4"></div>
            <div className="h-6 bg-slate-800/50 rounded-lg w-5/6"></div>
            <div className="h-6 bg-slate-800/40 rounded-lg w-1/2"></div>
            <div className="pt-6 space-y-2">
              <div className="h-4 bg-slate-800/30 rounded w-1/3"></div>
              <div className="h-16 bg-slate-800/20 rounded-xl"></div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !result && (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-3 text-slate-400">
              <Sparkles className="w-6 h-6 text-indigo-400/80" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300">Awaiting Input</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Enter any sentence or choose an idiom preset. OmniTranslate will automatically localize cultural nuance and idioms.
            </p>
          </div>
        )}

        {/* Translated Text Display */}
        {!isLoading && result && (
          <>
            {showJsonView ? (
              /* JSON View */
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            ) : (
              /* Normal Polished View */
              <div className="min-h-[90px]">
                <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed tracking-wide select-text">
                  {result.translatedText}
                </p>
              </div>
            )}

            {/* Idioms and Cultural Context Breakdown */}
            {result.idiomsAndContext && result.idiomsAndContext.length > 0 && (
              <div className="pt-3 border-t border-slate-800/70">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    ★
                  </span>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Idioms & Cultural Nuance Localized ({result.idiomsAndContext.length})
                  </h5>
                </div>

                <div className="space-y-2.5">
                  {result.idiomsAndContext.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-200 line-through decoration-amber-500/40">
                          "{item.original}"
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          "{item.translation}"
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] pl-1 border-l-2 border-amber-500/40">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Phrases */}
            {result.alternativePhrases && result.alternativePhrases.length > 0 && (
              <div className="pt-3 border-t border-slate-800/70">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Alternative Phrasings
                  </h5>
                </div>

                <div className="space-y-1.5">
                  {result.alternativePhrases.map((alt, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 transition-colors"
                    >
                      <span className="text-xs text-slate-200 select-text flex-1 pr-2">
                        "{alt}"
                      </span>
                      <button
                        onClick={() => onUseAlternative(alt)}
                        className="text-[10px] font-medium text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 transition-colors opacity-80 group-hover:opacity-100 shrink-0"
                        title="Swap into primary translation"
                      >
                        Use this
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pane Footer */}
      {result && (
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3 text-indigo-400" />
            <span>Non-literal cultural equivalence verified</span>
          </div>
          <span className="font-mono text-[10px]">Strict JSON compliant</span>
        </div>
      )}
    </div>
  );
};
