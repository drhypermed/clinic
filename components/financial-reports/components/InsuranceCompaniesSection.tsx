/**
 * مكون إدارة شركات التأمين المتعاقدة (Insurance Companies Management)
 * 
 * يتيح للطبيب:
 * 1. إضافة شركات تأمين جديدة مع تحديد نسبة تحمل المريض
 * 2. تعديل بيانات الشركات الموجودة
 * 3. حذف شركة تأمين (مع تأكيد)
 * 4. عرض قائمة الشركات بشكل احترافي
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  insuranceService,
  resolvePatientSharePercentForBranch,
  type InsuranceCompany,
} from '../../../services/insuranceService';
import type { Branch } from '../../../types';

// ─────────────────────────────────────────────────────────────────────────────
// الخصائص | Props
// ─────────────────────────────────────────────────────────────────────────────

interface InsuranceCompaniesSectionProps {
  userId: string;
  /** قائمة الفروع — تُستخدم لعرض ممكنات override لنسبة الفرع. لو فارغة، يُعرَض حقل الافتراضي فقط. */
  branches?: Branch[];
  /** الفرع النشط — يُستخدم لإبراز نسبة الفرع الحالي في عرض القائمة. */
  activeBranchId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// المكون | Component
// ─────────────────────────────────────────────────────────────────────────────

export const InsuranceCompaniesSection: React.FC<InsuranceCompaniesSectionProps> = ({
  userId,
  branches = [],
  activeBranchId,
}) => {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // حالة النموذج
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPercent, setFormPercent] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // overrides نسبة لكل فرع — يُمثَّل كـ string عشان تسمح بـ "" (أي لا override)
  const [formBranchOverrides, setFormBranchOverrides] = useState<Record<string, string>>({});
  // الفروع المرئية في النموذج (الفرع الرئيسي + فروع الطبيب الفعلية)
  const visibleBranches = React.useMemo(() => {
    const normalized = [...branches].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return normalized;
  }, [branches]);

  // الاشتراك اللحظي في تحديثات الشركات
  useEffect(() => {
    if (!userId) return;
    const unsub = insuranceService.subscribeToCompanies(userId, setCompanies);
    return () => unsub();
  }, [userId]);

  // فتح نموذج الإضافة
  const handleAdd = useCallback(() => {
    setEditingId(null);
    setFormName('');
    setFormPercent('');
    setFormNotes('');
    setFormBranchOverrides({});
    setShowForm(true);
  }, []);

  // فتح نموذج التعديل
  const handleEdit = useCallback((company: InsuranceCompany) => {
    setEditingId(company.id);
    setFormName(company.name);
    setFormPercent(String(company.patientSharePercent));
    setFormNotes(company.notes || '');
    // تحميل الـ overrides الموجودة للفروع لإظهارها في النموذج
    const overrides: Record<string, string> = {};
    if (company.patientSharePercentByBranch) {
      for (const [branchKey, value] of Object.entries(company.patientSharePercentByBranch)) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          overrides[branchKey] = String(value);
        }
      }
    }
    setFormBranchOverrides(overrides);
    setShowForm(true);
  }, []);

  // تحديث override نسبة لفرع معين
  const handleBranchOverrideChange = useCallback((branchKey: string, value: string) => {
    setFormBranchOverrides((prev) => ({ ...prev, [branchKey]: value }));
  }, []);

  // مسح override لفرع (يرجع للاستخدام الافتراضي)
  const handleClearBranchOverride = useCallback((branchKey: string) => {
    setFormBranchOverrides((prev) => {
      const next = { ...prev };
      delete next[branchKey];
      return next;
    });
  }, []);

  // حفظ (إضافة أو تعديل)
  const handleSave = useCallback(async () => {
    if (!formName.trim()) return;
    const percent = parseFloat(formPercent) || 0;
    if (percent < 0 || percent > 100) return;

    // بناء خريطة overrides صالحة — نتجاهل القيم الفارغة أو غير العددية أو خارج النطاق
    const patientSharePercentByBranch: Record<string, number> = {};
    for (const [branchKey, raw] of Object.entries(formBranchOverrides)) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const parsed = parseFloat(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) continue;
      patientSharePercentByBranch[branchKey] = parsed;
    }

    setIsSaving(true);
    try {
      await insuranceService.saveCompany(userId, {
        id: editingId || undefined,
        name: formName,
        patientSharePercent: percent,
        patientSharePercentByBranch:
          Object.keys(patientSharePercentByBranch).length > 0 ? patientSharePercentByBranch : undefined,
        notes: formNotes,
        ...(editingId
          ? { createdAt: companies.find((c) => c.id === editingId)?.createdAt }
          : {}),
      });
      setShowForm(false);
      setEditingId(null);
      setFormName('');
      setFormPercent('');
      setFormNotes('');
      setFormBranchOverrides({});
    } catch (err) {
      console.error('Error saving insurance company:', err);
    } finally {
      setIsSaving(false);
    }
  }, [userId, editingId, formName, formPercent, formNotes, formBranchOverrides, companies]);

  // حذف شركة
  const handleDelete = useCallback(
    async (companyId: string, companyName: string) => {
      if (!window.confirm(`هل أنت متأكد من حذف شركة "${companyName}"؟\n\nلن يؤثر الحذف على السجلات القديمة.`)) return;
      try {
        await insuranceService.deleteCompany(userId, companyId);
      } catch (err) {
        console.error('Error deleting insurance company:', err);
      }
    },
    [userId]
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      {/* ─────────────────────────────────────────────────────────
          الهيدر | Header
      ───────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-brand-700 to-brand-600 px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:from-brand-800 hover:to-brand-700 transition-all"
      >
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          شركات التأمين المتعاقدة
          {companies.length > 0 && (
            <span className="bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {companies.length}
            </span>
          )}
        </h2>
        <svg
          className={`w-5 h-5 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ─────────────────────────────────────────────────────────
          المحتوى | Content (Collapsible)
      ───────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* زر إضافة شركة جديدة */}
          {!showForm && (
            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 text-white font-bold hover:from-slate-600 hover:to-slate-700 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              إضافة شركة تأمين جديدة
            </button>
          )}

          {/* ─── نموذج الإضافة/التعديل ─── */}
          {showForm && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <h3 className="text-base font-black text-slate-800">
                {editingId ? '✏️ تعديل شركة تأمين' : '➕ إضافة شركة تأمين جديدة'}
              </h3>

              {/* اسم الشركة */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  اسم الشركة <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: أكسا، بوبا، ميتلايف..."
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all text-sm font-bold text-slate-800 bg-white"
                  dir="rtl"
                />
              </div>

              {/* نسبة تحمل المريض */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  نسبة تحمل المريض (%) <span className="text-danger-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formPercent}
                    onChange={(e) => setFormPercent(e.target.value)}
                    placeholder="مثال: 20"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all text-sm font-bold text-slate-800 text-center bg-white"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  يعني لو الكشف 500 ج وتحمل المريض 20%، المريض يدفع 100 ج والشركة 400 ج
                </p>
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="مثال: تعاقد سنوي يتجدد في يناير..."
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all text-sm font-bold text-slate-800 bg-white"
                  dir="rtl"
                />
              </div>

              {/* نسب مختلفة لكل فرع (اختياري) — تظهر فقط لو عند الطبيب أكثر من فرع */}
              {visibleBranches.length > 1 && (
                <div className="border-t border-slate-200 pt-3 mt-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    نسب مختلفة لكل فرع (اختياري)
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">
                    لو فرع بياخد نسبة مختلفة عن الافتراضية، أدخلها هنا. الفروع اللي بدون قيمة تستعمل النسبة الافتراضية.
                  </p>
                  <div className="space-y-1.5">
                    {visibleBranches.map((branch) => {
                      const value = formBranchOverrides[branch.id] ?? '';
                      return (
                        <div key={branch.id} className="flex items-center gap-2">
                          <span className="flex-1 text-xs font-bold text-slate-700 truncate">
                            {branch.name}
                          </span>
                          <div className="relative w-24">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={value}
                              onChange={(e) => handleBranchOverrideChange(branch.id, e.target.value)}
                              placeholder="الافتراضية"
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 focus:border-slate-500 focus:ring-1 focus:ring-slate-500/20 transition-all text-xs font-bold text-slate-800 text-center bg-white"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">
                              %
                            </span>
                          </div>
                          {value && (
                            <button
                              type="button"
                              onClick={() => handleClearBranchOverride(branch.id)}
                              className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                              title="مسح وإرجاع للنسبة الافتراضية"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* أزرار الحفظ/الإلغاء */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-600 text-white font-bold hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {editingId ? 'حفظ التعديلات' : 'إضافة الشركة'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* ─── قائمة الشركات ─── */}
          {companies.length === 0 && !showForm ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="font-bold text-sm">لم يتم إضافة شركات تأمين بعد</p>
              <p className="text-xs mt-1">اضغط الزر أعلاه لإضافة أول شركة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 sm:p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* معلومات الشركة */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🏢</span>
                        <h4 className="text-sm sm:text-base font-black text-slate-800 truncate">
                          {company.name}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          تحمل المريض: {company.patientSharePercent}%
                        </span>
                        <span className="inline-flex items-center gap-1 bg-success-100 text-success-700 px-2 py-0.5 rounded-full font-bold">
                          تحمل الشركة: {100 - company.patientSharePercent}%
                        </span>
                        {/* لو عند الطبيب أكثر من فرع وفيه override للفرع النشط مختلف عن الافتراضي، نعرضه */}
                        {visibleBranches.length > 1 && activeBranchId && (() => {
                          const activeBranchPercent = resolvePatientSharePercentForBranch(company, activeBranchId);
                          if (activeBranchPercent === company.patientSharePercent) return null;
                          const activeBranchName =
                            visibleBranches.find((b) => b.id === activeBranchId)?.name || activeBranchId;
                          return (
                            <span className="inline-flex items-center gap-1 bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full font-bold">
                              نسبة {activeBranchName}: {activeBranchPercent}%
                            </span>
                          );
                        })()}
                      </div>
                      {company.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 truncate">{company.notes}</p>
                      )}
                    </div>

                    {/* أزرار التعديل والحذف */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-1.5 rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition-colors"
                        title="تعديل"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(company.id, company.name)}
                        className="p-1.5 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200 transition-colors"
                        title="حذف"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
