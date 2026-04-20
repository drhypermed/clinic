/**
 * نافذة اختيار تاريخ سجل فائت (Past Record Date Picker Modal)
 *
 * يستخدمها `RecordsView` عندما يختار الطبيب "إضافة كشف فائت" أو "إضافة
 * استشارة فائتة" لسجل تاريخه سابق. تعرض النافذة:
 *   - عنوان ديناميكي حسب النوع (كشف / استشارة).
 *   - حقل إدخال تاريخ (max = اليوم).
 *   - زر تأكيد + زر إلغاء.
 *
 * عند التأكيد، تستدعي `onConfirm` بنص التاريخ النهائي (مع الوقت إن وجد).
 */

import React from 'react';
import { createPortal } from 'react-dom';

export type PastRecordModalType = 'exam' | 'consultation';

export interface PastRecordModalState {
    isOpen: boolean;
    type: PastRecordModalType | null;
    selectedDate: string;
    selectedTime: string;
}

interface PastRecordDatePickerModalProps {
    state: PastRecordModalState;
    onStateChange: React.Dispatch<React.SetStateAction<PastRecordModalState>>;
    todayStr: string;
    onConfirm: (type: PastRecordModalType, datetime: string) => void;
}

export const PastRecordDatePickerModal: React.FC<PastRecordDatePickerModalProps> = ({
    state,
    onStateChange,
    todayStr,
    onConfirm,
}) => {
    if (!state.isOpen) return null;

    const reset = () => onStateChange({ isOpen: false, type: null, selectedDate: todayStr, selectedTime: '' });

    return createPortal(
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center z-[9995] p-3 sm:p-4 overflow-y-auto"
            onClick={reset}
        >
            <div
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-black text-slate-800 mb-1">
                    {state.type === 'exam' ? 'إضافة كشف فائت' : 'إضافة استشارة فائتة'}
                </h3>
                <p className="text-sm text-slate-400 font-medium mb-4">اختر تاريخ الزيارة</p>
                <div className="space-y-3">
                    <input
                        type="date"
                        value={state.selectedDate}
                        max={todayStr}
                        onChange={(e) => onStateChange({ ...state, selectedDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none text-slate-800 font-medium text-sm"
                    />
                    <div className="flex gap-2.5">
                        <button
                            onClick={() => {
                                const datetime = state.selectedTime
                                    ? `${state.selectedDate}T${state.selectedTime}:00`
                                    : state.selectedDate;
                                if (state.type) {
                                    onConfirm(state.type, datetime);
                                }
                                reset();
                            }}
                            className="flex-1 px-4 py-3 rounded-xl text-white font-black bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm hover:shadow-md transition-all"
                        >
                            تأكيد
                        </button>
                        <button
                            onClick={reset}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
