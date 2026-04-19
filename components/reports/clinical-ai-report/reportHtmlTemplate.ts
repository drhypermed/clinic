import { formatUserDateTime } from '../../../utils/cairoTime';

import type {
  ClinicalReportLanguage,
  ClinicalVisitSnapshot,
  OpenClinicalAiReportWindowInput,
} from './types';

// ─── Utilities ────────────────────────────────────────────────────────────────

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toText = (value: unknown): string => String(value ?? '').trim();

const truncate = (value: unknown, limit = 1200): string => {
  const t = toText(value);
  return !t ? '' : t.length <= limit ? t : `${t.slice(0, limit)}\u2026`;
};

// ─── Localised labels ─────────────────────────────────────────────────────────

const buildLabels = (language: ClinicalReportLanguage) => {
  if (language === 'ar') {
    return {
      dir: 'rtl', lang: 'ar',
      reportTitle: '\u0627\u0644\u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u0637\u0628\u064a',
      patientSection: '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0631\u064a\u0636',
      patientName: '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644',
      fileNumber: '\u0631\u0642\u0645 \u0627\u0644\u0645\u0644\u0641',
      age: '\u0627\u0644\u0633\u0646',
      phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
      doctorSection: '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0637\u0628\u064a\u0628',
      doctorName: '\u0627\u0644\u0637\u0628\u064a\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062c',
      reportDate: '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062a\u0642\u0631\u064a\u0631',
      totalVisits: '\u0632\u064a\u0627\u0631\u0629', exams: '\u0643\u0634\u0641', consultations: '\u0627\u0633\u062a\u0634\u0627\u0631\u0629',
      clinicalSummary: '\u0627\u0644\u0645\u0644\u062e\u0635 \u0627\u0644\u0633\u0631\u064a\u0631\u064a \u0644\u0644\u062d\u0627\u0644\u0629',
      visitHistory: '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0637\u0628\u064a\u0629',
      visitHistoryNote: '\u062c\u0645\u064a\u0639 \u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0645\u0631\u062a\u0628\u0629 \u0645\u0646 \u0627\u0644\u0623\u062d\u062f\u062b \u0625\u0644\u0649 \u0627\u0644\u0623\u0642\u062f\u0645',
      examBadge: '\u0643\u0634\u0641', consultBadge: '\u0627\u0633\u062a\u0634\u0627\u0631\u0629',
      complaint: '\u0627\u0644\u0634\u0643\u0648\u0649', history: '\u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0645\u0631\u0636\u064a',
      examination: '\u0627\u0644\u0641\u062d\u0635 \u0627\u0644\u0633\u0631\u064a\u0631\u064a', investigations: '\u0627\u0644\u0641\u062d\u0648\u0635\u0627\u062a \u0648\u0627\u0644\u062a\u062d\u0627\u0644\u064a\u0644',
      diagnosis: '\u0627\u0644\u062a\u0634\u062e\u064a\u0635', medications: '\u0627\u0644\u0623\u062f\u0648\u064a\u0629 \u0627\u0644\u0645\u0648\u0635\u0648\u0641\u0629',
      advice: '\u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0627\u0644\u0637\u0628\u064a\u0629', vitals: '\u0627\u0644\u0642\u064a\u0627\u0633\u0627\u062a \u0627\u0644\u062d\u064a\u0648\u064a\u0629',
      noData: '\u2014',
      signatureTitle: '\u0627\u0644\u062a\u0648\u0642\u064a\u0639 \u0648\u0627\u0644\u0627\u0639\u062a\u0645\u0627\u062f',
      doctorSig: '\u062a\u0648\u0642\u064a\u0639 \u0627\u0644\u0637\u0628\u064a\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062c', clinicStamp: '\u062e\u062a\u0645 \u0627\u0644\u0637\u0628\u064a\u0628',
      legalNote: '\u0647\u0630\u0627 \u0627\u0644\u062a\u0642\u0631\u064a\u0631 \u0645\u064f\u0648\u0644\u064e\u0651\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u064b\u0627 \u0645\u0646 \u0646\u0638\u0627\u0645 \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u064a\u0627\u062f\u0629 \u0648\u064a\u064f\u0639\u062a\u0645\u062f \u0628\u062a\u0648\u0642\u064a\u0639 \u0648\u062e\u062a\u0645 \u0627\u0644\u0637\u0628\u064a\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062c.',
      editHint: '\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0623\u064a \u062d\u0642\u0644 \u0644\u062a\u0639\u062f\u064a\u0644\u0647 \u0642\u0628\u0644 \u0627\u0644\u0637\u0628\u0627\u0639\u0629',
      print: '\u0637\u0628\u0627\u0639\u0629', close: '\u0625\u063a\u0644\u0627\u0642',
      notDocumented: '\u063a\u064a\u0631 \u0645\u0648\u062b\u0642', linkedExam: '\u0645\u0631\u062a\u0628\u0637\u0629 \u0628\u0643\u0634\u0641',
      sourceNote: 'Dr. Hyper \u2014 \u0646\u0638\u0627\u0645 \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u064a\u0627\u062f\u0629',
    };
  }
  return {
    dir: 'ltr', lang: 'en',
    reportTitle: 'Medical Report',
    patientSection: 'Patient Information', patientName: 'Full Name', fileNumber: 'File Number',
    age: 'Age', phone: 'Phone', doctorSection: 'Doctor Information', doctorName: 'Treating Doctor',
    reportDate: 'Report Date', totalVisits: 'visit', exams: 'exam', consultations: 'consultation',
    clinicalSummary: 'Clinical Summary',
    visitHistory: 'Medical Visit History', visitHistoryNote: 'All visits listed from newest to oldest',
    examBadge: 'Examination', consultBadge: 'Consultation', complaint: 'Chief Complaint',
    history: 'Medical History', examination: 'Clinical Examination', investigations: 'Investigations',
    diagnosis: 'Diagnosis', medications: 'Prescribed Medications', advice: 'Medical Instructions',
    vitals: 'Vital Signs', noData: '\u2014', signatureTitle: 'Signature & Authorization',
    doctorSig: 'Doctor Signature', clinicStamp: 'Doctor Stamp',
    legalNote: "This report is electronically generated and authorized by the treating doctor's signature and clinic stamp.",
    editHint: 'Click any field to edit before printing',
    print: 'Print', close: 'Close', notDocumented: 'Not documented', linkedExam: 'Linked to exam',
    sourceNote: 'Dr. Hyper \u2014 Clinic Management System',
  };
};

// ─── Per-visit sub-renderers ──────────────────────────────────────────────────

/** Returns empty string for any content that is effectively blank or a known placeholder */
const isEmpty = (value: unknown): boolean => {
  const t = toText(value);
  if (!t) return true;
  // Skip dash placeholders and common "no data" strings
  const lower = t.toLowerCase();
  return lower === '—' || lower === '-' || lower === 'n/a' || lower === 'na' || lower === 'none' || lower === 'null';
};

const renderField = (label: string, value: string | null | undefined, highlight = false): string => {
  const text = truncate(value, 1200);
  if (isEmpty(text)) return '';
  return `<div class="vf${highlight ? ' vf--h' : ''}"><span class="vf-label">${escapeHtml(label)}</span><div class="vf-val" contenteditable="true" spellcheck="false">${escapeHtml(text)}</div></div>`;
};

const renderList = (label: string, items: string[]): string => {
  const filtered = items.filter(i => !isEmpty(i)).slice(0, 20);
  if (!filtered.length) return '';
  return `<div class="vf"><span class="vf-label">${escapeHtml(label)}</span><ul class="med-list">${filtered.map(m => `<li contenteditable="true" spellcheck="false">${escapeHtml(truncate(m, 400))}</li>`).join('')}</ul></div>`;
};

const renderMedicationList = (label: string, items: string[]): string => {
  const filtered = items.filter(i => !isEmpty(i)).slice(0, 20);
  if (!filtered.length) return '';
  const cards = filtered.map(m => {
    const colonIdx = m.indexOf(': ');
    const name = colonIdx > -1 ? m.slice(0, colonIdx).trim() : m.trim();
    const detail = colonIdx > -1 ? m.slice(colonIdx + 2).trim() : '';
    return `<div class="med-card"><div class="med-name" contenteditable="true" spellcheck="false">${escapeHtml(truncate(name, 200))}</div>${detail ? `<div class="med-detail" contenteditable="true" spellcheck="false">${escapeHtml(truncate(detail, 300))}</div>` : ''}</div>`;
  }).join('');
  return `<div class="vf"><span class="vf-label">${escapeHtml(label)}</span><div class="med-cards">${cards}</div></div>`;
};

const renderVitals = (visit: ClinicalVisitSnapshot, label: string): string => {
  const chips: Array<{ k: string; v: string }> = [
    { k: 'BP', v: toText(visit.vitals?.bp) },
    { k: 'Pulse', v: toText(visit.vitals?.pulse) },
    { k: 'Temp', v: toText(visit.vitals?.temp) },
    { k: 'RBS', v: toText(visit.vitals?.rbs) },
    { k: 'SpO\u2082', v: toText(visit.vitals?.spo2) },
    { k: 'RR', v: toText(visit.vitals?.rr) },
    { k: 'Wt', v: toText(visit.weight) },
    { k: 'Ht', v: toText(visit.height) },
    { k: 'BMI', v: toText(visit.bmi) },
  ].filter(c => c.v);
  if (!chips.length) return '';
  return `<div class="vf"><span class="vf-label">${escapeHtml(label)}</span><div class="vital-chips">${chips.map(c => `<span class="vchip"><b>${escapeHtml(c.k)}</b><span contenteditable="true" spellcheck="false"> ${escapeHtml(c.v)}</span></span>`).join('')}</div></div>`;
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const buildClinicalAiReportHtml = (input: OpenClinicalAiReportWindowInput): string => {
  const { snapshot, narrative, language, pageSize, doctorName, initialFontSize } = input;
  const L = buildLabels(language);
  const fs = Math.max(10, Math.min(22, Math.round(Number(initialFontSize) || 13)));
  const reportDate = formatUserDateTime(new Date());
  const doctorText = toText(doctorName) || L.notDocumented;
  const phoneText = toText(snapshot.patientPhone) || L.noData;
  const fileNumText =
    Number.isFinite(Number(snapshot.patientFileNumber)) && Number(snapshot.patientFileNumber) > 0
      ? `#${Number(snapshot.patientFileNumber)}`
      : L.noData;
  const ageText = language === 'ar' ? snapshot.patientAgeTextAr : snapshot.patientAgeTextEn;

  const allVisits = [...snapshot.visits].reverse();

  const summaryLines = (narrative.executiveSummary || []).filter(Boolean).slice(0, 6);
  const currentPicture = (narrative.currentClinicalPicture || []).filter(Boolean).slice(0, 3);
  const recommendations = (narrative.recommendations || []).filter(Boolean).slice(0, 3);

  const summaryBlock =
    summaryLines.length > 0
      ? `
  <div class="summary-block">
    <div class="sum-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
    <div class="sum-body">
      <div class="sum-head"><strong>${escapeHtml(L.clinicalSummary)}</strong></div>
      <ul class="sum-list">${summaryLines.map(l => `<li contenteditable="true" spellcheck="false">${escapeHtml(l)}</li>`).join('')}</ul>
      ${currentPicture.length ? `<ul class="sum-list" style="margin-top:8px">${currentPicture.map(l => `<li contenteditable="true" spellcheck="false">${escapeHtml(l)}</li>`).join('')}</ul>` : ''}
      ${recommendations.length ? `<div class="sum-recs">${recommendations.map(r => `<span class="rec-chip" contenteditable="true" spellcheck="false">${escapeHtml(r)}</span>`).join('')}</div>` : ''}
    </div>
  </div>`
      : '';

  const visitsHtml = allVisits
    .map((visit, idx) => {
      const isExam = visit.visitType === 'exam';
      const adviceItems = [...(visit.advice || []), ...(visit.labsAndNotes || [])].filter(Boolean).slice(0, 15);
      return `
    <div class="vcard">
      <div class="vhead">
        <div class="vhead-left">
          <span class="vnum">${idx + 1}</span>
          <div>
            <div class="vdate" contenteditable="true" spellcheck="false">${escapeHtml(visit.visitDateLabel)}</div>
            ${visit.sourceExamDateLabel ? `<div class="vsub">${escapeHtml(L.linkedExam)}: ${escapeHtml(visit.sourceExamDateLabel)}</div>` : ''}
          </div>
        </div>
        <span class="vbadge ${isExam ? 'vbadge--exam' : 'vbadge--con'}">${escapeHtml(isExam ? L.examBadge : L.consultBadge)}</span>
      </div>
      <div class="vbody">
        ${renderVitals(visit, L.vitals)}
        ${renderField(L.complaint, visit.complaint)}
        ${renderField(L.history, visit.history)}
        ${renderField(L.examination, visit.examination)}
        ${renderField(L.investigations, visit.investigations)}
        ${renderField(L.diagnosis, visit.diagnosis, true)}
        ${renderMedicationList(L.medications, visit.medications)}
        ${adviceItems.length ? renderList(L.advice, adviceItems) : ''}
      </div>
    </div>`;
    })
    .join('');

  const css = [
    `:root{--sz:${fs}px;--blue:#1a56a0;--blue-dk:#0e3a6e;--blue-lt:#e8f0fc;--teal:#0d7c7f;--teal-lt:#e6f5f5;--text:#1a2636;--soft:#56718a;--line:#dde6ef;--bg:#f0f4f9;--card:#fff;--r:14px}`,
    `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}`,
    `html{font-size:var(--sz);scroll-behavior:smooth}`,
    `body{font-family:"Cairo","IBM Plex Sans Arabic","Segoe UI",system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.7;direction:${L.dir}}`,
    `.toolbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.97);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 20px}`,
    `.tbr-grp{display:flex;gap:8px;align-items:center;flex-wrap:wrap}`,
    `.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--text);font:inherit;font-size:.82rem;font-weight:700;cursor:pointer;transition:.15s}`,
    `.btn:hover{background:#f0f5ff}`,
    `.btn-print{background:linear-gradient(135deg,#1a56a0,#0e3a6e);color:#fff;border-color:transparent}`,
    `.btn-print:hover{opacity:.92}`,
    `.btn-close{color:#c0392b;border-color:#f5c6c2}`,
    `.btn-close:hover{background:#fff5f5}`,
    `.tbr-right{display:flex;flex-direction:column;align-items:flex-end;gap:2px}`,
    `.tbr-info{font-size:.78rem;font-weight:700;color:var(--soft)}`,
    `.tbr-hint{font-size:.7rem;color:#7cb5b5;font-weight:600}`,
    `.page{max-width:900px;margin:20px auto 40px;background:var(--card);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(26,86,160,.1)}`,
    `.rpt-header{background:linear-gradient(135deg,#0e2d4a 0%,#1a56a0 55%,#1680a0 100%);color:#fff;padding:14px 22px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}`,
    `.rpt-title{font-size:1.6rem;font-weight:900;letter-spacing:-.02em;line-height:1.2}`,
    `.rpt-chips{display:flex;flex-direction:row;align-items:center;gap:6px;flex-wrap:wrap}`,
    `.rpt-chip{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);border-radius:8px;padding:3px 9px;font-size:.74rem;font-weight:700}`,
    `.info-grid{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--line)}`,
    `.info-panel{padding:18px 24px}`,
    `.info-panel+.info-panel{border-inline-start:1px solid var(--line)}`,
    `.info-eyebrow{font-size:.68rem;font-weight:900;letter-spacing:.07em;text-transform:uppercase;color:var(--blue);margin-bottom:12px}`,
    `.info-row{display:flex;gap:8px;align-items:baseline;margin-bottom:7px}`,
    `.info-lbl{font-size:.76rem;font-weight:700;color:var(--soft);flex-shrink:0;min-width:86px}`,
    `.info-val{font-size:.9rem;font-weight:800;outline:none;min-width:40px;cursor:text;border-bottom:1px dashed rgba(100,120,140,.2);padding-bottom:1px}`,
    `.info-val:focus{border-bottom-color:var(--blue)}`,
    `.stats-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}`,
    `.stat-chip{background:var(--blue-lt);color:var(--blue);border-radius:10px;padding:4px 10px;font-size:.76rem;font-weight:900;display:flex;align-items:center;gap:4px}`,
    `.stat-chip b{font-size:1rem}`,
    `.summary-block{display:flex;gap:12px;padding:14px 24px;background:linear-gradient(135deg,#f0f7ff,#f5faff);border-bottom:1px solid var(--line)}`,
    `.sum-icon{width:32px;height:32px;flex-shrink:0;background:var(--blue);color:#fff;border-radius:9px;display:flex;align-items:center;justify-content:center}`,
    `.sum-icon svg{width:16px;height:16px}`,
    `.sum-body{flex:1;min-width:0}`,
    `.sum-head{display:flex;align-items:center;gap:8px;margin-bottom:7px}`,
    `.sum-head strong{font-size:.9rem;font-weight:900;color:var(--blue)}`,
    `.sum-list{padding-inline-start:16px;display:grid;gap:4px}`,
    `.sum-list li{font-size:.86rem;line-height:1.6;outline:none;cursor:text}`,
    `.sum-list li:focus{color:var(--blue)}`,
    `.sum-recs{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}`,
    `.rec-chip{background:var(--teal-lt);color:var(--teal);border-radius:999px;padding:4px 10px;font-size:.76rem;font-weight:700;outline:none;cursor:text}`,
    `.rec-chip:focus{outline:2px solid var(--teal)}`,
    `.sec-title{padding:14px 24px 0}`,
    `.sec-title h2{font-size:.95rem;font-weight:900;color:var(--text);display:flex;align-items:center;gap:8px}`,
    `.sec-title h2::before{content:'';width:4px;height:15px;flex-shrink:0;background:linear-gradient(180deg,var(--blue),var(--teal));border-radius:4px}`,
    `.sec-title p{font-size:.76rem;color:var(--soft);margin-top:3px;padding-inline-start:12px}`,
    `.visits-list{padding:12px 24px 22px;display:grid;gap:10px}`,
    `.vcard{border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--card)}`,
    `.vhead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 13px;background:#f7f9fc;border-bottom:1px solid var(--line)}`,
    `.vhead-left{display:flex;align-items:center;gap:9px}`,
    `.vnum{width:24px;height:24px;flex-shrink:0;background:var(--blue);color:#fff;border-radius:6px;font-size:.76rem;font-weight:900;display:flex;align-items:center;justify-content:center}`,
    `.vdate{font-size:.86rem;font-weight:800;line-height:1.3;outline:none;cursor:text;min-width:40px}`,
    `.vdate:focus{color:var(--blue)}`,
    `.vsub{font-size:.7rem;color:var(--soft);margin-top:2px}`,
    `.vbadge{padding:3px 10px;border-radius:999px;font-size:.72rem;font-weight:900}`,
    `.vbadge--exam{background:var(--blue-lt);color:var(--blue)}`,
    `.vbadge--con{background:var(--teal-lt);color:var(--teal)}`,
    `.vbody{padding:10px 13px;display:grid;gap:8px}`,
    `.vf{display:grid;gap:3px}`,
    `.vf-label{font-size:.66rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:var(--soft)}`,
    `.vf--h .vf-label{color:var(--teal)}`,
    `.vf-val{font-size:.86rem;line-height:1.65;white-space:pre-wrap;word-break:break-word;outline:none;min-height:1em;cursor:text;border-bottom:1px dashed rgba(100,120,140,.18);padding-bottom:2px}`,
    `.vf-val:hover{background:rgba(26,86,160,.03);border-radius:3px}`,
    `.vf-val:focus{border-bottom-color:var(--blue);background:rgba(26,86,160,.04);border-radius:3px}`,
    `.vf--h .vf-val{font-weight:700;color:var(--teal)}`,
    `.vf--h .vf-val:focus{border-bottom-color:var(--teal);background:rgba(13,124,127,.04)}`,
    `.med-list{padding-inline-start:16px;display:grid;gap:3px}`,
    `.med-list li{font-size:.84rem;line-height:1.6;outline:none;cursor:text;border-bottom:1px dashed rgba(100,120,140,.14);padding-bottom:2px}`,
    `.med-list li:focus{color:var(--blue)}`,
    `.med-cards{display:grid;gap:5px}`,
    `.med-card{border:1px solid var(--line);border-radius:8px;padding:7px 10px;background:#fafcff}`,
    `.med-name{font-size:.88rem;font-weight:800;outline:none;cursor:text;min-width:10px;line-height:1.4}`,
    `.med-name:focus{color:var(--blue)}`,
    `.med-detail{font-size:.78rem;color:var(--soft);margin-top:3px;outline:none;cursor:text;line-height:1.5;min-width:10px}`,
    `.med-detail:focus{color:var(--blue)}`,
    `.pf-url{display:none}`,
    `.med-card:hover{background:#f0f5ff}`,
    `.vital-chips{display:flex;flex-wrap:wrap;gap:5px}`,
    `.vchip{background:#f0f5ff;border:1px solid #c6d9f5;border-radius:8px;padding:3px 8px;font-size:.76rem;color:var(--text);display:inline-flex;align-items:center}`,
    `.vchip b{color:var(--blue);font-weight:800;margin-inline-end:2px}`,
    `.vchip span{outline:none;cursor:text;min-width:10px}`,
    `.vchip span:focus{color:var(--blue)}`,
    `.sig-section{padding:18px 24px;border-top:1px solid var(--line)}`,
    `.sig-title{font-size:.82rem;font-weight:900;margin-bottom:12px;display:flex;align-items:center;gap:7px}`,
    `.sig-title::before{content:'';width:4px;height:13px;flex-shrink:0;background:linear-gradient(180deg,var(--blue),var(--teal));border-radius:4px}`,
    `.sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}`,
    `.sigbox{border:1px solid var(--line);border-radius:12px;padding:12px 14px;min-height:80px;display:flex;flex-direction:column;justify-content:space-between}`,
    `.sigbox-lbl{font-size:.72rem;font-weight:800;color:var(--soft)}`,
    `.sigbox-name{font-size:.9rem;font-weight:900;outline:none;cursor:text;min-width:40px}`,
    `.sigbox-name:focus{color:var(--blue)}`,
    `.sig-line{height:1px;background:var(--line);margin-top:8px}`,
    `.legal-note{margin-top:10px;padding:10px 13px;background:#f8fafc;border:1px solid var(--line);border-radius:10px;font-size:.74rem;color:var(--soft);line-height:1.75}`,
    `.rpt-footer{padding:10px 24px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:.7rem;color:var(--soft);font-weight:600}`,
    `@media print{`,
    `@page{size:${pageSize};margin:12mm 10mm 18mm}`,
    `.toolbar{display:none!important}`,
    `body{background:#fff}`,
    `.page{max-width:none;margin:0;border:none;border-radius:0;box-shadow:none;overflow:visible}`,
    `.rpt-header{-webkit-print-color-adjust:exact;print-color-adjust:exact;break-inside:avoid}`,
    `.info-grid{break-inside:avoid}`,
    `.summary-block{break-inside:avoid}`,
    `.vcard{break-inside:avoid;page-break-inside:avoid;margin-bottom:6px}`,
    `.sig-section{break-inside:avoid}`,
    `[contenteditable]{border-bottom:none!important;background:transparent!important;outline:none!important}`,
    `.rpt-footer{display:none}`,
    `.pf-url{display:block;position:fixed;bottom:0;left:0;right:0;text-align:center;font-size:8.5pt;color:#777;font-family:sans-serif;padding:3mm 0;letter-spacing:.02em}`,
    `.med-card{background:transparent!important}`,
    `.med-card:hover{background:transparent!important}`,
    `}`,
    `@media(max-width:640px){`,
    `.page{margin:0;border-radius:0;border-inline:none;box-shadow:none}`,
    `.rpt-header{padding:16px 16px 13px}.rpt-title{font-size:1.3rem}`,
    `.info-grid{grid-template-columns:1fr}`,
    `.info-panel+.info-panel{border-inline-start:none;border-top:1px solid var(--line)}`,
    `.info-panel,.visits-list,.sig-section,.sec-title,.summary-block{padding-inline:14px}`,
    `.sig-grid{grid-template-columns:1fr}`,
    `}`,
  ].join('');

  return `<!doctype html>
<html lang="${L.lang}" dir="${L.dir}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(L.reportTitle)} \u2014 ${escapeHtml(snapshot.patientName)}</title>
<style>${css}</style>
</head>
<body>
<div class="toolbar">
  <div class="tbr-grp">
    <button id="btn-print" class="btn btn-print"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>${escapeHtml(L.print)}</button>
    <button id="btn-close" class="btn btn-close"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>${escapeHtml(L.close)}</button>
  </div>
  <div class="tbr-right">
    <span class="tbr-info">${escapeHtml(snapshot.patientName)} \u00b7 ${escapeHtml(reportDate)}</span>
    <span class="tbr-hint">\u270e ${escapeHtml(L.editHint)}</span>
  </div>
</div>
<div class="page">
  <div class="rpt-header">
    <div><div class="rpt-title">${escapeHtml(L.reportTitle)}</div></div>
    <div class="rpt-chips">
      <span class="rpt-chip">${escapeHtml(snapshot.patientName)}</span>
      <span class="rpt-chip">${escapeHtml(L.fileNumber)}: ${escapeHtml(fileNumText)}</span>
      <span class="rpt-chip">${escapeHtml(L.reportDate)}: ${escapeHtml(reportDate)}</span>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-panel">
      <div class="info-eyebrow">${escapeHtml(L.patientSection)}</div>
      <div class="info-row"><span class="info-lbl">${escapeHtml(L.patientName)}</span><span class="info-val" contenteditable="true" spellcheck="false">${escapeHtml(snapshot.patientName)}</span></div>
      <div class="info-row"><span class="info-lbl">${escapeHtml(L.age)}</span><span class="info-val" contenteditable="true" spellcheck="false">${escapeHtml(ageText)}</span></div>
      <div class="info-row"><span class="info-lbl">${escapeHtml(L.phone)}</span><span class="info-val" contenteditable="true" spellcheck="false">${escapeHtml(phoneText)}</span></div>
    </div>
    <div class="info-panel">
      <div class="info-eyebrow">${escapeHtml(L.doctorSection)}</div>
      <div class="info-row"><span class="info-lbl">${escapeHtml(L.doctorName)}</span><span class="info-val" contenteditable="true" spellcheck="false">${escapeHtml(doctorText)}</span></div>
      <div class="stats-row">
        <div class="stat-chip"><b>${escapeHtml(String(snapshot.visitCount))}</b>${escapeHtml(L.totalVisits)}</div>
        <div class="stat-chip"><b>${escapeHtml(String(snapshot.examCount))}</b>${escapeHtml(L.exams)}</div>
        <div class="stat-chip"><b>${escapeHtml(String(snapshot.consultationCount))}</b>${escapeHtml(L.consultations)}</div>
      </div>
    </div>
  </div>
  ${summaryBlock}
  <div class="sec-title"><h2>${escapeHtml(L.visitHistory)}</h2><p>${escapeHtml(L.visitHistoryNote)}</p></div>
  <div class="visits-list">${visitsHtml || `<div style="padding:20px;color:#888;text-align:center">${escapeHtml(L.noData)}</div>`}</div>
  <div class="sig-section">
    <div class="sig-title">${escapeHtml(L.signatureTitle)}</div>
    <div class="sig-grid">
      <div class="sigbox"><div class="sigbox-lbl">${escapeHtml(L.doctorSig)}</div><div class="sigbox-name" contenteditable="true" spellcheck="false">${escapeHtml(doctorText)}</div><div class="sig-line"></div></div>
      <div class="sigbox"><div class="sigbox-lbl">${escapeHtml(L.clinicStamp)}</div><div class="sigbox-name" contenteditable="true" spellcheck="false"> </div><div class="sig-line"></div></div>
    </div>
    <div class="legal-note" contenteditable="true" spellcheck="false">${escapeHtml(L.legalNote)}</div>
  </div>
  <div class="rpt-footer"><span>${escapeHtml(L.sourceNote)}</span><span>${escapeHtml(reportDate)}</span></div>
</div>
<div class="pf-url">www.drhypermed.com</div>
<script>
(function(){
  var p=document.getElementById('btn-print');
  var c=document.getElementById('btn-close');
  if(p)p.addEventListener('click',function(){window.print();});
  if(c)c.addEventListener('click',function(){
    if(window.parent&&window.parent!==window){window.parent.postMessage({type:'close-clinical-ai-report'},'*');}
    else{window.close();}
  });
})();
</script>
</body>
</html>`;
};
