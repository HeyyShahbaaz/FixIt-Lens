import React from 'react';
import { Wrench, Camera, History, CalendarClock, HelpCircle, Moon, Sun, Globe } from 'lucide-react';
import { Language } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';

interface Props {
  activeTab: 'diagnose' | 'appliances' | 'reminders';
  setActiveTab: (tab: 'diagnose' | 'appliances' | 'reminders') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  openTipsModal: () => void;
  appliancesCount: number;
  remindersCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  isDarkMode,
  setIsDarkMode,
  openTipsModal,
  appliancesCount,
  remindersCount
}) => {
  const t = getTranslation(language);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('diagnose')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-1 -ml-1 transition-transform active:scale-95"
          aria-label="FixIt Lens Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30">
            <div className="relative">
              <Camera className="w-5 h-5 text-white" />
              <Wrench className="w-3 h-3 text-amber-200 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-stone-900 dark:text-stone-100">
                FixIt<span className="text-amber-600 dark:text-amber-500">Lens</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                AI Vision + Audio
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block truncate max-w-[200px]">
              {t.appTagline}
            </p>
          </div>
        </button>

        {/* Center Nav tabs for Desktop */}
        <nav className="hidden sm:flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl border border-stone-200 dark:border-stone-700/60" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('diagnose')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'diagnose'
                ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.navDiagnose}</span>
          </button>

          <button
            onClick={() => setActiveTab('appliances')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'appliances'
                ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.navAppliances}</span>
            {appliancesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {appliancesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'reminders'
                ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>{t.navReminders}</span>
            {remindersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {remindersCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Action Tools: Language, Tips, Dark mode */}
        <div className="flex items-center gap-1.5">
          {/* Recording Tips button */}
          <button
            onClick={openTipsModal}
            title={t.navTips}
            aria-label={t.navTips}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">{t.navTips}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
            title="Toggle Language: English / हिन्दी"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom-like Navigation Bar for Small Screens */}
      <nav aria-label="Mobile Navigation" className="sm:hidden flex items-center justify-around border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 py-1.5 px-2">
        <button
          onClick={() => setActiveTab('diagnose')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold py-1 px-3 rounded-lg ${
            activeTab === 'diagnose'
              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-stone-800'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{t.navDiagnose}</span>
        </button>

        <button
          onClick={() => setActiveTab('appliances')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold py-1 px-3 rounded-lg relative ${
            activeTab === 'appliances'
              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-stone-800'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <div className="relative">
            <History className="w-4 h-4" />
            {appliancesCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                {appliancesCount}
              </span>
            )}
          </div>
          <span>{t.navAppliances}</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold py-1 px-3 rounded-lg relative ${
            activeTab === 'reminders'
              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-stone-800'
              : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <div className="relative">
            <CalendarClock className="w-4 h-4" />
            {remindersCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                {remindersCount}
              </span>
            )}
          </div>
          <span>{t.navReminders}</span>
        </button>
      </nav>
    </header>
  );
};
