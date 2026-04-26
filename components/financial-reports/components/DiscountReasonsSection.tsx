import React, { useCallback, useEffect, useState } from 'react';
import { discountReasonService, type DiscountReason } from '../../../services/discountReasonService';

interface DiscountReasonsSectionProps {
  userId: string;
}

export const DiscountReasonsSection: React.FC<DiscountReasonsSectionProps> = ({ userId }) => {
  const [reasons, setReasons] = useState<DiscountReason[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = discountReasonService.subscribeToReasons(userId, setReasons);
    return () => unsubscribe();
  }, [userId]);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setFormName('');
    setFormNotes('');
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((reason: DiscountReason) => {
    setEditingId(reason.id);
    setFormName(reason.name);
    setFormNotes(reason.notes || '');
    setShowForm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName.trim()) return;
    setIsSaving(true);
    try {
      await discountReasonService.saveReason(userId, {
        id: editingId || undefined,
        name: formName,
        notes: formNotes,
        ...(editingId
          ? { createdAt: reasons.find((item) => item.id === editingId)?.createdAt }
          : {}),
      });

      setShowForm(false);
      setEditingId(null);
      setFormName('');
      setFormNotes('');
    } catch (error) {
      console.error('Error saving discount reason:', error);
    } finally {
      setIsSaving(false);
    }
  }, [userId, editingId, formName, formNotes, reasons]);

  const handleDelete = useCallback(
    async (reasonId: string, reasonName: string) => {
      if (!window.confirm(`هل أنت متأكد من حذف سبب الخصم "${reasonName}"؟\n\nلن يؤثر الحذف على السجلات القديمة.`)) {
        return;
      }

      try {
        await discountReasonService.deleteReason(userId, reasonId);
      } catch (error) {
        console.error('Error deleting discount reason:', error);
      }
    },
    [userId]
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="w-full bg-gradient-to-r from-danger-600 to-danger-500 px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:from-danger-700 hover:to-danger-600 transition-all"
      >
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-6 0h6v6m-9 5h9a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          الخصم
          {reasons.length > 0 && (
            <span className="bg-white/20 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {reasons.length}
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

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4">
          {!showForm && (
            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-warning-500 to-warning-600 text-white font-bold hover:from-warning-600 hover:to-warning-700 transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              إضافة سبب خصم
            </button>
          )}

          {showForm && (
            <div className="bg-gradient-to-br from-warning-50 to-warning-50 rounded-2xl p-4 border border-warning-200 space-y-3">
              <h3 className="text-base font-black text-warning-800">
                {editingId ? '✏️ تعديل سبب الخصم' : '➕ إضافة سبب خصم جديد'}
              </h3>

              <div>
                <label className="block text-xs font-bold text-warning-700 mb-1">
                  سبب الخصم <span className="text-danger-400">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  placeholder="مثال: حالة اجتماعية، خصم متابعة، خصم حملة..."
                  className="w-full px-3 py-2 rounded-xl border-2 border-warning-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all text-sm font-bold text-slate-800 bg-white"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-warning-700 mb-1">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(event) => setFormNotes(event.target.value)}
                  placeholder="ملاحظات إضافية عن استخدام هذا السبب"
                  className="w-full px-3 py-2 rounded-xl border-2 border-warning-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all text-sm font-bold text-slate-800 bg-white"
                  dir="rtl"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-warning-600 text-white font-bold hover:bg-warning-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {editingId ? 'حفظ التعديلات' : 'إضافة السبب'}
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

          {reasons.length === 0 && !showForm ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-6 0h6v6m-9 5h9a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="font-bold text-sm">لم يتم إضافة عناصر خصم بعد</p>
              <p className="text-xs mt-1">اضغط الزر أعلاه لإضافة أول عنصر</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reasons.map((reason) => (
                <div
                  key={reason.id}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 sm:p-4 border border-slate-200 hover:border-warning-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🏷️</span>
                        <h4 className="text-sm sm:text-base font-black text-slate-800 truncate">
                          {reason.name}
                        </h4>
                      </div>
                      {reason.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 truncate">{reason.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEdit(reason)}
                        className="p-1.5 rounded-lg bg-brand-100 text-brand-600 hover:bg-brand-200 transition-colors"
                        title="تعديل"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(reason.id, reason.name)}
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
