import { useCallback, useMemo } from 'react';
import type { Medication } from '../../types';
import { useMedications } from './useMedications';
import { getIndicationKeywordsForCategory } from '../../app/drug-catalog/categoryIndicationKeywords';

interface IndexedMedication {
    med: Medication;
    idx: number;
    nameNorm: string;
    genericNorm: string;
    usageNorm: string;
    instructionsNorm: string;
    categoryNorm: string;
    keywordsNorm: string;
}

export const useMedicationSearch = () => {
    const medications = useMedications();

    const normalizeText = (text?: string) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/[أإآ]/g, 'ا') // توحيد الألفات
            .replace(/ة/g, 'ه')    // توحيد التاء المربوطة والهاء
            .replace(/ى/g, 'ي')    // توحيد الألف اللينة والياء
            .replace(/ؤ/g, 'و')
            .replace(/ئ/g, 'ي')
            .replace(/ڤ/g, 'ف')
            .trim();
    };

    const indexedMedications = useMemo<IndexedMedication[]>(() => {
        return medications.map((med, idx) => {
            const ownKeywords = med.matchKeywords || [];
            const categoryKeywords = getIndicationKeywordsForCategory(med.category as string);
            const keywordsNorm = [...ownKeywords, ...categoryKeywords]
                .map((keyword) => normalizeText(keyword))
                .filter(Boolean)
                .join(' ');

            return {
                med,
                idx,
                nameNorm: normalizeText(med.name),
                genericNorm: normalizeText(med.genericName),
                usageNorm: normalizeText(med.usage),
                instructionsNorm: normalizeText(med.instructions),
                categoryNorm: normalizeText(med.category as string),
                keywordsNorm,
            };
        });
    }, [medications]);

    const search = useCallback((query: string, favorites: string[] = []): Medication[] => {
        const term = normalizeText(query);

        if (!term) {
            if (favorites.length > 0) {
                const favoritesSet = new Set(favorites);
                return indexedMedications
                    .filter((item) => favoritesSet.has(item.med.id))
                    .map((item) => item.med);
            }
            return [];
        }

        const termLen = term.length;

        type Ranked = { med: Medication; rank: number; idx: number };
        const ranked: Ranked[] = [];

        for (let idx = 0; idx < indexedMedications.length; idx++) {
            const current = indexedMedications[idx];
            const m = current.med;
            let rank = -1;

            if (termLen <= 2) {
                if (current.nameNorm.startsWith(term)) rank = 0;
                else if (current.genericNorm.startsWith(term)) rank = 1;
                else if (current.nameNorm.includes(term)) rank = 2;
                else if (current.genericNorm.includes(term)) rank = 3;
            } else {
                if (current.nameNorm.startsWith(term)) rank = 0;
                else if (current.genericNorm.startsWith(term)) rank = 1;
                else if (current.nameNorm.includes(term)) rank = 2;
                else if (current.genericNorm.includes(term)) rank = 3;
                else if (current.keywordsNorm && current.keywordsNorm.includes(term)) rank = 4;
                else if (current.usageNorm.includes(term)) rank = 5;
                else if (current.instructionsNorm.includes(term)) rank = 5.5;
                else if (current.categoryNorm.includes(term)) rank = 6;
            }

            if (rank >= 0) ranked.push({ med: m, rank, idx });
        }

        return ranked
            .sort((a, b) => (a.rank - b.rank) || (a.idx - b.idx))
            .slice(0, 50)
            .map(x => x.med);
    }, [indexedMedications]);

    return { search };
};

