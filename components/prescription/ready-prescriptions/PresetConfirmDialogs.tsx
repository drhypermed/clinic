/**
 * نوافذ التأكيد لـ ReadyPrescriptionsModal
 *
 * يُصدّر مكونين صغيرين يُستخدمان داخل المودال الرئيسي للروشتات الجاهزة:
 *   1. `DeletePresetDialog`  — تأكيد حذف قالب روشتة جاهزة نهائياً.
 *   2. `ApplyPresetDialog`   — اختيار دمج/استبدال كل قسم (أدوية/فحوصات/تعليمات)
 *                              عند تطبيق قالب على روشتة لديها بيانات فعلية.
 */

import React from 'react';
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

    return (
        <div className="fixed inset-0 z-[10020] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl" dir="rtl">
                <h4 className="text-lg font-black text-slate-800 mb-2">تأكيد حذف الروشتة الجاهزة</h4>
                <p className="text-sm font-bold text-slate-600 mb-5">
                    هل أنت متأكد من حذف <span className="text-red-600 font-black">{candidate.name}</span>؟ لا يمكن التراجع عن ذلك.
                </p>
                <div className="flex items-center justify-end gap-2">
                    <Button onClick={onCancel} variant="secondary" size="sm">إلغاء</Button>
                    <Button
                        onClick={() => onConfirm(candidate.id)}
                        variant="danger"
                        size="sm"
                    >
                        حذف نهائي
                    </Button>
                </div>
            </div>
        </div>
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

    return (
        <div className="fixed inset-0 z-[10020] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200" dir="rtl">
                <h4 className="text-lg font-black text-slate-800 mb-2">طريقة إضافة الروشتة الجاهزة</h4>
                <p className="text-sm font-bold text-slate-600 mb-4">
                    يوجد بيانات مكتوبة بالفعل في الروشتة الحالية. اختر كيف تريد إضافة {candidate.name}:
                </p>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button onClick={() => setAllApplyModes('merge')} variant="info" size="sm" className="text-xs sm:text-sm">دمج الجميع</Button>
                        <Button onClick={() => setAllApplyModes('replace')} variant="danger" size="sm" className="text-xs sm:text-sm">استبدال الجميع</Button>
                    </div>

                    <div className="border p-3 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-black text-slate-700">الأدوية والملاحظات</div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${hasRealMedsState ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                {hasRealMedsState ? 'يوجد محتوى حالي' : 'لا يوجد محتوى حالي'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setMedicationsMode('merge')} variant={getModeButtonVariant(medicationsMode === 'merge', 'info')} size="sm" className="px-3 py-2 text-xs">دمج</Button>
                            <Button onClick={() => setMedicationsMode('replace')} variant={getModeButtonVariant(medicationsMode === 'replace', 'danger')} size="sm" className="px-3 py-2 text-xs">استبدال</Button>
                        </div>
                    </div>

                    <div className="border p-3 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-black text-slate-700">الفحوصات</div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${hasRealLabsState ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                {hasRealLabsState ? 'يوجد فحوصات حالية' : 'لا يوجد فحوصات حالية'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setLabsMode('merge')} variant={getModeButtonVariant(labsMode === 'merge', 'info')} size="sm" className="px-3 py-2 text-xs">دمج</Button>
                            <Button onClick={() => setLabsMode('replace')} variant={getModeButtonVariant(labsMode === 'replace', 'danger')} size="sm" className="px-3 py-2 text-xs">استبدال</Button>
                        </div>
                    </div>

                    <div className="border p-3 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-black text-slate-700">التعليمات الهامة</div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${hasRealAdviceState ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                {hasRealAdviceState ? 'يوجد تعليمات حالية' : 'لا يوجد تعليمات حالية'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setAdviceMode('merge')} variant={getModeButtonVariant(adviceMode === 'merge', 'info')} size="sm" className="px-3 py-2 text-xs">دمج</Button>
                            <Button onClick={() => setAdviceMode('replace')} variant={getModeButtonVariant(adviceMode === 'replace', 'danger')} size="sm" className="px-3 py-2 text-xs">استبدال</Button>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2">
                        <Button onClick={onCancel} variant="secondary" size="sm">إلغاء</Button>
                        <Button onClick={onConfirm} variant="primary" size="sm">تأكيد الإضافة</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
