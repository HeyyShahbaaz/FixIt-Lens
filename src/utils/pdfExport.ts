import { jsPDF } from 'jspdf';
import { SavedDiagnosis, SavedDevicePdf } from '../types/diagnosis';

const STORAGE_PDF_KEY = 'fixit_lens_saved_device_pdfs';

/**
 * Generates a clean, comprehensive PDF breakdown diagnosis report,
 * saves it directly to the user's device storage (Downloads / Files),
 * and persists the generated PDF file record in localStorage for offline access.
 */
export function generateAndDownloadReportPdf(savedRecord: SavedDiagnosis): SavedDevicePdf {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const d = savedRecord.diagnosis;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawPageHeader(true);
    }
  };

  const drawPageHeader = (isContinuation = false) => {
    // Amber top accent bar
    doc.setFillColor(217, 119, 6);
    doc.rect(margin, y, contentWidth, 2, 'F');
    y += 5;

    if (isContinuation) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 113, 108);
      doc.text(`FixIt Lens Diagnosis Report • ${savedRecord.appliance} (continued)`, margin, y);
      y += 6;
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;
    }
  };

  // First page header
  drawPageHeader(false);

  // App Title & Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(28, 25, 23); // stone-900
  doc.text('FixIt Lens', margin, y + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text('REPAIR DIAGNOSIS REPORT', margin + 35, y + 4);

  // Date and Record Details on right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date(savedRecord.timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`Date: ${dateStr}`, pageWidth - margin, y + 1, { align: 'right' });
  doc.text(`Status: ${savedRecord.status.toUpperCase()}`, pageWidth - margin, y + 5.5, { align: 'right' });

  y += 11;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // Appliance & Model Box
  doc.setFillColor(245, 245, 244);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Appliance: ${savedRecord.appliance}`, margin + 3, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const modelText = savedRecord.modelNumber ? `Model: ${savedRecord.modelNumber}` : 'Model: Not specified';
  doc.text(modelText, margin + 3, y + 10.5);

  const urgencyText = `Urgency: ${(d.urgency || 'fix_this_week').replace('_', ' ').toUpperCase()}`;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(d.urgency === 'fix_now' ? 185 : 80, d.urgency === 'fix_now' ? 28 : 80, 28);
  doc.text(urgencyText, pageWidth - margin - 3, y + 5.5, { align: 'right' });

  const verdictBadge = `Verdict: ${(d.verdict?.decision || 'diy').replace(/_/g, ' ').toUpperCase()}`;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(verdictBadge, pageWidth - margin - 3, y + 10.5, { align: 'right' });

  y += 18;

  // 1. SAFETY FIRST WARNINGS (Mandatory Red Box)
  checkPageBreak(30);
  const warnings = d.safety_warnings || [];
  const warningLines: string[] = [];
  warnings.forEach((w) => {
    const wrapped = doc.splitTextToSize(`• ${w}`, contentWidth - 8);
    warningLines.push(...wrapped);
  });

  const warningBoxHeight = Math.max(16, 8 + warningLines.length * 4.5);
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(239, 68, 68); // red-500
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, warningBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text('CRITICAL SAFETY WARNINGS (MANDATORY BEFORE ANY REPAIR)', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(127, 29, 29); // red-900
  let warnY = y + 10;
  warningLines.forEach((line) => {
    doc.text(line, margin + 4, warnY);
    warnY += 4.2;
  });

  y += warningBoxHeight + 6;

  // 2. Problem Summary
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text('PROBLEM SUMMARY', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  const summaryLines = doc.splitTextToSize(d.problem_summary || '', contentWidth);
  summaryLines.forEach((line: string) => {
    checkPageBreak(5);
    doc.text(line, margin, y);
    y += 4.5;
  });
  y += 3;

  // 3. Visual & Audio Observations
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text('WHAT WAS OBSERVED (VISUAL & ACOUSTIC CUES)', margin, y);
  y += 5;

  const visualObs = d.observations?.visual || [];
  const audioObs = d.observations?.audio || [];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Visual Observations:', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  visualObs.forEach((obs) => {
    const wrapped = doc.splitTextToSize(`- ${obs}`, contentWidth - 4);
    wrapped.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 2, y);
      y += 4.2;
    });
  });

  y += 2;
  checkPageBreak(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Acoustic & Sound Analysis:', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  audioObs.forEach((obs) => {
    const wrapped = doc.splitTextToSize(`- ${obs}`, contentWidth - 4);
    wrapped.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 2, y);
      y += 4.2;
    });
  });

  y += 4;

  // 4. Likely Causes
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text('LIKELY CAUSES & PROBABILITY', margin, y);
  y += 5;

  const causes = d.likely_causes || [];
  causes.forEach((cause, idx) => {
    checkPageBreak(12);
    doc.setFillColor(250, 250, 249);
    doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text(`${idx + 1}. ${cause.cause}`, margin + 3, y + 4.5);

    const probBadge = `${cause.probability_percent}% • ${cause.confidence.toUpperCase()}`;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text(probBadge, pageWidth - margin - 3, y + 4.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    const reasoningWrapped = doc.splitTextToSize(cause.reasoning || '', contentWidth - 6);
    doc.text(reasoningWrapped[0] || '', margin + 3, y + 8.2);

    y += 12;
  });

  y += 2;

  // 5. Step-by-Step Fix Guide
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text('STEP-BY-STEP REPAIR CHECKLIST', margin, y);
  y += 5;

  const steps = d.fix_steps || [];
  const completed = savedRecord.completedSteps || [];

  steps.forEach((step) => {
    const isDone = completed.includes(step.step);
    const checkStatus = isDone ? '[DONE] ' : '[ ] ';
    const instructionLines = doc.splitTextToSize(
      `${checkStatus}Step ${step.step}: ${step.instruction}`,
      contentWidth - 6
    );

    const toolStr = step.tools_needed?.length ? `Tools needed: ${step.tools_needed.join(', ')}` : '';
    const warnStr = step.warning ? `Warning: ${step.warning}` : '';
    const stepHeight = 7 + instructionLines.length * 4.2 + (toolStr ? 3.5 : 0) + (warnStr ? 3.5 : 0);

    checkPageBreak(stepHeight);

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, y, contentWidth, stepHeight, 1.5, 1.5, 'S');

    doc.setFont('helvetica', isDone ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(isDone ? 22 : 30, isDone ? 101 : 30, isDone ? 52 : 30);

    let curY = y + 4.5;
    instructionLines.forEach((line: string) => {
      doc.text(line, margin + 3, curY);
      curY += 4.2;
    });

    if (toolStr) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 110);
      doc.text(toolStr, margin + 3, curY);
      curY += 3.5;
    }

    if (warnStr) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(185, 28, 28);
      doc.text(warnStr, margin + 3, curY);
    }

    y += stepHeight + 3;
  });

  y += 3;

  // 6. Tools & Replacement Parts with INR prices
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text('REQUIRED TOOLS & REPLACEMENT PARTS (INDIA INR ESTIMATES)', margin, y);
  y += 5;

  const parts = d.tools_and_parts_list || [];
  parts.forEach((part) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    doc.text(`• ${part.item}`, margin + 2, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    const cleanPrice = part.approx_price_inr.replace(/₹/g, 'Rs. ');
    doc.text(cleanPrice, pageWidth - margin, y, { align: 'right' });
    y += 5;
  });

  y += 3;

  // 7. Verdict Card
  checkPageBreak(28);
  doc.setFillColor(245, 245, 244);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(28, 25, 23);
  const verdictTitle = d.verdict?.decision === 'call_a_pro'
    ? 'TECHNICIAN VERDICT: CALL A LICENSED PROFESSIONAL'
    : d.verdict?.decision === 'diy_with_caution'
    ? 'TECHNICIAN VERDICT: DIY WITH CAUTION'
    : 'TECHNICIAN VERDICT: SAFE FOR DIY REPAIR';
  doc.text(verdictTitle, margin + 3, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  const reasonLines = doc.splitTextToSize(d.verdict?.reason || '', contentWidth - 6);
  doc.text(reasonLines[0] || '', margin + 3, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const diyPrice = (d.verdict?.estimated_diy_cost_inr || 'N/A').replace(/₹/g, 'Rs. ');
  const proPrice = (d.verdict?.estimated_pro_cost_inr || 'N/A').replace(/₹/g, 'Rs. ');
  const diffStr = `Est. DIY: ${diyPrice} | Est. Pro: ${proPrice} | Difficulty: ${(d.verdict?.difficulty || 'easy').toUpperCase()} | Time: ${d.verdict?.time_needed || '15 mins'}`;
  doc.text(diffStr, margin + 3, y + 17);

  y += 28;

  // 8. Long-term Maintenance Tips
  const tips = d.maintenance_tips || [];
  if (tips.length > 0) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    doc.text('LONG-TERM PREVENTIVE MAINTENANCE TIPS', margin, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    tips.forEach((tip) => {
      checkPageBreak(5);
      const wrapped = doc.splitTextToSize(`• ${tip}`, contentWidth - 4);
      wrapped.forEach((line: string) => {
        doc.text(line, margin + 2, y);
        y += 4;
      });
    });
  }

  // Stamp footers on all pages
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      'FixIt Lens • AI Household Breakdown Diagnoser • ISO 12100 Safety Precaution Notice: AI suggestions are not a substitute for qualified service.',
      margin,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  // 1. Generate clean filename and trigger immediate device storage download
  const cleanApplianceName = (savedRecord.appliance || 'Appliance').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `FixIt-Lens-Report-${cleanApplianceName}-${dateStr.replace(/\s+/g, '_')}.pdf`;
  
  // Direct device file download to local storage (Downloads / Files on phone/PC)
  doc.save(filename);

  // 2. Also serialize as data URI and persist record in browser localStorage
  const dataUri = doc.output('datauristring');
  const fileSizeBytes = Math.round((dataUri.length * 3) / 4);

  const devicePdfRecord: SavedDevicePdf = {
    id: `pdf-${Date.now()}`,
    diagnosisId: savedRecord.id,
    filename,
    appliance: savedRecord.appliance,
    timestamp: Date.now(),
    dataUri,
    fileSizeBytes
  };

  saveDevicePdfToStorage(devicePdfRecord);

  return devicePdfRecord;
}

/**
 * Returns list of PDF reports saved locally in browser storage
 */
export function getSavedDevicePdfs(): SavedDevicePdf[] {
  try {
    const raw = localStorage.getItem(STORAGE_PDF_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading saved device PDFs from localStorage', e);
    return [];
  }
}

/**
 * Adds a new PDF record into browser storage
 */
export function saveDevicePdfToStorage(record: SavedDevicePdf): void {
  try {
    const current = getSavedDevicePdfs();
    // Keep max 15 recent PDFs to avoid filling localStorage quota
    const updated = [record, ...current.filter((p) => p.diagnosisId !== record.diagnosisId)].slice(0, 15);
    localStorage.setItem(STORAGE_PDF_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed storing PDF into localStorage', e);
  }
}

/**
 * Re-downloads an existing PDF from localStorage to the device
 */
export function downloadExistingPdfFromStorage(pdfRecord: SavedDevicePdf): void {
  try {
    const link = document.createElement('a');
    link.href = pdfRecord.dataUri;
    link.download = pdfRecord.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('Failed downloading existing PDF', e);
  }
}

/**
 * Deletes a saved PDF record from localStorage
 */
export function deleteSavedDevicePdf(id: string): void {
  try {
    const current = getSavedDevicePdfs();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_PDF_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed deleting PDF from localStorage', e);
  }
}
