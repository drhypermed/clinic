/**
 * نوافذ التأكيد لـ ReadyPrescriptionsModal
 *
 * يُصدّر مكونين صغيرين يُستخدمان داخل المودال الرئيسي للروشتات الجاهزة:
 *   1. `DeletePresetDialog`  — تأكيد حذف قالب روشتة جاهزة نهائياً.
 *   2. `ApplyPresetDialog`   — اختيار دمج/استبدال كل قسم (أدوية/فحوصات/تعليمات)
 *                              عند تطبيق قالب على روشتة لديها بيانات فعلية.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import type { ReadyPrescription } from '../../../types';
import { Button } from '../../ui/Button';

// ═══════════════════════════════════════════════════
// Delete Dialog
// ═══════════════════════════════════════════════════

interface DeletePresetDialogProps {
    candidate: ReadyPrescription | null;
    deletingId: string | null;
    onCancel: () => void;
    onConfirm: (id: string) => Promise<void>;
}

export const DeletePresetDialog: React.FC<DeletePresetDialogProps> = ({
    candidate,
    deletingId: _deletingId,
    onCancel,
    onConfirm,
}) => {
    if (!candidate) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10020] bg-black/55 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* المودال — border أزرق + ظل واضح */}
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200" dir="rtl">
                <h4 className="text-lg font-black text-slate-900 mb-2">تأكيد حذف الروشتة الجاهزة</h4>
                <p className="text-sm font-bold text-slate-700 mb-5">
                    هل أنت متأكد من حذف <span className="text-rose-700 font-black">{candidate.name}</span>؟ لا يمكن التراجع عن ذلك.
                </p>
                {/* الإلغاء أحمر متدرج بدل secondary الرمادي (طلب المستخدم) */}
                <div className="flex items-center justify-end gap-2">
                    <Button onClick={onCancel} variant="info" size="sm">رجوع</Button>
                    <Button
                        onClick={() => onConfirm(candidate.id)}
                        variant="danger"
                        size="sm"
                    >
                        حذف نهائي
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ═══════════════════════════════════════════════════
// Apply Dialog (merge / replace options)
// ═══════════════════════════════════════════════════

export type ApplyMode = 'merge' | 'replace';

interface ApplyPresetDialogProps {
    candidate: ReadyPrescription | null;
    medicationsMode: ApplyMode;
    adviceMode: ApplyMode;
    labsMode: ApplyMode;
    hasRealMedsState: boolean;
    hasRealAdviceState: boolean;
    hasRealLabsState: boolean;
    setMedicationsMode: (mode: ApplyMode) => void;
    setAdviceMode: (mode: ApplyMode) => void;
    setLabsMode: (mode: ApplyMode) => void;
    setAllApplyModes: (mode: ApplyMode) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

const getModeButtonVariant = (isActive: boolean, activeVariant: 'info' | 'danger') =>
    isActive ? activeVariant : 'secondary';

export const ApplyPresetDialog: React.FC<ApplyPresetDialogProps> = ({
    candidate,
    medicationsMode,
    adviceMode,
    labsMode,
    hasRealMedsState,
    hasRealAdviceState,
    hasRealLabsState,
    setMedicationsMode,
    setAdviceMode,
    setLabsMode,
    setAllApplyModes,
    onCancel,
    onConfirm,
}) => {
    if (!candidate) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10020] bg-black/55 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* المودال — border أزرق صلب */}
            <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200" dir="rtl">
                <h4 className="text-lg font-black text-slate-900 mb-2">طريقة إضافة الروشتة الجاهزة</h4>
                <p className="text-sm font-bold text-slate-700 mb-4">
                    يوجد بيانات مكتوبة بالفعل في الروشتة الحالية. اختر كيف تريد إضافة {candidate.name}:
                </p>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button onClick={() => setAllApplyModes('merge')} variant="info" size="sm" className="text-xs sm:text-sm">دمج الجميع</Button>
                        <Button onClick={() => setAllApplyModes('replace')} variant="danger" size="sm" className="text-xs sm:text-sm">استبدال الجميع</Button>
                    </div>

                    {/* قسم الأدوية والملاحظات — border + بادج صلب */}
                    <div className="border border-slate-200 p-3 rounded-2xl space-y-2 bg-slate-50/60">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-black text-slate-800">الأدوية والملاحظات</div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${hasRealMedsState ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                                {hasRealMedsState ? 'يوجد محتوى حالي' : 'لا يوجد محتوى حالي'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setMedicationsMode('merge')} variant={getModeButtonVariant(medicationsMode === 'merge', 'info')} size="sm" className="px-3 py-2 text-xs">دمج</Button>
                            <Button onClick={() => setMedicationsMode('replace')} variant={getModeButtonVariant(medicationsMode === 'replace', 'danger')} size="sm" className="px-3 py-2 text-xs">استبدال</Button>
                        </div>
                    </div>

                    {/* قسم الفحوصات */}
                    <div className="border border-slate-200 p-3 rounded-2xl space-y-2 bg-slate-50/60">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-black text-slate-800">الفحوصات</div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${hasRealLabsState ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                                {hasRealLabsState ? 'يوجد فحوصات حالية' : 'لا يوجد فحوصات حالية'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setLabsMode('merge')} variant={getModeButtonVariant(labsMode === 'merge', 'info')} size="sm" className="px-3 py-2 text-xs">دمج</Button>
                            <Button onClick={() => setLabsMode('replace')} variant={getModeButtonVariant(labsMode === 'replace', 'danger')} size="sm" className="px-3 py-2 text-xs">استبدال</Button>
                        </div>
                    </div>

                    {/* قسم التعليمات الهامة */}
                    <div className="border border-slate-200 p-3 rounded-2xl space-y-2 bg-slate-50/60">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-black text-slate-800">التعليمات الهامة</div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${hasRealAdviceState ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                                {hasRealAdviceState ? 'يوجد تعليمات حالية' : 'لا يوجد تعليمات حالية'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setAdviceMode('merge')} variant={getModeButtonVariant(adviceMode === 'merge', 'info')} size="sm" className="px-3 py-2 text-xs">دمج</Button>
                            <Button onClick={() => setAdviceMode('replace')} variant={getModeButtonVariant(adviceMode === 'replace', 'danger')} size="sm" className="px-3 py-2 text-xs">استبدال</Button>
                        </div>
                    </div>

                    {/* أزرار الـfooter — إلغاء أحمر + تأكيد أخضر */}
                    <div className="mt-5 flex items-center justify-end gap-2">
                        <Button onClick={onCancel} variant="danger" size="sm">إلغاء</Button>
                        <Button onClick={onConfirm} variant="primary" size="sm">تأكيد الإضافة</Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
