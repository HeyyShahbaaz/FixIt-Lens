/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { CaptureSection } from './components/CaptureSection';
import { DiagnosisResult } from './components/DiagnosisResult';
import { FollowUpChat } from './components/FollowUpChat';
import { SearchGroundingModal } from './components/SearchGroundingModal';
import { HandsFreeStepMode } from './components/HandsFreeStepMode';
import { MyAppliancesView } from './components/MyAppliancesView';
import { MaintenanceRemindersView } from './components/MaintenanceRemindersView';
import { RecordingTipsModal } from './components/RecordingTipsModal';
import { PrintReportModal } from './components/PrintReportModal';

import {
  DiagnosisResponse,
  SavedDiagnosis,
  MaintenanceReminder,
  Language,
  ChatMessage,
  ApplianceStatus
} from './types/diagnosis';
import {
  getSavedDiagnoses,
  saveDiagnosis,
  updateDiagnosisStatus,
  toggleStepCompletion,
  getMaintenanceReminders,
  toggleReminderCompleted,
  addMaintenanceReminder
} from './utils/storage';
import { getTranslation } from './utils/translations';
import { ArrowLeft, PlusCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'diagnose' | 'appliances' | 'reminders'>('diagnose');
  const [language, setLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fixit_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Diagnoses and Reminders
  const [savedDiagnoses, setSavedDiagnoses] = useState<SavedDiagnosis[]>([]);
  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);

  // Current Active Diagnosis State
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [activeSavedRecordId, setActiveSavedRecordId] = useState<string | null>(null);
  const [activeModelNumber, setActiveModelNumber] = useState<string>('');
  const [activeExtraNotes, setActiveExtraNotes] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Async States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Listening to the sound...');
  const [isUpdatingChat, setIsUpdatingChat] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isGroundingModalOpen, setIsGroundingModalOpen] = useState<boolean>(false);
  const [isHandsFreeOpen, setIsHandsFreeOpen] = useState<boolean>(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState<boolean>(false);
  const [printModalRecord, setPrintModalRecord] = useState<SavedDiagnosis | null>(null);

  const t = getTranslation(language);
  const loadingIntervalRef = useRef<number | null>(null);

  // Sync dark mode class and data-theme attribute with html and body, persist to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      localStorage.setItem('fixit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark');
      localStorage.setItem('fixit_theme', 'light');
    }
  }, [isDarkMode]);

  // Load initial saved records
  useEffect(() => {
    setSavedDiagnoses(getSavedDiagnoses());
    setMaintenanceReminders(getMaintenanceReminders());
  }, []);

  // Cycle loading messages during analysis
  useEffect(() => {
    if (isLoading) {
      const messages = [
        t.loadingAudio,
        t.loadingVideo,
        t.loadingSafety,
        t.loadingFinalizing
      ];
      let idx = 0;
      setLoadingMessage(messages[0]);
      loadingIntervalRef.current = window.setInterval(() => {
        idx = (idx + 1) % messages.length;
        setLoadingMessage(messages[idx]);
      }, 2000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading, language]);

  // Handle New Breakdown Analysis
  const handleAnalyze = async (payload: {
    videoBase64?: string;
    mimeType?: string;
    appliance: string;
    modelNumber: string;
    extraNotes: string;
    videoDurationSec?: number;
    videoThumbnail?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64: payload.videoBase64,
          mimeType: payload.mimeType,
          appliance: payload.appliance,
          modelNumber: payload.modelNumber,
          extraNotes: payload.extraNotes,
          language
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete breakdown diagnosis.');
      }

      const data = await response.json();
      const diagnosis: DiagnosisResponse = data.diagnosis;

      setCurrentDiagnosis(diagnosis);
      setActiveModelNumber(payload.modelNumber);
      setActiveExtraNotes(payload.extraNotes);
      setCompletedSteps([]);
      setChatHistory([]);

      // Auto-save to history
      const newRecordId = `diag-${Date.now()}`;
      const newRecord: SavedDiagnosis = {
        id: newRecordId,
        timestamp: Date.now(),
        appliance: diagnosis.appliance || payload.appliance,
        modelNumber: payload.modelNumber,
        extraNotes: payload.extraNotes,
        videoDurationSec: payload.videoDurationSec,
        diagnosis,
        status: diagnosis.verdict?.decision === 'call_a_pro' ? 'needs_pro' : 'pending',
        completedSteps: [],
        chatHistory: [],
        language
      };

      saveDiagnosis(newRecord);
      setActiveSavedRecordId(newRecordId);
      setSavedDiagnoses(getSavedDiagnoses());
    } catch (err: unknown) {
      console.error('Diagnosis error:', err);
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please check connection and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Follow-up Clarification Reply
  const handleSendChatReply = async (replyText: string) => {
    if (!currentDiagnosis || isUpdatingChat) return;

    setIsUpdatingChat(true);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: replyText,
      timestamp: Date.now()
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);

    try {
      const response = await fetch('/api/chat-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDiagnosis,
          userReply: replyText,
          conversationHistory: newHistory,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update diagnosis');
      }

      const data = await response.json();
      const updatedDiagnosis: DiagnosisResponse = data.updatedDiagnosis;

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: updatedDiagnosis.problem_summary,
        timestamp: Date.now(),
        updatedDiagnosis
      };

      const finalHistory = [...newHistory, assistantMsg];
      setChatHistory(finalHistory);
      setCurrentDiagnosis(updatedDiagnosis);

      // Update in storage
      if (activeSavedRecordId) {
        const currentSaved = getSavedDiagnoses();
        const existing = currentSaved.find((d) => d.id === activeSavedRecordId);
        if (existing) {
          const updatedRecord: SavedDiagnosis = {
            ...existing,
            diagnosis: updatedDiagnosis,
            chatHistory: finalHistory
          };
          saveDiagnosis(updatedRecord);
          setSavedDiagnoses(getSavedDiagnoses());
        }
      }
    } catch (err) {
      console.error('Follow up error:', err);
    } finally {
      setIsUpdatingChat(false);
    }
  };

  // Toggle Fix Step Complete
  const handleToggleStep = (stepNumber: number) => {
    if (!currentDiagnosis) return;

    const newSteps = completedSteps.includes(stepNumber)
      ? completedSteps.filter((s) => s !== stepNumber)
      : [...completedSteps, stepNumber];
    setCompletedSteps(newSteps);

    if (activeSavedRecordId) {
      toggleStepCompletion(activeSavedRecordId, stepNumber);
      setSavedDiagnoses(getSavedDiagnoses());
    }
  };

  // Select a diagnosis from History
  const handleSelectHistoryRecord = (record: SavedDiagnosis) => {
    setCurrentDiagnosis(record.diagnosis);
    setActiveSavedRecordId(record.id);
    setActiveModelNumber(record.modelNumber || '');
    setActiveExtraNotes(record.extraNotes || '');
    setCompletedSteps(record.completedSteps || []);
    setChatHistory(record.chatHistory || []);
    setActiveTab('diagnose');
  };

  // Update Appliance Status
  const handleUpdateStatus = (id: string, status: ApplianceStatus) => {
    updateDiagnosisStatus(id, status);
    setSavedDiagnoses(getSavedDiagnoses());
  };

  // Toggle Maintenance Reminder Done
  const handleToggleReminder = (id: string) => {
    toggleReminderCompleted(id);
    setMaintenanceReminders(getMaintenanceReminders());
  };

  // Add Custom Maintenance Reminder
  const handleAddReminder = (reminder: MaintenanceReminder) => {
    addMaintenanceReminder(reminder);
    setMaintenanceReminders(getMaintenanceReminders());
  };

  return (
    <div
      data-theme={isDarkMode ? 'dark' : 'light'}
      className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors"
    >
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        openTipsModal={() => setIsTipsModalOpen(true)}
        appliancesCount={savedDiagnoses.length}
        remindersCount={maintenanceReminders.filter((r) => !r.completed).length}
      />

      {/* Persistent ISO/Safety Disclaimer Banner */}
      <DisclaimerBanner language={language} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Tab 1: DIAGNOSE VIEW */}
        {activeTab === 'diagnose' && (
          <div className="space-y-8">
            {/* If we have an active diagnosis, show back button to start new */}
            {currentDiagnosis && (
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                <button
                  onClick={() => {
                    setCurrentDiagnosis(null);
                    setActiveSavedRecordId(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-amber-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Start New Breakdown Recording</span>
                </button>

                <button
                  onClick={() => {
                    const currentRecord = savedDiagnoses.find((d) => d.id === activeSavedRecordId);
                    if (currentRecord) setPrintModalRecord(currentRecord);
                  }}
                  className="text-xs font-semibold text-amber-600 hover:underline"
                >
                  Print / Export Diagnosis PDF
                </button>
              </div>
            )}

            {/* If no current diagnosis, show the Capture / Upload section */}
            {!currentDiagnosis ? (
              <CaptureSection
                language={language}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                errorMessage={errorMessage}
                onClearError={() => setErrorMessage(null)}
              />
            ) : (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* 1. Diagnosis Results Cards */}
                <DiagnosisResult
                  diagnosis={currentDiagnosis}
                  language={language}
                  completedSteps={completedSteps}
                  onToggleStep={handleToggleStep}
                  onOpenSearchGrounding={() => setIsGroundingModalOpen(true)}
                  onOpenHandsFree={() => setIsHandsFreeOpen(true)}
                  modelNumber={activeModelNumber}
                />

                {/* 2. Follow-Up Clarification Chat */}
                <FollowUpChat
                  followUpQuestion={currentDiagnosis.follow_up_question}
                  language={language}
                  chatHistory={chatHistory}
                  onSendReply={handleSendChatReply}
                  isUpdating={isUpdatingChat}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: MY APPLIANCES VIEW */}
        {activeTab === 'appliances' && (
          <MyAppliancesView
            savedDiagnoses={savedDiagnoses}
            language={language}
            onSelectDiagnosis={handleSelectHistoryRecord}
            onUpdateStatus={handleUpdateStatus}
            onPrintReport={(rec) => setPrintModalRecord(rec)}
          />
        )}

        {/* Tab 3: MAINTENANCE REMINDERS VIEW */}
        {activeTab === 'reminders' && (
          <MaintenanceRemindersView
            reminders={maintenanceReminders}
            language={language}
            onToggleComplete={handleToggleReminder}
            onAddReminder={handleAddReminder}
            savedDiagnoses={savedDiagnoses}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-500 dark:text-stone-400 bg-white/50 dark:bg-stone-900/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            FixIt Lens • Cautious AI Household Breakdown Diagnoser • Multimodal Audio & Vision
          </p>
          <p className="text-[11px] text-stone-400">
            Strict Safety First ISO 12100 Guidelines • High-voltage / Gas Technician Handoff
          </p>
        </div>
      </footer>

      {/* Search Grounding Modal (Manuals & Replacement Parts) */}
      {currentDiagnosis && (
        <SearchGroundingModal
          isOpen={isGroundingModalOpen}
          onClose={() => setIsGroundingModalOpen(false)}
          appliance={currentDiagnosis.appliance}
          modelNumber={activeModelNumber}
          problemSummary={currentDiagnosis.problem_summary}
          language={language}
        />
      )}

      {/* Hands-Free Voice Guided Step-by-Step Mode */}
      {currentDiagnosis && (
        <HandsFreeStepMode
          isOpen={isHandsFreeOpen}
          onClose={() => setIsHandsFreeOpen(false)}
          steps={currentDiagnosis.fix_steps || []}
          language={language}
          completedSteps={completedSteps}
          onToggleStep={handleToggleStep}
        />
      )}

      {/* Recording Best Practices Modal */}
      <RecordingTipsModal
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
        language={language}
      />

      {/* Printable PDF / Summary Modal */}
      <PrintReportModal
        diagnosis={printModalRecord}
        onClose={() => setPrintModalRecord(null)}
        language={language}
      />
    </div>
  );
}
