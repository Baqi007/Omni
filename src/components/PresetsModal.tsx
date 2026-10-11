import React, { useState } from 'react';
import { X, BookOpen, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { PRESET_PROMPTS, PresetPrompt } from '../constants/presets.ts';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetPrompt) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Classic Idiom', 'Business Idiom', 'Cultural Metaphor', 'Honorific & Philosophy', 'Modern Colloquial'];

  const filteredPresets =
    selectedCategory === 'All'
      ? PRESET_PROMPTS
      : PRESET_PROMPTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Idiom & Cultural Test Vault</h3>
              <p className="text-xs text-slate-400">
                Curated phrases to demonstrate non-literal translation and cultural context
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

        {/* Category Filter */}
        <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-950/30 flex items-center gap-1.5 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="group p-4 rounded-xl bg-slate-950/50 hover:bg-slate-850 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-cyan-300">
                    {preset.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {preset.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {preset.sourceLang} → {preset.targetLang} ({preset.tone})
                  </span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-2 italic">
                  "{preset.text}"
                </p>
                <div className="text-[11px] text-amber-400/90 font-medium">
                  ★ Target idiom to test: <span className="underline decoration-amber-500/50">{preset.highlightedIdiom}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Load preset</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
