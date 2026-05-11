/**
 * SpecialtyPackDiagnostic — بانر تشخيصي مؤقت لحزم التخصصات
 *
 * بيظهر في كشف جديد لو الطبيب فيه احتمال يكون مؤهل للحزمه لكنها مش ظاهره.
 * بيشرح للطبيب بالظبط ليه الحزمه مش ظاهره:
 *   1. التخصص في حسابه مش مطابق
 *   2. الأدمن ما فعّلش الحزمه
 *
 * بمجرد ما المشكله تتحل، البانر يختفي تلقائياً.
 */

import React from 'react';
import { useSpecialtyPacksConfig } from '../../hooks/useSpecialtyPack';
import {
    PACK_DISPLAY_NAMES, PACK_SPECIALTIES,
    type SpecialtyPackId,
} from '../../services/specialty-packs';

interface SpecialtyPackDiagnosticProps {
    doctorSpecialty?: string;
}

// كلمات مفتاحيه بتدل على تخصصات الحزم — لو موجوده في التخصص لكن مش مطابق بالظبط، نطبع تنبيه
const KEYWORDS_FOR_PACK: Record<SpecialtyPackId, string[]> = {
    gynecology: ['نسا', 'توليد'],
    pediatrics: ['أطفال', 'اطفال'],
};

export const SpecialtyPackDiagnostic: React.FC<SpecialtyPackDiagnosticProps> = ({
    doctorSpecialty,
}) => {
    const config = useSpecialtyPacksConfig();
    const specialty = String(doctorSpecialty || '').trim();

    if (!specialty) return null;

    // ندوّر على باكدج محتمل بناء على الكلمات المفتاحيه
    const packIds = Object.keys(PACK_SPECIALTIES) as SpecialtyPackId[];
    let candidatePack: SpecialtyPackId | null = null;
    for (const id of packIds) {
        const keywords = KEYWORDS_FOR_PACK[id] || [];
        if (keywords.some((k) => specialty.includes(k))) {
            candidatePack = id;
            break;
        }
    }

    if (!candidatePack) return null;

    const isExactMatch = PACK_SPECIALTIES[candidatePack].includes(specialty);
    const isPackEnabled = Boolean(config.packs[candidatePack]?.enabled);

    // لو كل شيء سليم، الحزمه شغّاله، ما نعرضش البانر
    if (isExactMatch && isPackEnabled) return null;

    // نعرض تنبيه يشرح المشكله
    const expectedSpecialty = PACK_SPECIALTIES[candidatePack][0];
    const packName = PACK_DISPLAY_NAMES[candidatePack];

    return (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 sm:p-4 my-2">
            <div className="flex items-start gap-2">
                <span aria-hidden className="text-lg shrink-0">🔧</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-amber-800 mb-1">
                        تشخيص حزمه التخصص
                    </p>
                    <div className="text-[11px] sm:text-xs text-amber-900 space-y-1 leading-relaxed">
                        <p>
                            <strong>تخصصك المسجّل:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 font-mono">{specialty}</code>
                        </p>
                        <p>
                            <strong>التخصص المطلوب لـ"{packName}":</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 font-mono">{expectedSpecialty}</code>
                        </p>
                        {!isExactMatch && (
                            <p className="font-bold text-danger-700 pt-1">
                                ❌ التخصص في حسابك مش مطابق للتخصص المطلوب بالظبط. عدّل تخصصك من البروفايل (الصوره الشخصيه ← بيانات الطبيب) واختار من القائمه: "{expectedSpecialty}".
                            </p>
                        )}
                        {isExactMatch && !isPackEnabled && (
                            <p className="font-bold text-danger-700 pt-1">
                                ❌ الحزمه مش مفعّله من الأدمن. روح لوحه الأدمن ← النظام ← حزم التخصصات ← فعّل "{packName}" ← احفظ.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
