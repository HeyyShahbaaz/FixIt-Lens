import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Language } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';

interface Props {
  language: Language;
}

export const DisclaimerBanner: React.FC<Props> = ({ language }) => {
  const t = getTranslation(language);

  return (
    <aside aria-label={t.disclaimerTitle} className="bg-amber-500/10 border-y border-amber-500/20 px-4 py-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <p className="font-medium leading-relaxed">
            <span className="font-semibold uppercase tracking-wider text-[11px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded mr-1.5">
              {t.disclaimerTitle}
            </span>
            {t.disclaimerText}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-amber-700 dark:text-amber-300/80 shrink-0 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safety Standard ISO 12100</span>
        </div>
      </div>
    </aside>
  );
};
