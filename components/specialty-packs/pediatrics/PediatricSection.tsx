/**
 * PediatricSection — قسم متابعه الطفل (النسخه الكامله في ملف المريض)
 *
 * بيلمّ ٣ أجزاء:
 *   1. بيانات الطفل (تاريخ الميلاد + الجنس)
 *   2. قياسات النمو
 *   3. التطعيمات
 *
 * الحفظ التلقائي بـdebounce 800ms.
 */

import React from 'react';
import { LoadingText } from '../../ui/LoadingText';
import { ChildInfoCard } from './ChildInfoCard';
import { GrowthEntriesList } from './GrowthEntriesList';
import { VaccinationsList } from './VaccinationsList';
import { usePediatricFile } from './usePediatricFile';

interface PediatricSectionProps {
    userId?: string | null;
    patientFileNameKey?: string | null;
}

export const PediatricSection: React.FC<PediatricSectionProps> = ({
    userId, patientFileNameKey,
}) => {
    const {
        file, loading, error, isSaving,
        setDateOfBirth, setSex,
        addGrowthEntry, updateGrowthEntry, deleteGrowthEntry,
        updateVaccination, setVaccinationStatus,
    } = usePediatricFile({ userId, patientFileNameKey });

    if (!userId || !patientFileNameKey) {
        return (
            <div className="rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs font-bold text-warning-700">
                مفيش ملف طفل نشط — افتح ملف طفل عشان تشوف متابعه النمو والتطعيمات.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="rounded-xl border border-sky-200 bg-sky-50/30 p-4 text-center">
                <LoadingText>جاري تحميل ملف الطفل</LoadingText>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* مؤشر الحفظ التلقائي */}
            {(isSaving || error) && (
                <div
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                        error
                            ? 'bg-danger-50 border border-danger-200 text-danger-700'
                            : 'bg-sky-50 border border-sky-200 text-sky-700'
                    }`}
                >
                    {error ? `فشل الحفظ: ${error}` : 'جاري حفظ ملف الطفل تلقائياً...'}
                </div>
            )}

            {/* بيانات الطفل */}
            <ChildInfoCard
                dateOfBirth={file.dateOfBirth}
                sex={file.sex}
                onChangeDateOfBirth={setDateOfBirth}
                onChangeSex={setSex}
            />

            {/* قياسات النمو */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
                <GrowthEntriesList
                    dateOfBirth={file.dateOfBirth}
                    entries={file.growthEntries}
                    onAdd={addGrowthEntry}
                    onUpdate={updateGrowthEntry}
                    onDelete={deleteGrowthEntry}
                />
            </div>

            {/* التطعيمات */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
                <VaccinationsList
                    dateOfBirth={file.dateOfBirth}
                    vaccinations={file.vaccinations}
                    onUpdate={updateVaccination}
                    onSetStatus={setVaccinationStatus}
                />
            </div>
        </div>
    );
};

export default PediatricSection;
