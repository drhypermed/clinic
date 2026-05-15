/**
 * RecordPackBadge — شاره صغيره بتظهر جنب اسم المريض في صفحه السجلات
 *
 * بتدمج معلومه سريعه من ملف الحمل أو الأطفال للمريض ده.
 * بتظهر فقط لو الطبيب من تخصص الباكدج والمريض عنده ملف نشط.
 *
 * ملاحظه: الـtone بياخد لونين فقط (pink/sky) عشان نلتزم بنظام الألوان
 * الموحّد بدون classes ديناميكيه (Tailwind purges classes اللي مش معروفه).
 */

import React from 'react';
import { usePackBadgeForPatient } from '../../hooks/usePackBadgeForPatient';

interface RecordPackBadgeProps {
    userId?: string | null;
    patientName?: string | null;
    doctorSpecialty?: string | null;
    patientFileId?: string | null;
    patientFileNumber?: number | null;
    patientFileNameKey?: string | null;
}

export const RecordPackBadge: React.FC<RecordPackBadgeProps> = ({
    userId, patientName, doctorSpecialty, patientFileId, patientFileNumber, patientFileNameKey,
}) => {
    const badge = usePackBadgeForPatient(
        userId,
        patientName,
        doctorSpecialty,
        patientFileId,
        patientFileNumber,
        patientFileNameKey,
    );
    if (!badge) return null;

    // ألوان ثابته حسب نوع الباكدج
    const toneClass = badge.tone === 'pink'
        ? 'bg-pink-50 border-pink-200 text-pink-700'
        : 'bg-sky-50 border-sky-200 text-sky-700';

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] font-black whitespace-nowrap ${toneClass}`}
            title="بيانات مأخوذه من ملف متابعه التخصص"
        >
            {badge.label}
        </span>
    );
};
