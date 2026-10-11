import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, Check, ChevronDown, Search } from 'lucide-react';
import { LANGUAGES } from '../constants/languages.ts';
import { LanguageOption } from '../types.ts';

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  onSwap,
}) => {
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [searchSource, setSearchSource] = useState('');
  const [searchTarget, setSearchTarget] = useState('');

  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sourceRef.current && !sourceRef.current.contains(event.target as Node)) {
        setSourceDropdownOpen(false);
      }
      if (targetRef.current && !targetRef.current.contains(event.target as Node)) {
        setTargetDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSourceLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchSource.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchSource.toLowerCase())
  );

  const filteredTargetLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTarget.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchTarget.toLowerCase())
  );

  const currentTargetObj = LANGUAGES.find((l) => l.name === targetLanguage) || LANGUAGES[0];
  const currentSourceObj = LANGUAGES.find((l) => l.name === sourceLanguage);

  const commonTargets = ['Spanish', 'French', 'German', 'Japanese', 'English', 'Chinese (Simplified)'];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
      {/* Source Language Picker */}
      <div className="relative flex-1" ref={sourceRef}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSourceChange('Auto-Detect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sourceLanguage === 'Auto-Detect'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Auto-Detect
          </button>

          <button
            onClick={() => {
              setSourceDropdownOpen(!sourceDropdownOpen);
              setTargetDropdownOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              sourceLanguage !== 'Auto-Detect'
                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            {currentSourceObj ? (
              <>
                <span>{currentSourceObj.flag}</span>
                <span>{currentSourceObj.name}</span>
              </>
            ) : (
              <span>Select Language</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Source Dropdown Popover */}
        {sourceDropdownOpen && (
          <div className="absolute left-0 mt-2 w-72 max-h-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search source language..."
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-60 p-1 divide-y divide-slate-800/40">
              <button
                onClick={() => {
                  onSourceChange('Auto-Detect');
                  setSourceDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                  sourceLanguage === 'Auto-Detect'
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>✨ Auto-Detect Language</span>
                {sourceLanguage === 'Auto-Detect' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>

              {filteredSourceLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSourceChange(lang.name);
                    setSourceDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                    sourceLanguage === lang.name
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-[11px] text-slate-500">({lang.nativeName})</span>
                  </div>
                  {sourceLanguage === lang.name && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={onSwap}
          disabled={sourceLanguage === 'Auto-Detect'}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
          title={sourceLanguage === 'Auto-Detect' ? 'Select specific source language to swap' : 'Swap languages'}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      {/* Target Language Picker */}
      <div className="relative flex-1 flex items-center justify-end gap-1.5" ref={targetRef}>
        {/* Quick common target chips (visible on desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          {commonTargets.slice(0, 3).map((langName) => (
            <button
              key={langName}
              onClick={() => onTargetChange(langName)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                targetLanguage === langName
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {langName}
            </button>
          ))}
        </div>

        {/* Dropdown trigger */}
        <button
          onClick={() => {
            setTargetDropdownOpen(!targetDropdownOpen);
            setSourceDropdownOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950/60 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-all"
        >
          <span>{currentTargetObj.flag}</span>
          <span className="font-semibold text-white">{currentTargetObj.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Target Dropdown Popover */}
        {targetDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 max-h-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950 rounded-lg border border-slate-800">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search target language..."
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-60 p-1 divide-y divide-slate-800/40">
              {filteredTargetLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onTargetChange(lang.name);
                    setTargetDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                    targetLanguage === lang.name
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-[11px] text-slate-500">({lang.nativeName})</span>
                  </div>
                  {targetLanguage === lang.name && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
