/**
 * مكون نافذة التأكيد (Confirmation Modal)
 * نافذة تظهر لطلب تأكيد المستخدم قبل تنفيذ إجراءات حساسة (مثل الحذف).
 */

import React from 'react';
import { ModalOverlay } from '../ui/ModalOverlay';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'نعم، تنفيذ',
    cancelText = 'إلغاء',
    isDanger = false
}) => {
    return (
        <ModalOverlay
            isOpen={isOpen}
            onClose={onCancel}
            contentClassName="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden"
        >
            <div className="p-6 text-center">
                {/* أيقونة تنبيه ملونة (أحمر للحذف، أزرق للمعلومات) */}
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {isDanger ? <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> : <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 font-bold leading-relaxed">{message}</p>
            </div>
            {/* أزرار التحكم في أسفل النافذة */}
            <div className="bg-slate-50 p-4 flex gap-3 justify-center border-t border-slate-100">
                <button onClick={onCancel} className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors">{cancelText}</button>
                <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-transform active:scale-95 ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{confirmText}</button>
            </div>
        </ModalOverlay>
    );
};
