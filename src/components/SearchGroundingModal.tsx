import React, { useState, useEffect } from 'react';
import { Search, X, ExternalLink, BookOpen, Wrench, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { GroundingSource, Language } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appliance: string;
  modelNumber?: string;
  problemSummary: string;
  language: Language;
}

export const SearchGroundingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  appliance,
  modelNumber,
  problemSummary,
  language
}) => {
  const t = getTranslation(language);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<string>('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchManualsAndParts();
    }
  }, [isOpen]);

  const fetchManualsAndParts = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/search-manuals-parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appliance,
          modelNumber,
          problem: problemSummary,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve search grounded results');
      }

      const data = await response.json();
      setSummary(data.summary || '');
      setSources(data.sources || []);
    } catch (err: unknown) {
      console.error('Grounding search error:', err);
      setErrorMessage(
        'Could not complete live Google search grounding right now. Please check your network or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                {t.findManualParts}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {appliance} {modelNumber ? `• ${modelNumber}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="font-bold text-sm text-stone-800 dark:text-stone-200">
                {t.searchingGrounding}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Querying Google Search grounding for official manuals & parts in India...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold">Search Notice</p>
                <p className="mt-1">{errorMessage}</p>
                <button
                  onClick={fetchManualsAndParts}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs"
                >
                  Retry Search
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Formatted Summary Text from Gemini Grounding */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700/80">
                {summary}
              </div>

              {/* Verified Web Sources (Grounding Chunks) */}
              <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                  <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{t.searchSources}</span>
                </div>

                {sources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sources.map((src, index) => (
                      <a
                        key={index}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-stone-800 transition-all text-xs group"
                      >
                        <span className="font-semibold text-stone-800 dark:text-stone-200 truncate pr-2 group-hover:text-amber-600">
                          {src.title || src.uri}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">{t.noGroundingSources}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
