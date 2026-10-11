import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  Search,
  Star,
  Download,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { HistoryItem } from '../types.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onToggleFavorite,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.translatedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetLanguage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = onlyFavorites ? item.isFavorite : true;
    return matchesSearch && matchesFavorite;
  });

  const exportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `omnitranslate_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Translation History</h3>
              <span className="text-xs text-slate-500 font-mono">({history.length})</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/30 space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                  onlyFavorites
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>Favorites</span>
              </button>

              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <>
                    <button
                      onClick={exportHistory}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Export history as JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onClearHistory}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Clear all history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-xs">No translation history found.</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/80 transition-all flex flex-col gap-2 group"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-indigo-300">
                      {item.sourceLanguage} → {item.targetLanguage}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                          item.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHistoryItem(item.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-normal line-clamp-2 italic">
                    "{item.sourceText}"
                  </p>

                  <p className="text-xs text-slate-100 font-medium line-clamp-2">
                    {item.result.translatedText}
                  </p>

                  {item.result.idiomsAndContext && item.result.idiomsAndContext.length > 0 && (
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      ★ {item.result.idiomsAndContext.length} idiom(s) localized
                    </span>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                    <button
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <span>Load into workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
