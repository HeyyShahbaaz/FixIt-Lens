import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Mic,
  ShieldAlert,
  Wrench,
  Headphones
} from 'lucide-react';
import { FixStep, Language } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';
import { speakText, stopSpeaking, startHandsFreeListener, VoiceListenerHandle } from '../utils/audioVoice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  steps: FixStep[];
  language: Language;
  completedSteps: number[];
  onToggleStep: (stepNumber: number) => void;
}

export const HandsFreeStepMode: React.FC<Props> = ({
  isOpen,
  onClose,
  steps,
  language,
  completedSteps,
  onToggleStep
}) => {
  const t = getTranslation(language);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(true);

  const currentStep = steps[currentStepIndex];

  // Speak current step whenever step index changes
  useEffect(() => {
    if (isOpen && currentStep) {
      speakCurrentStep();
    }
  }, [isOpen, currentStepIndex]);

  // Hands-free voice recognition listener
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      return;
    }

    const listener: VoiceListenerHandle = startHandsFreeListener(language, (command) => {
      if (command === 'next') {
        goToNext();
      } else if (command === 'previous') {
        goToPrev();
      } else if (command === 'repeat') {
        speakCurrentStep();
      } else if (command === 'stop') {
        stopSpeaking();
        setIsSpeaking(false);
      }
    });

    return () => {
      listener.stop();
      stopSpeaking();
    };
  }, [isOpen, currentStepIndex, steps.length]);

  const speakCurrentStep = () => {
    if (!currentStep) return;
    setIsSpeaking(true);
    const textToSpeak = `Step ${currentStep.step}. ${currentStep.instruction}. ${
      currentStep.warning ? `Warning: ${currentStep.warning}.` : ''
    } ${
      currentStep.tools_needed?.length
        ? `Tools needed: ${currentStep.tools_needed.join(', ')}.`
        : ''
    }`;

    speakText(
      textToSpeak,
      language,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const goToNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleCurrentStepDone = () => {
    if (currentStep) {
      onToggleStep(currentStep.step);
    }
  };

  if (!isOpen || !currentStep) return null;

  const isCurrentStepDone = completedSteps.includes(currentStep.step);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col p-4 sm:p-8 select-none animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Headphones className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-stone-100 flex items-center gap-2">
              <span>{t.handsFreeMode}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Voice Active
              </span>
            </h2>
            <p className="text-xs text-stone-400">{t.handsFreeNotice}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>{t.exitHandsFree}</span>
        </button>
      </div>

      {/* Middle: Giant Step Card */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-3xl mx-auto w-full py-8 text-center space-y-6">
        {/* Step Counter Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-amber-400 text-sm font-extrabold">
          <span>
            STEP {currentStep.step} OF {steps.length}
          </span>
          {isCurrentStepDone && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs">
              • Completed
            </span>
          )}
        </div>

        {/* Large Instruction Text */}
        <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-100 leading-snug">
          {currentStep.instruction}
        </h3>

        {/* Step Warning */}
        {currentStep.warning && (
          <div className="max-w-xl bg-red-950/60 border border-red-500/50 rounded-2xl p-4 text-red-200 text-sm sm:text-base font-semibold flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
            <p className="text-left">{currentStep.warning}</p>
          </div>
        )}

        {/* Tools Needed */}
        {currentStep.tools_needed && currentStep.tools_needed.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {t.toolsNeeded}:
            </span>
            {currentStep.tools_needed.map((tool, i) => (
              <span
                key={i}
                className="bg-stone-800 text-stone-200 px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold border border-stone-700"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Mark Done Toggle */}
        <button
          onClick={toggleCurrentStepDone}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            isCurrentStepDone
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isCurrentStepDone ? 'Completed' : 'Mark Step as Done'}</span>
        </button>
      </div>

      {/* Bottom Controls Bar (Large Touch Targets & Voice Indicator) */}
      <div className="border-t border-stone-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto w-full">
        {/* Previous Button */}
        <button
          onClick={goToPrev}
          disabled={currentStepIndex === 0}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed font-extrabold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t.prevStep}</span>
        </button>

        {/* Repeat Voice Output Button */}
        <button
          onClick={speakCurrentStep}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-extrabold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{t.repeatStep}</span>
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          disabled={currentStepIndex === steps.length - 1}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 disabled:opacity-30 disabled:cursor-not-allowed font-extrabold text-sm flex items-center justify-center gap-2 text-white shadow-lg shadow-amber-600/30 transition-transform active:scale-95"
        >
          <span>{t.nextStep}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
