import React, { useState } from 'react';
import { MessageSquare, Send, Mic, HelpCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Language, ChatMessage, DiagnosisResponse } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';
import { startVoiceInput } from '../utils/audioVoice';

interface Props {
  followUpQuestion: string | null;
  language: Language;
  chatHistory: ChatMessage[];
  onSendReply: (replyText: string) => void;
  isUpdating: boolean;
}

export const FollowUpChat: React.FC<Props> = ({
  followUpQuestion,
  language,
  chatHistory,
  onSendReply,
  isUpdating
}) => {
  const t = getTranslation(language);
  const [inputText, setInputText] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isUpdating) return;
    onSendReply(inputText.trim());
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    if (isUpdating) return;
    onSendReply(text);
  };

  const handleVoiceInput = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    setIsVoiceListening(true);
    startVoiceInput(
      language,
      (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsVoiceListening(false);
      },
      (err) => {
        console.warn('Voice chat error:', err);
        setIsVoiceListening(false);
      },
      () => {
        setIsVoiceListening(false);
      }
    );
  };

  return (
    <div className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
            {t.followUpTitle}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Answering clarification questions narrows down likely causes and improves diagnosis accuracy.
          </p>
        </div>
      </div>

      {/* Prominent Follow-up Question Card */}
      {followUpQuestion && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Question from Technician:
              </span>
              <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
                {followUpQuestion}
              </p>
            </div>
          </div>

          {/* Quick-reply Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => handleQuickReply(t.followUpQuickYes)}
              disabled={isUpdating}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 shadow-sm transition-all disabled:opacity-50"
            >
              {t.followUpQuickYes}
            </button>
            <button
              onClick={() => handleQuickReply(t.followUpQuickNo)}
              disabled={isUpdating}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 shadow-sm transition-all disabled:opacity-50"
            >
              {t.followUpQuickNo}
            </button>
            <button
              onClick={() => handleQuickReply(t.followUpQuickNotSure)}
              disabled={isUpdating}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 shadow-sm transition-all disabled:opacity-50"
            >
              {t.followUpQuickNotSure}
            </button>
          </div>
        </div>
      )}

      {/* Previous Chat History */}
      {chatHistory.length > 0 && (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-medium ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-br-xs'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-stone-100 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-stone-400 mt-0.5 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Updating Status */}
      {isUpdating && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
          <span>{t.updatingDiagnosis}</span>
        </div>
      )}

      {/* Input Box with Voice & Send */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.answerPlaceholder}
          disabled={isUpdating}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
        />

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isUpdating}
          className={`p-2.5 rounded-xl border transition-all ${
            isVoiceListening
              ? 'bg-red-600 text-white border-red-600 animate-pulse'
              : 'border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
          }`}
          title="Speak your reply"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isUpdating}
          className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title={t.sendAnswer}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
