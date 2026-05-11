/**
 * specialtyPackAppendix — ملحق حزم التخصصات في التقرير الطبي
 *
 * بيرجع HTML بسيط (بدون أي JS) للجزء اللي بيتضاف في نهايه التقرير
 * لو في بيانات من باكدج النسا أو الأطفال. مفصول عن التمبليت الأساسي
 * عشان نلتزم بحد الـ500 سطر.
 */

import type {
    ClinicalReportLanguage,
    PatientClinicalTimelineSnapshot,
    ReportPediatricTracking,
    ReportPregnancyTracking,
} from './types';

const escapeHtml = (value: string): string =>
    String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const formatDate = (iso?: string): string => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

const labels = (language: ClinicalReportLanguage) => {
    if (language === 'en') {
        return {
            pregnancyTitle: 'Pregnancy Tracking',
            lmp: 'LMP',
            edd: 'EDD',
            currentWeek: 'Current week',
            closed: 'Pregnancy closed',
            visits: 'Visits',
            visitDate: 'Date',
            week: 'Week',
            fetalWeight: 'Fetal weight',
            fetalHR: 'Fetal HR',
            movement: 'Movement',
            maternalWeight: 'Maternal wt.',
            ultrasound: 'Ultrasound',
            notes: 'Notes',
            pediatricTitle: 'Pediatric Tracking',
            dob: 'Date of birth',
            sex: 'Sex',
            growth: 'Growth measurements',
            weight: 'Weight (kg)',
            height: 'Height (cm)',
            headCirc: 'Head circ. (cm)',
            vaccinations: 'Vaccinations (Egyptian schedule)',
            vaccine: 'Vaccine',
            age: 'Age',
            status: 'Status',
            given: 'Given',
            givenOn: 'Given on',
            skipped: 'Skipped',
            pending: 'Pending',
            male: 'Male',
            female: 'Female',
            delivery: 'Delivery',
            miscarriage: 'Miscarriage',
            other: 'Other',
            movementNormal: 'Normal',
            movementDecreased: 'Decreased',
            movementAbsent: 'Absent',
        };
    }
    return {
        pregnancyTitle: 'متابعه الحمل',
        lmp: 'تاريخ آخر دوره (LMP)',
        edd: 'ميعاد الولاده المتوقع',
        currentWeek: 'الأسبوع الحالي',
        closed: 'حاله الإغلاق',
        visits: 'الزيارات',
        visitDate: 'التاريخ',
        week: 'الأسبوع',
        fetalWeight: 'وزن الجنين',
        fetalHR: 'نبض الجنين',
        movement: 'الحركه',
        maternalWeight: 'وزن الأم',
        ultrasound: 'السونار',
        notes: 'ملاحظات',
        pediatricTitle: 'متابعه الطفل',
        dob: 'تاريخ الميلاد',
        sex: 'الجنس',
        growth: 'قياسات النمو',
        weight: 'الوزن (كجم)',
        height: 'الطول (سم)',
        headCirc: 'محيط الرأس (سم)',
        vaccinations: 'التطعيمات (جدول وزاره الصحه)',
        vaccine: 'اللقاح',
        age: 'العمر',
        status: 'الحاله',
        given: 'اتاخد',
        givenOn: 'اتاخد في',
        skipped: 'تم تخطيه',
        pending: 'لم يُؤخذ',
        male: 'ولد',
        female: 'بنت',
        delivery: 'تمت الولاده',
        miscarriage: 'إجهاض',
        other: 'أخرى',
        movementNormal: 'طبيعيه',
        movementDecreased: 'قليله',
        movementAbsent: 'غايبه',
    };
};

const buildPregnancySection = (
    data: ReportPregnancyTracking,
    L: ReturnType<typeof labels>,
): string => {
    const closureLabel = data.closureType
        ? data.closureType === 'delivery' ? L.delivery
        : data.closureType === 'miscarriage' ? L.miscarriage
        : L.other
        : '';

    const visitRows = data.visits.map((v) => {
        const movement = v.fetalMovement === 'normal' ? L.movementNormal
            : v.fetalMovement === 'decreased' ? L.movementDecreased
            : v.fetalMovement === 'absent' ? L.movementAbsent
            : '—';
        return `
            <tr>
                <td>${escapeHtml(formatDate(v.dateKey))}</td>
                <td>${v.gestationalWeek ? escapeHtml(String(v.gestationalWeek)) : '—'}</td>
                <td>${v.maternalWeight ? escapeHtml(v.maternalWeight) + ' kg' : '—'}</td>
                <td>${v.fetalWeight ? escapeHtml(v.fetalWeight) + ' g' : '—'}</td>
                <td>${v.fetalHeartRate ? escapeHtml(v.fetalHeartRate) + ' bpm' : '—'}</td>
                <td>${escapeHtml(movement)}</td>
                <td>${escapeHtml(v.ultrasoundNotes || v.notes || '—')}</td>
            </tr>
        `;
    }).join('');

    return `
    <section class="pack-section pack-section--pregnancy">
        <h3 class="pack-title">🤰 ${L.pregnancyTitle}</h3>
        <div class="pack-summary">
            ${data.lmp ? `<div><strong>${L.lmp}:</strong> ${escapeHtml(formatDate(data.lmp))}</div>` : ''}
            ${data.edd ? `<div><strong>${L.edd}:</strong> ${escapeHtml(formatDate(data.edd))}</div>` : ''}
            ${data.currentWeek ? `<div><strong>${L.currentWeek}:</strong> ${escapeHtml(String(data.currentWeek))}</div>` : ''}
            ${data.closedAt ? `<div><strong>${L.closed}:</strong> ${escapeHtml(closureLabel)} (${escapeHtml(formatDate(data.closedAt))})</div>` : ''}
        </div>
        ${data.visits.length > 0 ? `
        <h4 class="pack-subtitle">${L.visits} (${data.visits.length})</h4>
        <table class="pack-table">
            <thead><tr>
                <th>${L.visitDate}</th>
                <th>${L.week}</th>
                <th>${L.maternalWeight}</th>
                <th>${L.fetalWeight}</th>
                <th>${L.fetalHR}</th>
                <th>${L.movement}</th>
                <th>${L.notes}</th>
            </tr></thead>
            <tbody>${visitRows}</tbody>
        </table>
        ` : ''}
    </section>`;
};

const buildPediatricSection = (
    data: ReportPediatricTracking,
    L: ReturnType<typeof labels>,
): string => {
    const sexLabel = data.sex === 'male' ? L.male : data.sex === 'female' ? L.female : '';

    const growthRows = data.growthEntries.map((g) => `
        <tr>
            <td>${escapeHtml(formatDate(g.dateKey))}</td>
            <td>${escapeHtml(g.weightKg || '—')}</td>
            <td>${escapeHtml(g.heightCm || '—')}</td>
            <td>${escapeHtml(g.headCircCm || '—')}</td>
            <td>${escapeHtml(g.notes || '—')}</td>
        </tr>
    `).join('');

    const vacRows = data.vaccinations.map((v) => {
        const statusLabel = v.status === 'given' ? (v.givenDate ? `${L.given} (${formatDate(v.givenDate)})` : L.given)
            : v.status === 'skipped' ? L.skipped
            : L.pending;
        return `
            <tr>
                <td>${escapeHtml(v.shortName)}</td>
                <td>${escapeHtml(v.ageLabel)}</td>
                <td>${escapeHtml(statusLabel)}</td>
            </tr>
        `;
    }).join('');

    return `
    <section class="pack-section pack-section--pediatric">
        <h3 class="pack-title">👶 ${L.pediatricTitle}</h3>
        <div class="pack-summary">
            ${data.dateOfBirth ? `<div><strong>${L.dob}:</strong> ${escapeHtml(formatDate(data.dateOfBirth))}</div>` : ''}
            ${sexLabel ? `<div><strong>${L.sex}:</strong> ${escapeHtml(sexLabel)}</div>` : ''}
        </div>
        ${data.growthEntries.length > 0 ? `
        <h4 class="pack-subtitle">${L.growth} (${data.growthEntries.length})</h4>
        <table class="pack-table">
            <thead><tr>
                <th>${L.visitDate}</th>
                <th>${L.weight}</th>
                <th>${L.height}</th>
                <th>${L.headCirc}</th>
                <th>${L.notes}</th>
            </tr></thead>
            <tbody>${growthRows}</tbody>
        </table>
        ` : ''}
        ${data.vaccinations.length > 0 ? `
        <h4 class="pack-subtitle">${L.vaccinations}</h4>
        <table class="pack-table">
            <thead><tr>
                <th>${L.vaccine}</th>
                <th>${L.age}</th>
                <th>${L.status}</th>
            </tr></thead>
            <tbody>${vacRows}</tbody>
        </table>
        ` : ''}
    </section>`;
};

/** الـCSS الخاص بالملحق — يتدرج في style block التقرير */
export const SPECIALTY_PACK_APPENDIX_CSS = `
.pack-section { margin-top: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }
.pack-section--pregnancy { border-color: #fbcfe8; background: #fdf2f8; }
.pack-section--pediatric { border-color: #bae6fd; background: #f0f9ff; }
.pack-title { font-size: 16px; font-weight: 900; margin: 0 0 12px; color: #1e293b; }
.pack-subtitle { font-size: 13px; font-weight: 700; margin: 14px 0 6px; color: #475569; }
.pack-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px 14px; font-size: 12px; margin-bottom: 8px; }
.pack-summary strong { color: #334155; }
.pack-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
.pack-table th, .pack-table td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: start; }
.pack-table th { background: #e2e8f0; font-weight: 700; color: #334155; }
.pack-table tbody tr:nth-child(even) { background: #ffffff; }
`;

/** بنّاء HTML الملحق — يرجع نص فاضي لو مفيش بيانات */
export const buildSpecialtyPackAppendix = (
    snapshot: PatientClinicalTimelineSnapshot,
    language: ClinicalReportLanguage,
): string => {
    const sections: string[] = [];
    const L = labels(language);

    if (snapshot.pregnancyTracking) {
        sections.push(buildPregnancySection(snapshot.pregnancyTracking, L));
    }
    if (snapshot.pediatricTracking) {
        sections.push(buildPediatricSection(snapshot.pediatricTracking, L));
    }

    return sections.join('');
};
