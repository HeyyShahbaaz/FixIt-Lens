import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  ChevronRight,
  Filter,
  Calendar,
  Share2,
  Trash2,
  AlertOctagon,
  Eye,
  Download,
  FileText,
  Check
} from 'lucide-react';
import { SavedDiagnosis, Language, ApplianceStatus, SavedDevicePdf } from '../types/diagnosis';
import { getTranslation } from '../utils/translations';
import { detectRepeatBreakdown, ApplianceRecord } from '../utils/safetyAndStats';
import {
  generateAndDownloadReportPdf,
  getSavedDevicePdfs,
  downloadExistingPdfFromStorage,
  deleteSavedDevicePdf
} from '../utils/pdfExport';

interface Props {
  savedDiagnoses: SavedDiagnosis[];
  language: Language;
  onSelectDiagnosis: (diagnosis: SavedDiagnosis) => void;
  onUpdateStatus: (id: string, status: ApplianceStatus) => void;
  onPrintReport: (diagnosis: SavedDiagnosis) => void;
}

export const MyAppliancesView: React.FC<Props> = ({
  savedDiagnoses,
  language,
  onSelectDiagnosis,
  onUpdateStatus,
  onPrintReport
}) => {
  const t = getTranslation(language);
  const [filterAppliance, setFilterAppliance] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [devicePdfs, setDevicePdfs] = useState<SavedDevicePdf[]>(() => getSavedDevicePdfs());
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const handleDownloadDirectPdf = (record: SavedDiagnosis) => {
    try {
      const saved = generateAndDownloadReportPdf(record);
      setDevicePdfs(getSavedDevicePdfs());
      setDownloadFeedback(`Downloaded "${saved.filename}" to your device storage!`);
      setTimeout(() => setDownloadFeedback(null), 4000);
    } catch (err) {
      console.error('Failed downloading PDF', err);
    }
  };

  const handleDeleteSavedPdf = (id: string) => {
    deleteSavedDevicePdf(id);
    setDevicePdfs(getSavedDevicePdfs());
  };

  // Unique appliance categories
  const applianceCategories = Array.from(new Set(savedDiagnoses.map((d) => d.appliance)));

  // Filtered diagnoses
  const filteredList = savedDiagnoses.filter((item) => {
    const matchesCat = filterAppliance === 'all' || item.appliance === filterAppliance;
    const matchesStat = filterStatus === 'all' || item.status === filterStatus;
    return matchesCat && matchesStat;
  });

  // Prepare records for repeat breakdown check
  const historyRecords: ApplianceRecord[] = savedDiagnoses.map((d) => ({
    id: d.id,
    timestamp: d.timestamp,
    appliance: d.appliance,
    modelNumber: d.modelNumber,
    problemSummary: d.diagnosis.problem_summary,
    likelyCauses: d.diagnosis.likely_causes.map((c) => c.cause),
    status: d.status
  }));

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>{t.myAppliancesTitle}</span>
            <span className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {savedDiagnoses.length} records
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track repair statuses, repeated breakdown warnings, and export diagnostic technician summaries.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterAppliance}
            onChange={(e) => setFilterAppliance(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none"
          >
            <option value="all">All Appliances</option>
            {applianceCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">{t.statusPending}</option>
            <option value="fixed">{t.statusFixed}</option>
            <option value="needs_pro">{t.statusNeedsPro}</option>
          </select>
        </div>
      </div>

      {/* List of Appliance Records */}
      {filteredList.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <Wrench className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <p className="font-bold text-sm text-stone-700 dark:text-stone-300">{t.emptyHistory}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((record) => {
            // Check repeat issues
            const otherRecords = historyRecords.filter((h) => h.id !== record.id);
            const repeatCheck = detectRepeatBreakdown(
              otherRecords,
              record.appliance,
              record.diagnosis.problem_summary
            );

            const isFixed = record.status === 'fixed';
            const isNeedsPro = record.status === 'needs_pro';

            return (
              <div
                key={record.id}
                className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 hover:border-amber-400/80 transition-all"
              >
                {/* Repeat Alert Banner if detected */}
                {repeatCheck.isRepeat && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mr-1">
                        {t.repeatAlert}:
                      </span>
                      <span>{repeatCheck.message}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                        {record.appliance}
                      </span>
                      {record.modelNumber && (
                        <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                          {record.modelNumber}
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(record.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
                      {record.diagnosis.problem_summary}
                    </p>
                  </div>

                  {/* Status Selector */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={record.status}
                      onChange={(e) => onUpdateStatus(record.id, e.target.value as ApplianceStatus)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none ${
                        isFixed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : isNeedsPro
                          ? 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                          : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <option value="pending">{t.statusPending}</option>
                      <option value="fixed">{t.statusFixed}</option>
                      <option value="needs_pro">{t.statusNeedsPro}</option>
                    </select>
                  </div>
                </div>

                {/* Key Observations & Cause */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-700/80">
                  <div>
                    <span className="font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">
                      Top Suspected Cause:
                    </span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                      {record.diagnosis.likely_causes?.[0]?.cause} (
                      {record.diagnosis.likely_causes?.[0]?.probability_percent}%)
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">
                      Verdict:
                    </span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100 mt-0.5 capitalize">
                      {record.diagnosis.verdict?.decision?.replace(/_/g, ' ')} • Est. DIY:{' '}
                      {record.diagnosis.verdict?.estimated_diy_cost_inr}
                    </p>
                  </div>
                </div>

                {/* Card Actions: View Full Diagnosis, Download PDF & Print */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-700/60">
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Fix Progress: {record.completedSteps?.length || 0} /{' '}
                    {record.diagnosis.fix_steps?.length || 0} steps
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleDownloadDirectPdf(record)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-800 dark:text-amber-300 transition-colors"
                      title="Save full PDF report to device storage"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save PDF</span>
                    </button>

                    <button
                      onClick={() => onPrintReport(record)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
                      title={t.exportPdf}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{t.exportPdf}</span>
                    </button>

                    <button
                      onClick={() => onSelectDiagnosis(record)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <span>{t.viewDetails}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Download Feedback Banner */}
      {downloadFeedback && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-500/50 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{downloadFeedback}</span>
        </div>
      )}

      {/* Saved PDF Reports in Device Storage */}
      <div className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                Device Storage PDF Archive
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Downloaded reports stored offline in your browser & device local storage
              </p>
            </div>
          </div>
          <span className="text-xs bg-stone-100 dark:bg-stone-700/80 font-bold px-2.5 py-1 rounded-full text-stone-600 dark:text-stone-300">
            {devicePdfs.length} saved
          </span>
        </div>

        {devicePdfs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-stone-200 dark:border-stone-700 rounded-xl text-stone-400 dark:text-stone-500 text-xs">
            <Download className="w-6 h-6 mx-auto mb-1.5 opacity-60" />
            <p className="font-semibold">No PDFs saved yet</p>
            <p className="text-[11px] text-stone-400">Click &quot;Save PDF&quot; on any diagnosis to download and store it locally.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700/50">
            {devicePdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-200 break-all">{pdf.filename}</p>
                    <p className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                      <span>{pdf.appliance}</span>
                      <span>•</span>
                      <span>{Math.round(pdf.fileSizeBytes / 1024)} KB</span>
                      <span>•</span>
                      <span>{new Date(pdf.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => downloadExistingPdfFromStorage(pdf)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold transition-colors"
                    title="Download to device storage"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSavedPdf(pdf.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete from local storage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
