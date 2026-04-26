/**
 * invoicePrintUtils.ts — طباعة فاتورة المريض في نافذة جديدة
 *
 * يُستخدم من قسم التكاليف المالية وقسم الفواتير المستقل.
 */

import type { PrescriptionSettings } from '../../types';
import { isPositiveFileNumber } from './patientFilesShared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrintableInvoiceItem {
  description: string;
  amount: number;
}

interface PrintableInvoiceData {
  patientName: string;
  patientFileNumber?: number;
  patientPhone?: string;
  items: PrintableInvoiceItem[];
  discount: number;
  notes?: string;
  invoiceNumberLabel?: string;
  timestamp?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

function formatDateTimeArabic(ts: number): string {
  try {
    const d = new Date(ts);
    const datePart = d.toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo',
    });
    const timePart = d.toLocaleTimeString('ar-EG', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo',
    });
    return `${datePart} — ${timePart}`;
  } catch {
    return new Date(ts).toLocaleString('ar-EG');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function printPatientInvoice(
  data: PrintableInvoiceData,
  rxSettings?: PrescriptionSettings | null,
): void {
  const header = rxSettings?.header;
  const footer = rxSettings?.footer;

  const doctorName = header?.doctorName || 'اسم الطبيب';
  const degrees = (header?.degrees || []).filter(Boolean).join(' — ');
  const specialties = (header?.specialties || []).filter(Boolean).join(' | ');
  const logoBase64 = header?.logoBase64 || '';
  const address = footer?.address || '';
  const phone = footer?.phoneNumber || '';
  const workingHours = footer?.workingHours || '';

  const subtotal = data.items.reduce((s, i) => s + i.amount, 0);
  const total = Math.max(0, subtotal - (data.discount || 0));
  const timestamp = data.timestamp || Date.now();

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" alt="logo" style="max-height:50px;max-width:110px;object-fit:contain;" />`
    : '';

  const invoiceNumHtml = data.invoiceNumberLabel
    ? `<div style="font-size:9px;color:#64748b;font-weight:700;">رقم: ${escapeHtml(data.invoiceNumberLabel)}</div>`
    : '';

  const itemsHtml = data.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding:6px 8px;text-align:center;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:700;font-size:10px;">${idx + 1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#334155;font-weight:600;font-size:11px;">${escapeHtml(item.description)}</td>
      <td style="padding:6px 8px;text-align:center;border-bottom:1px solid #e2e8f0;color:#334155;font-weight:700;font-size:11px;" dir="ltr">${item.amount.toLocaleString('ar-EG')} ج.م</td>
    </tr>`,
    )
    .join('');

  const discountRow =
    data.discount > 0
      ? `<tr>
          <td colspan="2" style="padding:5px 8px;text-align:left;font-weight:800;color:#64748b;font-size:10px;">الخصم</td>
          <td style="padding:5px 8px;text-align:center;font-weight:800;color:#dc2626;font-size:10px;" dir="ltr">- ${data.discount.toLocaleString('ar-EG')} ج.م</td>
        </tr>`
      : '';

  const notesHtml = data.notes
    ? `<div style="margin-top:10px;padding:8px 10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;">
        <div style="font-size:9px;font-weight:800;color:#0369a1;margin-bottom:2px;">ملاحظات</div>
        <div style="font-size:10px;color:#334155;">${escapeHtml(data.notes)}</div>
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>www.drhypermed.com</title>
  <style>
    @page { size: A5; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, 'Noto Sans Arabic', 'Cairo', sans-serif;
      background: #fff; color: #1e293b; direction: rtl;
      padding: 0; margin: 0; font-size: 11px;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .invoice-page { max-width: 600px; margin: 0 auto; padding: 16px; }
    @media print {
      body { padding: 0; }
      .invoice-page { max-width: none; padding: 8mm 8mm 10mm 8mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-page">
    <div style="text-align:center;padding-bottom:10px;border-bottom:2px solid #1e40af;margin-bottom:10px;">
      ${logoHtml ? `<div style="margin-bottom:5px;">${logoHtml}</div>` : ''}
      <div style="font-size:16px;font-weight:900;color:#1e293b;margin-bottom:2px;">${escapeHtml(doctorName)}</div>
      ${degrees ? `<div style="font-size:10px;font-weight:600;color:#64748b;margin-bottom:1px;">${escapeHtml(degrees)}</div>` : ''}
      ${specialties ? `<div style="font-size:10px;font-weight:700;color:#3b82f6;">${escapeHtml(specialties)}</div>` : ''}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <div>
        <div style="font-size:18px;font-weight:900;color:#1e40af;">فاتورة</div>
        ${invoiceNumHtml}
      </div>
      <div style="text-align:left;">
        <div style="font-size:10px;font-weight:700;color:#64748b;">التاريخ والوقت</div>
        <div style="font-size:11px;font-weight:800;color:#334155;">${escapeHtml(formatDateTimeArabic(timestamp))}</div>
      </div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;margin-bottom:10px;">
      <div style="display:flex;flex-wrap:wrap;gap:6px 20px;">
        <div>
          <div style="font-size:8px;font-weight:800;color:#94a3b8;margin-bottom:1px;">اسم المريض</div>
          <div style="font-size:13px;font-weight:900;color:#1e293b;">${escapeHtml(data.patientName)}</div>
        </div>
        ${isPositiveFileNumber(data.patientFileNumber) ? `
        <div>
          <div style="font-size:8px;font-weight:800;color:#94a3b8;margin-bottom:1px;">رقم الملف</div>
          <div style="font-size:12px;font-weight:800;color:#334155;">#${data.patientFileNumber}</div>
        </div>` : ''}
        ${data.patientPhone ? `
        <div>
          <div style="font-size:8px;font-weight:800;color:#94a3b8;margin-bottom:1px;">رقم التليفون</div>
          <div style="font-size:11px;font-weight:700;color:#334155;" dir="ltr">${escapeHtml(data.patientPhone)}</div>
        </div>` : ''}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:3px;">
      <thead>
        <tr style="background:#1e40af;">
          <th style="padding:6px 8px;text-align:center;color:#fff;font-weight:800;font-size:10px;width:36px;">#</th>
          <th style="padding:6px 8px;text-align:right;color:#fff;font-weight:800;font-size:10px;">البند</th>
          <th style="padding:6px 8px;text-align:center;color:#fff;font-weight:800;font-size:10px;width:100px;">المبلغ</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:10px;">
      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          ${data.items.length > 1 ? `
          <tr style="background:#f8fafc;">
            <td colspan="2" style="padding:5px 8px;text-align:left;font-weight:800;color:#64748b;font-size:10px;">المجموع الفرعي</td>
            <td style="padding:5px 8px;text-align:center;font-weight:800;color:#334155;width:100px;font-size:10px;" dir="ltr">${subtotal.toLocaleString('ar-EG')} ج.م</td>
          </tr>` : ''}
          ${discountRow}
          <tr style="background:#1e40af;">
            <td colspan="2" style="padding:8px;text-align:left;font-weight:900;color:#fff;font-size:12px;">الإجمالي</td>
            <td style="padding:8px;text-align:center;font-weight:900;color:#fff;font-size:13px;width:100px;" dir="ltr">${total.toLocaleString('ar-EG')} ج.م</td>
          </tr>
        </tbody>
      </table>
    </div>
    ${notesHtml}
    <div style="margin-top:14px;padding-top:8px;border-top:1px solid #e2e8f0;text-align:center;">
      <div style="font-size:10px;font-weight:700;color:#64748b;display:flex;flex-wrap:wrap;justify-content:center;gap:4px 14px;">
        ${address ? `<span>${escapeHtml(address)}</span>` : ''}
        ${phone ? `<span>هاتف: ${escapeHtml(phone)}</span>` : ''}
        ${workingHours ? `<span>${escapeHtml(workingHours)}</span>` : ''}
      </div>
      <div style="margin-top:6px;font-size:9px;color:#94a3b8;font-weight:600;">شكرًا لثقتكم بنا</div>
      <div style="margin-top:3px;font-size:9px;font-weight:700;color:#3b82f6;" dir="ltr">www.drhypermed.com</div>
    </div>
  </div>
  <div class="no-print" style="text-align:center;margin:24px 0;">
    <button onclick="window.print()" style="background:#1e40af;color:#fff;border:none;padding:12px 32px;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;">طباعة الفاتورة</button>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }
}
