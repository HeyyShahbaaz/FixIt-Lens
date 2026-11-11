import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Square,
  CheckSquare,
  Plus,
  Sparkles,
  AlertCircle,
  Calendar,
  X,
  RefreshCw
} from 'lucide-react';
import { MaintenanceReminder, Language, SavedDiagnosis } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';

interface Props {
  reminders: MaintenanceReminder[];
  language: Language;
  onToggleComplete: (id: string) => void;
  onAddReminder: (reminder: MaintenanceReminder) => void;
  savedDiagnoses: SavedDiagnosis[];
}

export const MaintenanceRemindersView: React.FC<Props> = ({
  reminders,
  language,
  onToggleComplete,
  onAddReminder,
  savedDiagnoses
}) => {
  const t = getTranslation(language);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isGeneratingAiTips, setIsGeneratingAiTips] = useState<boolean>(false);

  // Form states for manual add
  const [newAppliance, setNewAppliance] = useState<string>('Ceiling Fan');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newFrequency, setNewFrequency] = useState<string>('Every 3 months');
  const [newDueDate, setNewDueDate] = useState<string>(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
  );
  const [newNotes, setNewNotes] = useState<string>('');

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      id: `rem-${Date.now()}`,
      appliance: newAppliance,
      title: newTitle.trim(),
      frequency: newFrequency,
      dueDate: newDueDate,
      completed: false,
      notes: newNotes.trim() || undefined
    });

    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  // AI-powered maintenance suggestions generator
  const handleGenerateAiAdvice = async () => {
    setIsGeneratingAiTips(true);
    try {
      const applianceNames = Array.from(new Set(savedDiagnoses.map((d) => d.appliance)));
      const historySummary = savedDiagnoses.map((d) => ({
        appliance: d.appliance,
        problem: d.diagnosis.problem_summary
      }));

      const res = await fetch('/api/maintenance-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appliances: applianceNames.length ? applianceNames : ['Ceiling Fan', 'Washing Machine', 'Refrigerator'],
          historySummary,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newItems: MaintenanceReminder[] = (data.reminders || []).map(
          (item: { appliance: string; title: string; frequency: string; notes: string }, idx: number) => ({
            id: `ai-rem-${Date.now()}-${idx}`,
            appliance: item.appliance || 'Household Appliance',
            title: item.title,
            frequency: item.frequency,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (14 + idx * 10)).toISOString().split('T')[0],
            completed: false,
            notes: item.notes
          })
        );

        newItems.forEach((r) => onAddReminder(r));
      }
    } catch (err) {
      console.warn('AI maintenance generation failed', err);
    } finally {
      setIsGeneratingAiTips(false);
    }
  };

  const activeReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  return (
    <section className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>{t.remindersTitle}</span>
            <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {activeReminders.length} active
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Prevent breakdowns before they happen with regular servicing, descaling, and cleaning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ask AI for preventive maintenance */}
          <button
            onClick={handleGenerateAiAdvice}
            disabled={isGeneratingAiTips}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300 transition-all disabled:opacity-50"
          >
            {isGeneratingAiTips ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span>AI Suggest Schedules</span>
          </button>

          {/* Manual Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addReminder}</span>
          </button>
        </div>
      </div>

      {/* Active Reminders List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          Upcoming Schedule
        </h3>

        {activeReminders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 rounded-2xl">
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">{t.emptyReminders}</p>
          </div>
        ) : (
          activeReminders.map((reminder) => {
            const isOverdue = new Date(reminder.dueDate) < new Date();
            return (
              <div
                key={reminder.id}
                onClick={() => onToggleComplete(reminder.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 bg-white dark:bg-stone-800/90 ${
                  isOverdue
                    ? 'border-red-300 dark:border-red-900/60 hover:border-red-500'
                    : 'border-stone-200 dark:border-stone-700/80 hover:border-amber-400'
                }`}
              >
                <button
                  type="button"
                  aria-label={t.markDone}
                  className="mt-0.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 shrink-0"
                >
                  <Square className="w-5 h-5 text-stone-400" />
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {reminder.title}
                      </span>
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold px-2 py-0.5 rounded">
                        {reminder.appliance}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                        {reminder.frequency}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                          isOverdue
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {reminder.dueDate}
                      </span>
                    </div>
                  </div>

                  {reminder.notes && (
                    <p className="text-xs text-stone-500 dark:text-stone-400">{reminder.notes}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-700/60">
          <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            {t.completedReminders} ({completedReminders.length})
          </h3>

          <div className="space-y-2 opacity-60">
            {completedReminders.map((reminder) => (
              <div
                key={reminder.id}
                onClick={() => onToggleComplete(reminder.id)}
                className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex items-center gap-3 cursor-pointer select-none"
              >
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs line-through font-medium text-stone-600 dark:text-stone-400">
                  {reminder.title} ({reminder.appliance})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                {t.addReminder}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Appliance
                </label>
                <input
                  type="text"
                  required
                  value={newAppliance}
                  onChange={(e) => setNewAppliance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Task / Maintenance Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Descale drum with citric acid"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Every month">Every month</option>
                    <option value="Every 2 months">Every 2 months</option>
                    <option value="Every 3 months">Every 3 months</option>
                    <option value="Every 6 months">Every 6 months</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Notes / Procedure
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional tips, parts or precautions..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
