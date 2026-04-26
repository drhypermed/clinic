/**
 * insuranceStatementPrintUtils.ts — كشف تفصيلي لمطالبات شركة تأمين
 *
 * بيطبع جدول صف لكل حالة (مريض + كارنيه + تاريخ + نوع + مبلغ + كود موافقة)
 * عشان شركات التأمين تقدر تراجع وتثبت إن الطبيب اشتغل فعلاً.
 *
 * بيستعمل نفس آلية window.open + window.print الموجودة في invoicePrintUtils.
 * صفر تكلفة Firebase — كل البيانات بتيجي محملة من records في الذاكرة.
 */

import type { PrescriptionSettings } from '../../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

/** نوع الخدمة في صف من الكشف التفصيلي. */
type DetailedClaimRowType = 'exam' | 'consultation' | 'intervention' | 'other';

/** صف واحد في الكشف التفصيلي (حالة واحدة). */
export interface DetailedClaimRow {
  /** اسم المريض — قد يكون فارغ في حالة الـ extras اليدوية اللي مش متربطة بملف */
  patientName: string;
  /** رقم كارنيه التأمين */
  membershipId?: string;
  /** كود موافقة الشركة */
  approvalCode?: string;
  /** تاريخ الزيارة كـ timestamp */
  visitTs: number;
  /** نوع الخدمة */
  type: DetailedClaimRowType;
  /** إجمالي الفاتورة (قبل خصم تحمل المريض) */
  billed: number;
  /** المبلغ اللي دفعه المريض */
  patientShare: number;
  /** المبلغ المستحق على الشركة */
  companyShare: number;
  /** ملاحظة للحالة (اختياري) */
  note?: string;
}

/** البيانات المطلوبة لطباعة كشف تفصيلي كامل. */
interface DetailedStatementData {
  /** اسم شركة التأمين */
  companyName: string;
  /** بداية الفترة YYYY-MM-DD */
  dateFromKey: string;
  /** نهاية الفترة YYYY-MM-DD */
  dateToKey: string;
  /** صفوف الكشف */
  rows: DetailedClaimRow[];
  /** ملاحظات الطبيب (تطبع أعلى مساحة الملاحظات اليدوية) */
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// هروب آمن من HTML — يمنع XSS في حال أي حقل بياني فيه < أو >
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// تنسيق تاريخ مختصر بالعربية (يوم/شهر/سنة)
function formatShortDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Africa/Cairo',
    });
  } catch {
    return new Date(ts).toLocaleDateString('ar-EG');
  }
}

// تنسيق فترة الكشف (من — إلى) بالعربية
function formatRangeLabel(fromKey: string, toKey: string): string {
  try {
    const from = new Date(fromKey + 'T00:00:00').toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Africa/Cairo',
    });
    const to = new Date(toKey + 'T00:00:00').toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Africa/Cairo',
    });
    return `${from} — ${to}`;
  } catch {
    return `${fromKey} → ${toKey}`;
  }
}

// تسمية نوع الخدمة بالعربية للعرض في عمود "النوع"
function typeLabel(type: DetailedClaimRowType): string {
  switch (type) {
    case 'exam': return 'كشف';
    case 'consultation': return 'استشارة';
    case 'intervention': return 'تداخل';
    case 'other': return 'دخل آخر';
    default: return '—';
  }
}

// تنسيق رقم بالعربية مع رمز الجنيه
function fmtMoney(value: number): string {
  return `${(value || 0).toLocaleString('ar-EG')} ج.م`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * يفتح نافذة جديدة فيها كشف تفصيلي A4 أفقي قابل للطباعة.
 * المتصفح بيدي خيار "حفظ PDF" أوتوماتيكياً في نافذة الطباعة.
 */
export function printInsuranceStatement(
  data: DetailedStatementData,
  rxSettings?: PrescriptionSettings | null,
): void {
  const header = rxSettings?.header;
  const footer = rxSettings?.footer;

  // معلومات الطبيب من إعدادات الروشتة (نفس مصدر الفاتورة الحالية)
  const doctorName = header?.doctorName || 'اسم الطبيب';
  const degrees = (header?.degrees || []).filter(Boolean).join(' — ');
  const specialties = (header?.specialties || []).filter(Boolean).join(' | ');
  const logoBase64 = header?.logoBase64 || '';
  const address = footer?.address || '';
  const phone = footer?.phoneNumber || '';
  const workingHours = footer?.workingHours || '';

  // حساب الإجماليات للسطر السفلي في الجدول
  const totals = data.rows.reduce(
    (acc, row) => {
      acc.billed += row.billed;
      acc.patientShare += row.patientShare;
      acc.companyShare += row.companyShare;
      return acc;
    },
    { billed: 0, patientShare: 0, companyShare: 0 },
  );

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" alt="logo" style="max-height:55px;max-width:120px;object-fit:contain;" />`
    : '';

  // بناء صفوف الجدول — كل صف حالة واحدة
  const rowsHtml = data.rows
    .map(
      (row, idx) => `
    <tr>
      <td class="cell c-num">${idx + 1}</td>
      <td class="cell c-name">${escapeHtml(row.patientName || '—')}</td>
      <td class="cell c-mid" dir="ltr">${escapeHtml(row.membershipId || '—')}</td>
      <td class="cell c-date" dir="ltr">${formatShortDate(row.visitTs)}</td>
      <td class="cell c-type">${typeLabel(row.type)}</td>
      <td class="cell c-money" dir="ltr">${fmtMoney(row.billed)}</td>
      <td class="cell c-money" dir="ltr">${fmtMoney(row.patientShare)}</td>
      <td class="cell c-money c-co" dir="ltr">${fmtMoney(row.companyShare)}</td>
      <td class="cell c-mid" dir="ltr">${escapeHtml(row.approvalCode || '—')}</td>
    </tr>`,
    )
    .join('');

  // قسم ملاحظات الطبيب (لو الطبيب كتب حاجة قبل الطباعة، تطبع هنا)
  const notesHtml = data.notes && data.notes.trim()
    ? `<div class="notes-pre">
        <div class="notes-pre-label">ملاحظات الطبيب</div>
        <div class="notes-pre-body">${escapeHtml(data.notes.trim()).replace(/\n/g, '<br>')}</div>
      </div>`
    : '';

  // الـ HTML الكامل — Inline CSS عشان نافذة الطباعة الجديدة مش هتشوف ستايلات التطبيق
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>كشف تفصيلي - ${escapeHtml(data.companyName)}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, 'Noto Sans Arabic', 'Cairo', sans-serif;
      background: #fff; color: #1e293b; direction: rtl;
      padding: 0; margin: 0; font-size: 11px;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .page { max-width: 1100px; margin: 0 auto; padding: 14px 18px; }
    @media print {
      body { padding: 0; }
      .page { max-width: none; padding: 8mm 10mm 10mm 10mm; }
      .no-print { display: none !important; }
    }
    /* الهيدر */
    .doc-header {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #1e40af;
      margin-bottom: 10px;
    }
    .doc-name { font-size: 18px; font-weight: 900; color: #1e293b; margin-bottom: 2px; }
    .doc-degrees { font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 1px; }
    .doc-specs { font-size: 11px; font-weight: 700; color: #3b82f6; }
    /* عنوان الكشف + الفترة */
    .statement-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .title-block .title { font-size: 18px; font-weight: 900; color: #1e40af; margin-bottom: 2px; }
    .title-block .subtitle { font-size: 11px; font-weight: 700; color: #64748b; }
    .period-block { text-align: left; }
    .period-block .label { font-size: 10px; font-weight: 700; color: #64748b; }
    .period-block .value { font-size: 12px; font-weight: 800; color: #334155; }
    /* بطاقة معلومات الشركة */
    .company-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px 24px;
    }
    .info-cell .label { font-size: 9px; font-weight: 800; color: #94a3b8; margin-bottom: 1px; }
    .info-cell .value { font-size: 13px; font-weight: 900; color: #1e293b; }
    /* جدول الحالات */
    table.cases {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 6px;
      font-size: 10.5px;
    }
    table.cases thead tr { background: #1e40af; }
    table.cases th {
      padding: 6px 6px; color: #fff; font-weight: 800; font-size: 10px;
      text-align: center; border-left: 1px solid rgba(255,255,255,0.2);
    }
    table.cases th:last-child { border-left: none; }
    table.cases tbody td.cell {
      padding: 5px 6px; border-bottom: 1px solid #e2e8f0;
      color: #334155; font-weight: 600; vertical-align: middle;
    }
    table.cases tbody tr:nth-child(even) td.cell { background: #f8fafc; }
    .c-num { text-align: center; width: 32px; color: #64748b; font-weight: 800; }
    .c-name { text-align: right; min-width: 130px; }
    .c-mid { text-align: center; width: 95px; font-weight: 700; }
    .c-date { text-align: center; width: 78px; font-weight: 700; }
    .c-type { text-align: center; width: 70px; font-weight: 700; color: #1e40af; }
    .c-money { text-align: center; width: 85px; font-weight: 700; }
    .c-co { color: #1e40af; font-weight: 800; background: #f0f9ff !important; }
    /* صف الإجمالي */
    table.cases tfoot tr { background: #1e40af; }
    table.cases tfoot td {
      padding: 7px 6px; color: #fff; font-weight: 900; font-size: 11.5px;
      text-align: center; border-left: 1px solid rgba(255,255,255,0.2);
    }
    table.cases tfoot td:first-child { text-align: left; }
    table.cases tfoot td:last-child { border-left: none; }
    /* ملخص العدد + المبلغ */
    .summary-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 10px;
    }
    .summary-bar .item { font-size: 11px; font-weight: 800; color: #9a3412; }
    .summary-bar .item .num { color: #ea580c; font-size: 13px; margin-right: 4px; }
    /* ملاحظات الطبيب المطبوعة (لو كتب قبل الطباعة) */
    .notes-pre {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 10px;
    }
    .notes-pre-label { font-size: 10px; font-weight: 800; color: #0369a1; margin-bottom: 4px; }
    .notes-pre-body { font-size: 11px; color: #334155; line-height: 1.6; white-space: pre-wrap; }
    /* مساحة كتابة يدوية بعد الطباعة */
    .notes-handwritten {
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      padding: 8px 12px;
      min-height: 70px;
      margin-bottom: 12px;
    }
    .notes-hw-label {
      font-size: 10px; font-weight: 800; color: #64748b; margin-bottom: 4px;
    }
    .notes-hw-lines {
      border-top: 1px solid #e2e8f0;
      height: 16px;
      margin-top: 4px;
    }
    /* مساحة التوقيع */
    .signature-row {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-top: 14px;
      padding-top: 4px;
    }
    .sig-cell { flex: 1; text-align: center; }
    .sig-line {
      border-top: 1.5px solid #1e293b;
      margin-top: 30px;
      padding-top: 4px;
    }
    .sig-label { font-size: 10px; font-weight: 800; color: #475569; }
    /* الفوتر */
    .doc-footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
    }
    .doc-footer .row {
      display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 16px;
    }
    .doc-footer .brand {
      margin-top: 4px; font-size: 9px; font-weight: 700; color: #3b82f6;
    }
    /* زر الطباعة (يختفي عند الطباعة الفعلية) */
    .print-btn-wrap { text-align: center; margin: 20px 0; }
    .print-btn {
      background: #1e40af; color: #fff; border: none;
      padding: 12px 32px; border-radius: 10px;
      font-size: 14px; font-weight: 800; cursor: pointer;
    }
    /* رسالة لو مفيش حالات */
    .empty-state {
      text-align: center; padding: 40px 20px;
      color: #64748b; font-weight: 700; font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- هيدر الطبيب (نفس بيانات الفاتورة) -->
    <div class="doc-header">
      ${logoHtml ? `<div style="margin-bottom:6px;">${logoHtml}</div>` : ''}
      <div class="doc-name">${escapeHtml(doctorName)}</div>
      ${degrees ? `<div class="doc-degrees">${escapeHtml(degrees)}</div>` : ''}
      ${specialties ? `<div class="doc-specs">${escapeHtml(specialties)}</div>` : ''}
    </div>

    <!-- عنوان الكشف + الفترة -->
    <div class="statement-title">
      <div class="title-block">
        <div class="title">كشف تفصيلي لمطالبات التأمين</div>
        <div class="subtitle">إثبات الحالات المؤمنة المنفذة خلال الفترة</div>
      </div>
      <div class="period-block">
        <div class="label">الفترة</div>
        <div class="value">${formatRangeLabel(data.dateFromKey, data.dateToKey)}</div>
      </div>
    </div>

    <!-- اسم الشركة -->
    <div class="company-card">
      <div class="info-cell">
        <div class="label">شركة التأمين</div>
        <div class="value">${escapeHtml(data.companyName)}</div>
      </div>
      <div class="info-cell">
        <div class="label">عدد الحالات</div>
        <div class="value">${data.rows.length}</div>
      </div>
      <div class="info-cell">
        <div class="label">إجمالي مطالبة الشركة</div>
        <div class="value" style="color:#1e40af;" dir="ltr">${fmtMoney(totals.companyShare)}</div>
      </div>
    </div>

    ${data.rows.length === 0 ? `
      <div class="empty-state">لا توجد حالات مؤمنة لهذه الشركة في الفترة المحددة</div>
    ` : `
    <!-- جدول الحالات -->
    <table class="cases">
      <thead>
        <tr>
          <th style="width:32px;">#</th>
          <th style="text-align:right;">اسم المريض</th>
          <th style="width:95px;">رقم الكارنيه</th>
          <th style="width:78px;">تاريخ الزيارة</th>
          <th style="width:70px;">النوع</th>
          <th style="width:85px;">إجمالي الفاتورة</th>
          <th style="width:85px;">تحمل المريض</th>
          <th style="width:85px;">حصة الشركة</th>
          <th style="width:95px;">كود الموافقة</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
      <tfoot>
        <tr>
          <td colspan="5">الإجمالي</td>
          <td dir="ltr">${fmtMoney(totals.billed)}</td>
          <td dir="ltr">${fmtMoney(totals.patientShare)}</td>
          <td dir="ltr">${fmtMoney(totals.companyShare)}</td>
          <td>—</td>
        </tr>
      </tfoot>
    </table>
    `}

    ${notesHtml}

    <!-- مساحة ملاحظات يدوية للطبيب يكتب فيها بعد الطباعة (بقلم) -->
    <div class="notes-handwritten">
      <div class="notes-hw-label">ملاحظات إضافية</div>
      <div class="notes-hw-lines"></div>
      <div class="notes-hw-lines"></div>
      <div class="notes-hw-lines"></div>
    </div>

    <!-- توقيع الطبيب + ختم -->
    <div class="signature-row">
      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-label">توقيع الطبيب</div>
      </div>
      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-label">ختم العيادة</div>
      </div>
      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-label">تاريخ الإصدار</div>
      </div>
    </div>

    <!-- فوتر بمعلومات الاتصال -->
    <div class="doc-footer">
      <div class="row">
        ${address ? `<span>${escapeHtml(address)}</span>` : ''}
        ${phone ? `<span>هاتف: ${escapeHtml(phone)}</span>` : ''}
        ${workingHours ? `<span>${escapeHtml(workingHours)}</span>` : ''}
      </div>
      <div class="brand" dir="ltr">www.drhypermed.com</div>
    </div>
  </div>

  <!-- زر الطباعة (يختفي وقت الطباعة الفعلية) -->
  <div class="print-btn-wrap no-print">
    <button class="print-btn" onclick="window.print()">طباعة الكشف</button>
  </div>
</body>
</html>`;

  // فتح نافذة طباعة جديدة (نفس آلية invoicePrintUtils)
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }
}
