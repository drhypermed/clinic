/**
 * أنواع البيانات المالية (Financial Data Types)
 * يحتوي هذا الملف على جميع واجهات البيانات المستخدمة في وحدة `financial-data`:
 *   1. البيانات اليومية (`DailyFinancialData`) — دخل التداخلات والمصروفات اليومية.
 *   2. البيانات الشهرية (`MonthlyFinancialData`) — المصروفات الثابتة (إيجار/رواتب/إلخ).
 *   3. مسميات بنود الدخل (`FinancialLabels`) — عناوين قابلة للتخصيص.
 *   4. سجل تغييرات الأسعار (`PriceChangeHistoryEntry`) — لأرشفة قرارات تغيير
 *      أسعار الكشف/الاستشارة مع الوقت.
 */

/** هيكل البيانات المالية اليومية */
export interface DailyFinancialData {
    interventionsRevenue?: number; // دخل التداخلات (عمليات، حقن، إلخ)
    otherRevenue?: number;         // مصادر دخل أخرى
    dailyExpense?: number;         // مصروفات يومية نصرية
    insuranceExtras?: any[];       // إيرادات مطالبات شركات التأمين لهذا اليوم في التداخلات أو دخل آخر
    cashCostItems?: any[];         // عناصر التكاليف النقدية من ملفات المرضى — مطلوبة للمزامنة عبر الأجهزة
    updatedAt?: number;            // تاريخ آخر تحديث
}

/** هيكل البيانات المالية الشهرية (المصروفات الثابتة) */
export interface MonthlyFinancialData {
    rentExpense?: number;          // إيجار العيادة
    salariesExpense?: number;      // رواتب الموظفين
    toolsExpense?: number;         // أدوات ومستلزمات طبية
    electricityExpense?: number;   // فواتير (كهرباء، ماء، إنترنت)
    otherExpense?: number;         // مصروفات شهرية أخرى
    updatedAt?: number;            // تاريخ آخر تحديث
}

/** هيكل مسميات بنود الدخل (لتخصيص الأسماء في الواجهة) */
export interface FinancialLabels {
    interventionsLabel?: string;   // المسمى المخصص لـ "التداخلات"
    otherRevenueLabel?: string;    // المسمى المخصص لـ "دخل آخر"
    updatedAt?: number;
}

/** سجل تغيير لأسعار الكشف والاستشارة */
export interface PriceChangeHistoryEntry {
    id: string;
    changedAt: number;
    oldExaminationPrice: number;
    newExaminationPrice: number;
    oldConsultationPrice: number;
    newConsultationPrice: number;
}

/** هيكل مبسط لأسعار الكشف/الاستشارة (كنصوص) — يُستخدم في الـ prices module */
export interface PricesTextPayload {
    examinationPrice?: string;
    consultationPrice?: string;
    updatedAt?: number;
}
