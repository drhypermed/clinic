/**
 * خدمة فواتير ملفات المرضى (Patient Invoice Service)
 * تخزن الفواتير المُصدَرة من ملف المريض وتوفّر إمكانية إعادة الطباعة.
 * المخزن: localStorage (مفهرس بمعرّف الملف) + Firestore (مزامنة).
 *
 * العزل بين الفروع:
 * - كل فاتورة تحمل `branchId`.
 * - العداد في localStorage مُقسَّم بالفرع (مفتاح مختلف لكل فرع).
 * - عند المزامنة من جهاز آخر: نحسب max لكل فرع على حدة حتى لا تقفز الأرقام.
 */

import { db } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
}

export interface PatientInvoice {
  id: string;
  invoiceNumber: number;
  patientFileId: string;
  patientName: string;
  patientPhone?: string;
  patientFileNumber?: number;
  items: InvoiceLineItem[];
  discount: number;
  notes?: string;
  dateKey: string; // YYYY-MM-DD
  createdAt: number;
  /** الفرع الذي صدرت فيه الفاتورة — للعزل بين الفروع (الفواتير القديمة بدون هذا الحقل تُعتبر 'main'). */
  branchId?: string;
}

// ─── localStorage key helpers ─────────────────────────────────────────────────

const FILE_INVOICES_KEY = (fileId: string) => `patientInvoices_${fileId}`;
const INVOICE_COUNTER_KEY = 'invoiceNextNumber';
const DEFAULT_BRANCH_ID = 'main';

const normalizeBranchId = (branchId?: string): string =>
  (branchId || DEFAULT_BRANCH_ID).trim() || DEFAULT_BRANCH_ID;

const branchCounterKey = (branchId?: string) => {
  const normalized = normalizeBranchId(branchId);
  return normalized === DEFAULT_BRANCH_ID ? INVOICE_COUNTER_KEY : `${INVOICE_COUNTER_KEY}_${normalized}`;
};

// ─── Counter ──────────────────────────────────────────────────────────────────

function getNextInvoiceNumber(branchId?: string): number {
  const key = branchCounterKey(branchId);
  const raw = localStorage.getItem(key);
  const current = raw ? parseInt(raw, 10) : 0;
  const next = (Number.isFinite(current) ? current : 0) + 1;
  localStorage.setItem(key, String(next));
  return next;
}

// ─── localStorage CRUD ────────────────────────────────────────────────────────

export function loadPatientFileInvoices(fileId: string): PatientInvoice[] {
  try { return JSON.parse(localStorage.getItem(FILE_INVOICES_KEY(fileId)) ?? '[]'); }
  catch { return []; }
}

function persistFileInvoices(fileId: string, items: PatientInvoice[]): void {
  localStorage.setItem(FILE_INVOICES_KEY(fileId), JSON.stringify(items));
}

export function addInvoice(
  fileId: string,
  patientName: string,
  fields: {
    patientPhone?: string;
    patientFileNumber?: number;
    items: InvoiceLineItem[];
    discount: number;
    notes?: string;
    dateKey: string;
    branchId?: string;
  },
): PatientInvoice {
  const normalizedBranch = normalizeBranchId(fields.branchId);
  const invoice: PatientInvoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    invoiceNumber: getNextInvoiceNumber(normalizedBranch),
    patientFileId: fileId,
    patientName,
    patientPhone: fields.patientPhone,
    patientFileNumber: fields.patientFileNumber,
    items: fields.items,
    discount: fields.discount,
    notes: fields.notes,
    dateKey: fields.dateKey,
    createdAt: Date.now(),
    branchId: normalizedBranch,
  };

  persistFileInvoices(fileId, [...loadPatientFileInvoices(fileId), invoice]);
  return invoice;
}

export function deleteInvoice(fileId: string, invoiceId: string): void {
  persistFileInvoices(fileId, loadPatientFileInvoices(fileId).filter(i => i.id !== invoiceId));
}

// ─── Firestore sync ───────────────────────────────────────────────────────────

const invoicesDocRef = (userId: string, fileId: string) =>
  doc(db, 'users', userId, 'patientFileData', `${fileId}_invoices`);

export async function syncInvoicesToFirestore(
  userId: string,
  fileId: string,
  invoices: PatientInvoice[],
): Promise<void> {
  if (!userId || !fileId) return;
  await setDoc(invoicesDocRef(userId, fileId), {
    invoices,
    updatedAt: Date.now(),
  }, { merge: true });
}

export function subscribeToPatientFileInvoices(
  userId: string,
  fileId: string,
  onUpdate: (invoices: PatientInvoice[]) => void,
): () => void {
  if (!userId || !fileId) return () => {};

  return onSnapshot(
    invoicesDocRef(userId, fileId),
    (snap) => {
      const invoices: PatientInvoice[] = [];
      if (snap.exists()) {
        const data = snap.data() as { invoices?: PatientInvoice[] };
        invoices.push(...(data.invoices ?? []));
      }
      persistFileInvoices(fileId, invoices);

      // تحديث العداد per-branch — نحسب max لكل فرع على حدة بناءً على الفواتير المزامَنة.
      // بذلك لا يقفز ترقيم فرع بسبب فواتير فرع آخر.
      //
      // ⚠️ ملاحظة مقصودة: الفواتير القديمة بدون `branchId` (من قبل تفعيل نظام الفروع)
      //    تُحسب ضمن عداد الفرع الرئيسي ('main') عبر `normalizeBranchId(undefined) = 'main'`.
      //    هذا **متعمَّد** لمنع تكرار أرقام الفواتير: لو فرع main بدأ من 1 رغم وجود فواتير
      //    قديمة 1..N، سيتعارض الترقيم. الحفاظ على max يضمن استمرار التسلسل بدون تكرار.
      const maxByBranch = new Map<string, number>();
      for (const inv of invoices) {
        const branch = normalizeBranchId(inv.branchId);
        const current = maxByBranch.get(branch) || 0;
        const num = Number(inv.invoiceNumber) || 0;
        if (num > current) maxByBranch.set(branch, num);
      }

      for (const [branch, maxNum] of maxByBranch) {
        const key = branchCounterKey(branch);
        const currentCounter = parseInt(localStorage.getItem(key) ?? '0', 10) || 0;
        if (maxNum > currentCounter) {
          localStorage.setItem(key, String(maxNum));
        }
      }

      onUpdate(invoices);
    },
    (err) => {
      console.warn('[PatientInvoiceService] Firestore snapshot error:', err);
      onUpdate([]);
    },
  );
}
