import React from 'react';
import { X, Mic, Video, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { Language } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const RecordingTipsModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const t = getTranslation(language);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
              {t.tipsModalTitle}
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200/60 dark:border-stone-700/80">
            <Mic className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100">{t.tip1Title}</p>
              <p className="text-stone-600 dark:text-stone-400 mt-0.5">{t.tip1Desc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/60 dark:bg-stone-800/60 border border-orange-200/60 dark:border-stone-700/80">
            <Video className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100">{t.tip2Title}</p>
              <p className="text-stone-600 dark:text-stone-400 mt-0.5">{t.tip2Desc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
            <Tag className="w-5 h-5 text-stone-600 dark:text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100">{t.tip3Title}</p>
              <p className="text-stone-600 dark:text-stone-400 mt-0.5">{t.tip3Desc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 dark:text-red-200">{t.tip4Title}</p>
              <p className="text-red-700/90 dark:text-red-300/80 mt-0.5">{t.tip4Desc}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
          >
            Got it, Let's Record!
          </button>
        </div>
      </div>
    </div>
  );
};
