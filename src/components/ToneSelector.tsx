import React from 'react';
import {
  Sparkles,
  Briefcase,
  Smile,
  Feather,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { TONE_OPTIONS } from '../constants/languages.ts';
import { ToneOption } from '../types.ts';

interface ToneSelectorProps {
  selectedTone: string;
  onSelectTone: (toneId: string) => void;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onSelectTone,
}) => {
  const getIcon = (name: string, isSelected: boolean) => {
    const cls = `w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`;
    switch (name) {
      case 'Sparkles':
        return <Sparkles className={cls} />;
      case 'Briefcase':
        return <Briefcase className={cls} />;
      case 'MessageSquareSmile':
        return <Smile className={cls} />;
      case 'Feather':
        return <Feather className={cls} />;
      case 'ShieldCheck':
        return <ShieldCheck className={cls} />;
      case 'Cpu':
        return <Cpu className={cls} />;
      default:
        return <Sparkles className={cls} />;
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>Target Tone & Register</span>
          <span className="text-[10px] lowercase text-slate-500 font-normal">
            (Idiom adaptation adapts to selected tone)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {TONE_OPTIONS.map((tone: ToneOption) => {
          const isSelected = selectedTone === tone.id;
          return (
            <button
              key={tone.id}
              onClick={() => onSelectTone(tone.id)}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all relative ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500/60 shadow-sm shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {getIcon(tone.iconName, isSelected)}
                </div>
                {tone.id === 'Natural/Idiomatic' && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Default
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-medium truncate ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}
              >
                {tone.label}
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {tone.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
