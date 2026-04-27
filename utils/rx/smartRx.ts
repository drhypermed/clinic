import { PatientRecord, PrescriptionItem, VitalSigns } from '../../types';
import { analyzeComplaint, translateClinicalData } from '../../services/geminiRxService';
import { consumeTranslationQuota } from '../../services/accountTypeControlsService';
import { formatLabInvestigationItem, normalizeAdviceList } from './rxUtils';

/** إدخالات محرك "دكتور هايبر الذكي" */
type SmartRxInput = {
    complaint: string;          // شكوى المريض (بالعربي)
    medicalHistory: string;     // التاريخ المرضي
    examination: string;        // نتائج الفحص السريري
    investigations: string;     // الفحوصات السابقة
    complaintEn: string;        // الحقول الإنجليزية (يتم ملؤها تلقائياً بالترجمة)
    historyEn: string;
    examEn: string;
    investigationsEn: string;
    diagnosisEn: string;
    ageYears: string;
    ageMonths: string;
    ageDays: string;
    weightKg: number;           // وزن الطفل (حرج لحساب الجرعات)
    totalAgeInMonths: number;
    vitals: VitalSigns;         // العلامات الحيوية (حرارة، نبض، إلخ)
    records?: PatientRecord[];  // سجلات سابقة للمقارنة
    /** userId اختياري — يُمرَّر للكاش per-doctor في ترجمة الحقول السريرية */
    userId?: string | null;
    /** تخصص الطبيب — يساعد الموديل ينتقي المصطلحات الإنجليزية الأنسب للتخصص. */
    doctorSpecialty?: string;
    /**
     * لو true — نتخطى استدعاء analyzeComplaint نهائياً (نوفر نداء AI كامل)
     * ونخلي diagnosisEn فاضي للطبيب يكتبه بنفسه أو يضيفه من نافذة التحليل.
     * مصمم لفلو "تحليل الحالة الغني" اللي فيه popup بالتشخيصات التفريقية.
     */
    skipDiagnosis?: boolean;
};

/** مخرجات المحرك الذكي */
type SmartRxOutput = {
    rxItems: PrescriptionItem[]; // قائمة الأدوية (دائماً فارغة برمجياً احتراماً لقرار الطبيب)
    generalAdvice: string[];     // نصائح عامة مقترحة
    labInvestigations: string[]; // تحاليل مقترحة بناءً على التشخيص
    translated: {                // النسخة المترجمة من البيانات للروشتة الاحترافية
        complaintEn: string;
        historyEn: string;
        examEn: string;
        investigationsEn: string;
        diagnosisEn: string;
    };
};

const toSafeInt = (v: string): number => {
    const n = parseInt((v ?? '').toString(), 10);
    return Number.isFinite(n) ? n : 0;
};

/** اختيار أول نص متاح غير فارغ من عدة خيارات */
const pickText = (...values: Array<string | undefined | null>): string => {
    for (const v of values) {
        const s = (v ?? '').toString().trim();
        if (s) return s;
    }
    return '';
};

const hasInputText = (value: string | undefined | null): boolean => {
    return (value ?? '').toString().trim().length > 0;
};

const NO_PERTINENT_INFO = 'No pertinent information.';

/**
 * دالة تشغيل محرك "دكتور هايبر" (runSmartRx):
 * هذا هو العقل المفكر في التطبيق. يقوم بدمج الذكاء الاصطناعي (Gemini) مع القواعد الطبية.
 * الوظائف الأساسية:
 * 1. تحليل الشكوى واستنتاج التشخيص والتحليل المطلوب.
 * 2. ترجمة البيانات الطبية من العربية إلى الإنجليزية الطبية الدقيقة بشكل آلي.
 * 3. *تنبيه*: النظام مصمم لعدم اقتراح أدوية عبر الـ AI لضمان أمان المريض،
 *    ويترك حرية اختيار الدواء للطبيب عبر محرك البحث اليدوي.
 */
export const runSmartRx = async (input: SmartRxInput): Promise<SmartRxOutput> => {
    const ageDetails = {
        years: toSafeInt(input.ageYears),
        months: toSafeInt(input.ageMonths),
        days: toSafeInt(input.ageDays)
    };

    let result: any = null;
    // لو skipDiagnosis=true نتخطى استدعاء analyzeComplaint بالكامل (توفير نداء AI كامل).
    // بيستخدم لما فلو "تحليل الحالة الغني" شغال لأنه عنده نداء AI منفصل (analyzeCaseDeeply)
    // بيرجع قائمة تشخيصات تفريقية، مش تشخيص واحد.
    if (!input.skipDiagnosis) {
        try {
            /**
             * الاتصال بـ Gemini AI:
             * يرسل مدخلات الطبيب ويستقبل تحليلاً شاملاً للحالة.
             */
            result = await analyzeComplaint(
                input.complaint,
                input.medicalHistory,
                input.examination,
                input.investigations,
                ageDetails,
                Number.isFinite(input.weightKg) ? input.weightKg : 0,
                input.vitals
            );
        } catch (e) {
            console.error('SmartRx AI Analysis failed:', e);
            result = null;
        }
    }

    // لو تخطينا التشخيص نعدّي diagnosisEn الأصلي كما هو (ممكن يكون فاضي)
    const diagnosisForTranslation = input.skipDiagnosis
        ? (input.diagnosisEn || '')
        : pickText(result?.diagnosisAr, result?.diagnosisEn, input.diagnosisEn);
    const diagnosisFallbackEn = input.skipDiagnosis
        ? (input.diagnosisEn || '')
        : pickText(result?.diagnosisEn, input.diagnosisEn);

    /**
     * ترجمة البيانات السريرية (Translation Layer):
     * تقوم بتحويل مدخلات الطبيب العربية السريعة إلى مصطلحات طبية إنجليزية رصينة.
     * userId بنمرره للكاش per-doctor — لو الطبيب كتب نفس الشكوى قبل كده، الترجمة
     * بترجع فوراً من IndexedDB بدون استدعاء Gemini.
     *
     * ─── فحص حد الترجمة اليومي (server-side enforcement) ───
     * كانت الترجمة بتشتغل بدون أي حد. دلوقتي قبل أي ترجمة بنستهلك كوتا واحدة
     * من الحد اللي الأدمن ضبطه في صفحة "التحكم في أنواع الحساب". لو الطبيب وصل
     * للحد، السيرفر بيرفض ويرجع رسالة الأدمن المخصّصة + رابط واتساب للترقية.
     *
     * ملاحظة: بنفحص الحد بس لو في نص سريري فعلاً (لو كل الحقول فاضية، الترجمة
     * بترجع early بدون استدعاء AI، فمفيش معنى نخصم كوتا).
     */
    const hasAnyClinicalText = !!(
        input.complaint?.trim() ||
        input.medicalHistory?.trim() ||
        input.examination?.trim() ||
        diagnosisForTranslation?.trim() ||
        input.investigations?.trim()
    );
    if (input.userId && hasAnyClinicalText) {
        // لو الكوتا انتهت — السيرفر بيرمي error.
        // الـerror بيتنشّر للـcaller (smartActions) اللي بيعرض رسالة + واتساب.
        await consumeTranslationQuota();
    }

    const translations = await translateClinicalData(
        input.complaint,
        input.medicalHistory,
        input.examination,
        diagnosisForTranslation,
        input.investigations,
        input.userId,
        input.doctorSpecialty,
    );

    return {
        // نلتزم بسياسة "الطبيب هو صاحب القرار": لا نضع أدوية مقترحة آلياً
        rxItems: [],
        
        // جلب النصائح الطبية المقترحة وتطهيرها من التكرار
        generalAdvice: normalizeAdviceList(result?.generalAdviceAr || []),
        
        // تنسيق التحاليل المقترحة لتظهر بشكل احترافي
        labInvestigations: (result?.labInvestigations || [])
            .map(formatLabInvestigationItem)
            .filter(Boolean)
            .slice(0, 8),

        // تجميع الترجمات النهائية للروشتة
        translated: {
            complaintEn: pickText(translations.complaintEn, input.complaintEn, input.complaint),
            historyEn: hasInputText(input.medicalHistory) || hasInputText(input.historyEn)
                ? pickText(translations.historyEn, input.historyEn, input.medicalHistory)
                : NO_PERTINENT_INFO,
            examEn: hasInputText(input.examination) || hasInputText(input.examEn)
                ? pickText(translations.examEn, input.examEn, input.examination)
                : NO_PERTINENT_INFO,
            investigationsEn: hasInputText(input.investigations) || hasInputText(input.investigationsEn)
                ? pickText(translations.investigationsEn, input.investigationsEn, input.investigations)
                : NO_PERTINENT_INFO,
            diagnosisEn: pickText(translations.diagnosisEn, diagnosisFallbackEn, result?.diagnosisEn, input.diagnosisEn),
        }
    };
};
