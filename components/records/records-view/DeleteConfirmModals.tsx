/**
 * نوافذ تأكيد الحذف لـ RecordsView
 *
 * يغلف هذا المكون الثلاث نوافذ تأكيد حذف الخاصة بـ `RecordsView`:
 *   1. حذف السجل بالكامل (مع الكشف والاستشارة معاً).
 *   2. حذف الكشف فقط (مع الإبقاء على الاستشارة إن وجدت).
 *   3. حذف الاستشارة فقط.
 *
 * الهدف من الفصل هو تقليل حجم `RecordsView.tsx` وتوحيد إدارة حالة
 * المودالات الثلاثة في موضع واحد.
 */

import React from 'react';
import { PatientRecord } from '../../../types';
import { ConfirmModal } from '../../modals/ConfirmModal';

export interface DeleteFullRecordState {
    isOpen: boolean;
    recordId: string | null;
}

export interface DeletePartialRecordState {
    isOpen: boolean;
    record: PatientRecord | null;
}

interface DeleteConfirmModalsProps {
    deleteFullRecord: DeleteFullRecordState;
    setDeleteFullRecord: React.Dispatch<React.SetStateAction<DeleteFullRecordState>>;
    deleteExam: DeletePartialRecordState;
    setDeleteExam: React.Dispatch<React.SetStateAction<DeletePartialRecordState>>;
    deleteConsultation: DeletePartialRecordState;
    setDeleteConsultation: React.Dispatch<React.SetStateAction<DeletePartialRecordState>>;
    onDeleteRecord: (id: string) => void;
    onDeleteExam: (record: PatientRecord) => void;
    onDeleteConsultation: (record: PatientRecord) => void;
}

export const DeleteConfirmModals: React.FC<DeleteConfirmModalsProps> = ({
    deleteFullRecord,
    setDeleteFullRecord,
    deleteExam,
    setDeleteExam,
    deleteConsultation,
    setDeleteConsultation,
    onDeleteRecord,
    onDeleteExam,
    onDeleteConsultation,
}) => {
    return (
        <>
            {/* نافذة التأكيد عند حذف السجل بالكامل */}
            <ConfirmModal
                isOpen={deleteFullRecord.isOpen}
                title="حذف السجل الطبي"
                message="هل أنت متأكد من حذف هذا السجل نهائياً؟"
                onConfirm={() => {
                    if (deleteFullRecord.recordId) onDeleteRecord(deleteFullRecord.recordId);
                    setDeleteFullRecord({ isOpen: false, recordId: null });
                }}
                onCancel={() => setDeleteFullRecord({ isOpen: false, recordId: null })}
                confirmText="حذف نهائي"
                isDanger
            />
            {/* حذف كشف فقط مع بقاء الاستشارة */}
            <ConfirmModal
                isOpen={deleteExam.isOpen}
                title="حذف الكشف"
                message={deleteExam.record?.consultation
                    ? "سيتم حذف بيانات الكشف فقط مع الاحتفاظ بالاستشارة. هل تريد المتابعة؟"
                    : "هذا السجل يحتوي على كشف فقط. حذف الكشف سيحذف السجل بالكامل. هل تريد المتابعة؟"}
                onConfirm={() => {
                    if (deleteExam.record) onDeleteExam(deleteExam.record);
                    setDeleteExam({ isOpen: false, record: null });
                }}
                onCancel={() => setDeleteExam({ isOpen: false, record: null })}
                confirmText="حذف الكشف"
                isDanger
            />
            {/* حذف استشارة فقط */}
            <ConfirmModal
                isOpen={deleteConsultation.isOpen}
                title="حذف الاستشارة"
                message={deleteConsultation.record?.isConsultationOnly
                    ? "هذا السجل عبارة عن استشارة فقط. حذف الاستشارة سيحذف السجل بالكامل. هل تريد المتابعة؟"
                    : "هل أنت متأكد من حذف الاستشارة من هذا السجل؟"}
                onConfirm={() => {
                    if (deleteConsultation.record) onDeleteConsultation(deleteConsultation.record);
                    setDeleteConsultation({ isOpen: false, record: null });
                }}
                onCancel={() => setDeleteConsultation({ isOpen: false, record: null })}
                confirmText="حذف الاستشارة"
                isDanger
            />
        </>
    );
};
