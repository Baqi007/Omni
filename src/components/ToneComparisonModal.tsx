import React, { useState, useEffect } from 'react';
import { X, Layers, Copy, Check, Volume2, Sparkles, ArrowRight } from 'lucide-react';

interface ToneComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  targetLanguage: string;
  onSelectToneResult: (text: string, tone: string) => void;
}

interface ToneResultItem {
  tone: string;
  translatedText: string;
  nuanceNotes?: string;
}

export const ToneComparisonModal: React.FC<ToneComparisonModalProps> = ({
  isOpen,
  onClose,
  sourceText,
  targetLanguage,
  onSelectToneResult,
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ToneResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedTone, setCopiedTone] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sourceText.trim()) {
      fetchComparison();
    }
  }, [isOpen, sourceText, targetLanguage]);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compare-tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLanguage,
          tones: ['Natural/Idiomatic', 'Professional', 'Casual/Slang', 'Poetic/Literary'],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate comparison');
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not fetch tone comparison.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, tone: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTone(tone);
      setTimeout(() => setCopiedTone(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tone & Register Matrix</h3>
              <p className="text-xs text-slate-400">
                Comparing {targetLanguage} translations across 4 distinct registers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Text preview */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Original Input:
          </span>
          <span className="text-slate-200 font-medium italic">"{sourceText}"</span>
        </div>

        {/* Body content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-300">
                Synthesizing multi-tone cultural variants...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Adapting idioms, honorifics, and vocabulary for each register
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs text-center">
              {error}
              <button
                onClick={fetchComparison}
                className="block mx-auto mt-2 px-3 py-1 rounded bg-rose-900/50 hover:bg-rose-800 text-white font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {item.tone}
                      </span>
                      <button
                        onClick={() => handleCopy(item.translatedText, item.tone)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy text"
                      >
                        {copiedTone === item.tone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-sm font-medium text-slate-100 leading-relaxed my-2">
                      {item.translatedText}
                    </p>

                    {item.nuanceNotes && (
                      <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                        <span className="font-semibold text-slate-300">Nuance: </span>
                        {item.nuanceNotes}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        onSelectToneResult(item.translatedText, item.tone);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 transition-colors"
                    >
                      <span>Adopt this translation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
