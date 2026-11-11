import React, { useState } from 'react';
import {
  AlertOctagon,
  Eye,
  Volume2,
  CheckSquare,
  Square,
  Wrench,
  Clock,
  Gauge,
  PhoneCall,
  Search,
  VolumeX,
  Headphones,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiagnosisResponse, Language, DecisionType, UrgencyType, ConfidenceLevel } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';
import { speakText, stopSpeaking } from '../utils/audioVoice';
import { calculateOverallConfidence } from '../utils/safetyAndStats';

interface Props {
  diagnosis: DiagnosisResponse;
  language: Language;
  completedSteps: number[];
  onToggleStep: (stepNumber: number) => void;
  onOpenSearchGrounding: () => void;
  onOpenHandsFree: () => void;
  modelNumber?: string;
}

export const DiagnosisResult: React.FC<Props> = ({
  diagnosis,
  language,
  completedSteps,
  onToggleStep,
  onOpenSearchGrounding,
  onOpenHandsFree,
  modelNumber
}) => {
  const t = getTranslation(language);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedTechSummary, setCopiedTechSummary] = useState<boolean>(false);
  const [copiedPartsList, setCopiedPartsList] = useState<boolean>(false);

  const isCallAPro = diagnosis.verdict?.decision === 'call_a_pro';
  const isDiyCaution = diagnosis.verdict?.decision === 'diy_with_caution';

  const overallConfidence = calculateOverallConfidence(diagnosis.likely_causes || []);

  // Handle step click with celebration on all completed
  const handleStepClick = (stepNum: number) => {
    onToggleStep(stepNum);
    const totalSteps = diagnosis.fix_steps?.length || 0;
    const willBeComplete =
      !completedSteps.includes(stepNum) && completedSteps.length + 1 >= totalSteps && totalSteps > 0;

    if (willBeComplete) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  // Voice Read Aloud for Diagnosis
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const textToSpeak = `
      ${diagnosis.appliance}. ${diagnosis.problem_summary}.
      Safety warning: ${diagnosis.safety_warnings?.join('. ') || ''}.
      Technician verdict: ${diagnosis.verdict?.decision === 'call_a_pro' ? 'Please call a professional technician' : 'Safe for DIY repair'}. ${diagnosis.verdict?.reason}.
      ${diagnosis.fix_steps?.map((s) => `Step ${s.step}: ${s.instruction}`).join('. ')}
    `;

    speakText(
      textToSpeak,
      language,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Copy Technician Summary
  const handleCopyTechSummary = () => {
    const summaryText = `Breakdown Report - FixIt Lens
Appliance: ${diagnosis.appliance} ${modelNumber ? `(${modelNumber})` : ''}
Issue: ${diagnosis.problem_summary}
Observed Visuals: ${diagnosis.observations?.visual?.join(', ')}
Observed Sounds: ${diagnosis.observations?.audio?.join(', ')}
Likely Causes: ${diagnosis.likely_causes?.map((c) => `${c.cause} (~${c.probability_percent}%)`).join('; ')}
Parts Estimated: ${diagnosis.tools_and_parts_list?.map((p) => `${p.item} (${p.approx_price_inr})`).join(', ')}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedTechSummary(true);
    setTimeout(() => setCopiedTechSummary(false), 2500);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const shareText = encodeURIComponent(
      `Hi, I need service for my ${diagnosis.appliance}.\nIssue: ${diagnosis.problem_summary}\nDiagnosis: ${diagnosis.verdict?.reason}\n(Analyzed via FixIt Lens AI)`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  // Copy Parts List
  const handleCopyPartsList = () => {
    const listText = diagnosis.tools_and_parts_list
      ?.map((p) => `• ${p.item}: ${p.approx_price_inr}`)
      .join('\n');
    navigator.clipboard.writeText(listText || '');
    setCopiedPartsList(true);
    setTimeout(() => setCopiedPartsList(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top action toolbar: Voice read aloud, Hands-free, Find manuals */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100">
              {diagnosis.appliance || 'Appliance Diagnosis'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span>{t.confidence}:</span>
              <span
                className={`font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded ${
                  overallConfidence.label === 'high'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : overallConfidence.label === 'medium'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                }`}
              >
                {overallConfidence.label} ({overallConfidence.score}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Read Aloud Button */}
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              isSpeaking
                ? 'bg-red-600 text-white border-red-600 animate-pulse'
                : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200'
            }`}
            title={isSpeaking ? t.stopSpeaking : t.readAloud}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            <span>{isSpeaking ? t.stopSpeaking : t.readAloud}</span>
          </button>

          {/* Hands-Free Mode Button */}
          {!isCallAPro && (
            <button
              onClick={onOpenHandsFree}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
            >
              <Headphones className="w-4 h-4" />
              <span>{t.handsFreeMode}</span>
            </button>
          )}

          {/* Find Manuals & Parts (Search Grounding) */}
          <button
            onClick={onOpenSearchGrounding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 transition-colors"
          >
            <Search className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{t.findManualParts}</span>
            <span className="sm:hidden">Manuals</span>
          </button>
        </div>
      </div>

      {/* 1. SAFETY WARNINGS (Red, always at the top) */}
      <div className="bg-red-600/10 dark:bg-red-950/40 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400">
          <AlertOctagon className="w-6 h-6 shrink-0 animate-bounce" />
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight uppercase">
              {t.safetyWarningsTitle}
            </h3>
            <p className="text-xs text-red-600/90 dark:text-red-300/80 font-medium">
              {t.safetyMandatory}
            </p>
          </div>
        </div>

        <ul className="space-y-2 pt-1 border-t border-red-200 dark:border-red-900/60">
          {diagnosis.safety_warnings?.map((warning, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-red-900 dark:text-red-200"
            >
              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 font-mono">
                !
              </span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary Banner */}
      <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl p-4">
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
          Problem Summary
        </p>
        <p className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 leading-relaxed">
          {diagnosis.problem_summary}
        </p>
      </div>

      {/* 2. WHAT I SAW AND HEARD */}
      <div className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <span>{t.sawAndHeardTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Visual Observations */}
          <div className="bg-amber-50/60 dark:bg-stone-900/60 border border-amber-200/60 dark:border-stone-700/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.visualObservations}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              {diagnosis.observations?.visual?.map((vis, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span>{vis}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Audio Observations */}
          <div className="bg-orange-50/60 dark:bg-stone-900/60 border border-orange-200/60 dark:border-stone-700/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-bold text-xs">
              <Volume2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>{t.audioObservations}</span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              {diagnosis.observations?.audio?.map((aud, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                  <span>{aud}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. LIKELY CAUSES (Ranked with probability bars & confidence badges) */}
      <div className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
            {t.likelyCausesTitle}
          </h3>
          <span className="text-xs text-stone-500 dark:text-stone-400">Ranked by probability</span>
        </div>

        <div className="space-y-3">
          {diagnosis.likely_causes?.map((item, idx) => (
            <div
              key={idx}
              className="border border-stone-200 dark:border-stone-700 rounded-xl p-3.5 bg-stone-50/40 dark:bg-stone-900/40 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    {idx + 1}. {item.cause}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400">{item.reasoning}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                    {item.probability_percent}%
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      item.confidence === 'high'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : item.confidence === 'medium'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {item.confidence}
                  </span>
                </div>
              </div>

              {/* Animated probability bar */}
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, item.probability_percent))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. STEP-BY-STEP FIX GUIDE (Interactive checklist) */}
      <div
        className={`bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 transition-all ${
          isCallAPro ? 'opacity-60 grayscale-[40%]' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
              {t.stepsTitle}
            </h3>
            {isCallAPro && (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-0.5">
                Note: Technician assistance strongly advised. Steps are for informational reference only.
              </p>
            )}
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
            {completedSteps.length} / {diagnosis.fix_steps?.length || 0} completed
          </span>
        </div>

        <div className="space-y-3">
          {diagnosis.fix_steps?.map((stepItem) => {
            const isCompleted = completedSteps.includes(stepItem.step);
            return (
              <div
                key={stepItem.step}
                onClick={() => handleStepClick(stepItem.step)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2 ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-stone-600 dark:text-stone-400'
                    : 'bg-stone-50/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label={`${t.stepCheckboxAria} ${stepItem.step}`}
                    className="mt-0.5 text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 shrink-0"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        isCompleted
                          ? 'line-through text-stone-500 dark:text-stone-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      Step {stepItem.step}: {stepItem.instruction}
                    </p>

                    {/* Tools Needed Tags */}
                    {stepItem.tools_needed && stepItem.tools_needed.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
                          {t.toolsNeeded}:
                        </span>
                        {stepItem.tools_needed.map((tool, ti) => (
                          <span
                            key={ti}
                            className="text-[10px] bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded font-medium"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Per-step warning if any */}
                    {stepItem.warning && (
                      <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded mt-1.5 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{stepItem.warning}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. TOOLS AND PARTS WITH PRICE ESTIMATES (INR) */}
      <div className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
            {t.toolsAndPartsTitle}
          </h3>
          <button
            onClick={handleCopyPartsList}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            {copiedPartsList ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPartsList ? t.copied : t.copyList}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {diagnosis.tools_and_parts_list?.map((toolItem, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50/40 dark:bg-stone-900/40"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {toolItem.item}
                </span>
              </div>
              <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
                {toolItem.approx_price_inr}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. VERDICT CARD (DIY vs Call a pro) */}
      <div
        className={`rounded-2xl p-4 sm:p-6 border-2 shadow-sm space-y-4 ${
          isCallAPro
            ? 'bg-red-500/10 border-red-500 dark:bg-red-950/30'
            : isDiyCaution
            ? 'bg-amber-500/10 border-amber-500 dark:bg-amber-950/30'
            : 'bg-emerald-500/10 border-emerald-500 dark:bg-emerald-950/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  isCallAPro
                    ? 'bg-red-600 text-white'
                    : isDiyCaution
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isCallAPro ? t.callProDecision : isDiyCaution ? t.diyCautionDecision : t.diyDecision}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 mt-2">
              {diagnosis.verdict?.reason}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs shrink-0 font-semibold">
            <div className="bg-white dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>{diagnosis.verdict?.time_needed}</span>
            </div>
            <div className="bg-white dark:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-stone-500" />
              <span className="capitalize">{diagnosis.verdict?.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Cost Comparison: DIY vs Pro */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200/80 dark:border-stone-700/80">
          <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">{t.estDiyCost}</p>
            <p className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100">
              {diagnosis.verdict?.estimated_diy_cost_inr || '₹0'}
            </p>
          </div>
          <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">{t.estProCost}</p>
            <p className="text-sm sm:text-base font-extrabold text-amber-700 dark:text-amber-400">
              {diagnosis.verdict?.estimated_pro_cost_inr || '₹400 - ₹800'}
            </p>
          </div>
        </div>

        {/* What to tell the technician (if Call a Pro is verdict) */}
        {isCallAPro && (
          <div className="pt-3 border-t border-red-300 dark:border-red-900/60 space-y-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-xs">
              <PhoneCall className="w-4 h-4" />
              <span>{t.techHandoffTitle}</span>
            </div>
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 text-xs text-stone-800 dark:text-stone-200 space-y-1 font-mono leading-relaxed">
              <p>• {diagnosis.problem_summary}</p>
              <p>• Sound: {diagnosis.observations?.audio?.join(', ')}</p>
              <p>• Suspected component: {diagnosis.likely_causes?.[0]?.cause}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyTechSummary}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                {copiedTechSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedTechSummary ? t.copied : t.copyTechSummary}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareWhatsApp}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. URGENCY BADGE */}
      <div className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
          {t.urgencyTitle}
        </span>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            diagnosis.urgency === 'fix_now'
              ? 'bg-red-600 text-white shadow-sm animate-pulse'
              : diagnosis.urgency === 'fix_this_week'
              ? 'bg-amber-500 text-white'
              : 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200'
          }`}
        >
          {diagnosis.urgency === 'fix_now'
            ? t.urgency_fix_now
            : diagnosis.urgency === 'fix_this_week'
            ? t.urgency_fix_this_week
            : t.urgency_can_wait}
        </span>
      </div>

      {/* 8. MAINTENANCE TIPS */}
      {diagnosis.maintenance_tips && diagnosis.maintenance_tips.length > 0 && (
        <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-5 space-y-2">
          <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            {t.maintenanceTipsTitle}
          </h4>
          <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
            {diagnosis.maintenance_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
