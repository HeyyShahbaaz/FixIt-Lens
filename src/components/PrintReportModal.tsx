import React, { useState } from 'react';
import { X, Printer, Download, Check, AlertOctagon } from 'lucide-react';
import { SavedDiagnosis, Language } from '../types/diagnosis';
import { generateAndDownloadReportPdf } from '../utils/pdfExport';

interface Props {
  diagnosis: SavedDiagnosis | null;
  onClose: () => void;
  language: Language;
}

export const PrintReportModal: React.FC<Props> = ({ diagnosis, onClose, language }) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!diagnosis) return null;

  const handleDownloadPdf = () => {
    try {
      const record = generateAndDownloadReportPdf(diagnosis);
      setDownloadNotice(`Saved "${record.filename}" to device storage!`);
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (e) {
      console.error('PDF export error:', e);
      // Fallback to print dialog
      window.print();
    }
  };

  const handlePrint = () => {
    console.log("Print button clicked successfully!");
    window.print();
  };

  const d = diagnosis.diagnosis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="bg-white text-stone-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 print:shadow-none print:max-h-none print:w-full print:border-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base">Diagnosis Report</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Download PDF directly to your device local storage"
            >
              <Download className="w-4 h-4" />
              <span>Save PDF to Device</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="Open browser print dialog"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-stone-400 hover:text-stone-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download notification banner */}
        {downloadNotice && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-800 print:hidden animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadNotice} (saved to Downloads folder & local backup)</span>
          </div>
        )}

        {/* Printable Header */}
        <div className="space-y-2 border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-stone-900">
                FixIt Lens <span className="text-amber-600">Report</span>
              </h1>
              <p className="text-xs text-stone-500">AI Visual & Acoustic Appliance Diagnosis</p>
            </div>
            <div className="text-right text-xs text-stone-500">
              <p className="font-bold">Date: {new Date(diagnosis.timestamp).toLocaleDateString()}</p>
              <p>Status: {diagnosis.status.toUpperCase()}</p>
            </div>
          </div>

          <div className="pt-2 text-sm">
            <p>
              <span className="font-bold">Appliance:</span> {diagnosis.appliance}{' '}
              {diagnosis.modelNumber ? `(${diagnosis.modelNumber})` : ''}
            </p>
            {diagnosis.extraNotes && (
              <p>
                <span className="font-bold">User Notes:</span> {diagnosis.extraNotes}
              </p>
            )}
          </div>
        </div>

        {/* Safety Warnings */}
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold uppercase">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <span>Safety First Mandatory Warnings</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-red-900 font-medium">
            {d.safety_warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>

        {/* Problem Summary & Verdict */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-stone-600">Problem Summary</h4>
          <p className="text-sm font-semibold text-stone-800 bg-stone-50 p-3 rounded-xl border">
            {d.problem_summary}
          </p>
        </div>

        {/* Suspected Causes */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-stone-600">Likely Causes</h4>
          <div className="space-y-1.5">
            {d.likely_causes.map((c, i) => (
              <div key={i} className="flex justify-between border-b pb-1">
                <span className="font-medium text-stone-800">
                  {i + 1}. {c.cause}
                </span>
                <span className="font-bold text-amber-700">
                  {c.probability_percent}% ({c.confidence} confidence)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Fix Steps */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-stone-600">Repair Steps Checklist</h4>
          <div className="space-y-2">
            {d.fix_steps.map((s) => (
              <div key={s.step} className="p-2.5 rounded-lg border bg-stone-50/50 space-y-1">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>
                    Step {s.step}: {s.instruction}
                  </span>
                  <span>{diagnosis.completedSteps?.includes(s.step) ? '✓ Done' : '[ ] Pending'}</span>
                </div>
                {s.tools_needed?.length > 0 && (
                  <p className="text-[11px] text-stone-500">Tools: {s.tools_needed.join(', ')}</p>
                )}
                {s.warning && <p className="text-[11px] text-red-700">Warning: {s.warning}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Parts Estimated */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-stone-600">Parts & Estimated Costs</h4>
          <div className="grid grid-cols-2 gap-2">
            {d.tools_and_parts_list.map((p, i) => (
              <div key={i} className="border p-2 rounded-lg flex justify-between">
                <span>{p.item}</span>
                <span className="font-bold text-amber-700">{p.approx_price_inr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verdict Summary */}
        <div className="border-t pt-4 text-xs flex justify-between items-center text-stone-600">
          <div>
            <p>
              <span className="font-bold">Verdict:</span> {d.verdict?.decision.toUpperCase()} • Time:{' '}
              {d.verdict?.time_needed}
            </p>
            <p className="mt-0.5">Est. DIY: {d.verdict?.estimated_diy_cost_inr} | Est. Pro: {d.verdict?.estimated_pro_cost_inr}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-stone-400">Generated by FixIt Lens</p>
          </div>
        </div>
      </div>
    </div>
  );
};
