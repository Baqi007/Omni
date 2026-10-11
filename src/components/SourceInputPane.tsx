import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Clipboard,
  Trash2,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PRESET_PROMPTS } from '../constants/presets.ts';

interface SourceInputPaneProps {
  text: string;
  onChangeText: (text: string) => void;
  onTranslate: () => void;
  isLoading: boolean;
  context: string;
  onChangeContext: (ctx: string) => void;
  formality: string;
  onChangeFormality: (formality: string) => void;
  onLoadPreset: (preset: (typeof PRESET_PROMPTS)[0]) => void;
}

export const SourceInputPane: React.FC<SourceInputPaneProps> = ({
  text,
  onChangeText,
  onTranslate,
  isLoading,
  context,
  onChangeContext,
  formality,
  onChangeFormality,
  onLoadPreset,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRec);
  }, []);

  const handleVoiceInput = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChangeText(text ? `${text} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        onChangeText(clipboardText);
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  const handleClear = () => {
    onChangeText('');
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-slate-800/80 shadow-lg overflow-hidden backdrop-blur-sm">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/70 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Source Text
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {wordCount} words · {charCount} chars
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {speechSupported && (
            <button
              onClick={handleVoiceInput}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice Dictation'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={handlePaste}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Paste from clipboard"
          >
            <Clipboard className="w-4 h-4" />
          </button>

          {text && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative flex-1 p-4 flex flex-col">
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              if (text.trim() && !isLoading) {
                onTranslate();
              }
            }
          }}
          placeholder="Enter text, idioms, slang, or phrases to translate... (e.g. 'Break a leg', 'Bite the bullet', 'Il pleut des cordes')"
          className="w-full flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base leading-relaxed resize-none focus:outline-none min-h-[170px]"
          autoFocus
        />

        {/* Quick Sample Idiom Chips when empty */}
        {!text && (
          <div className="mt-2 pt-3 border-t border-slate-800/40">
            <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Try an idiom or cultural test:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PROMPTS.slice(0, 4).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onLoadPreset(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/60 hover:bg-indigo-900/30 hover:border-indigo-500/40 border border-slate-800 text-slate-300 hover:text-indigo-200 transition-all text-left"
                >
                  <span className="font-medium text-indigo-300">"{preset.highlightedIdiom}"</span>
                  <span className="text-[10px] text-slate-500 ml-1.5">({preset.sourceLang})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Advanced Nuance & Audience Context */}
      <div className="border-t border-slate-800/60 bg-slate-950/30">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-2 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">Cultural Context & Formality Details</span>
            {context && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            )}
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showAdvanced && (
          <div className="px-4 pb-3 pt-1 space-y-2.5 border-t border-slate-800/40">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Audience / Cultural Scenario (Optional)
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => onChangeContext(e.target.value)}
                placeholder="e.g. Formal business proposal, friendly Discord chat, subtitle for TV show"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Formality Level (Grammatical Register)
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'auto', label: 'Auto (Recommended)' },
                  { id: 'formal', label: 'Formal (Vous / Sie / Usted / 敬語)' },
                  { id: 'informal', label: 'Informal (Tu / Du / Tú / タメ口)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onChangeFormality(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      formality === item.id
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pane Footer with Translate Trigger */}
      <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-[11px] text-slate-500 hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+Enter</kbd> to translate
        </div>

        <button
          onClick={onTranslate}
          disabled={!text.trim() || isLoading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Context & Translating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Translate with Cultural Awareness</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
