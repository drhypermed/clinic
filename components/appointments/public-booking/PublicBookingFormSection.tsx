/**
 * الملف: PublicBookingFormSection.tsx
 * الوصف: "نافذة تسجيل المرضى الجدد". 
 * هذا القسم هو المسؤول عن عملية الإدخال (Data Entry)، حيث يوفر للفني أو السكرتير: 
 * - إمكانية إضافة مريض جديد (كشف/استشارة) للجدول. 
 * - وضع "التعديل" (Edit Mode) لتصحيح بيانات مريض محجوز مسبقاً. 
 * - البحث الذكي واقتراح المرضى من قاعدة البيانات لتوفير وقت الكتابة. 
 * - عرض تنبيهات الكوتا (Quota) إذا امتلأ جدول المواعيد.
 */
import React from 'react';
import { LoadingText } from '../../ui/LoadingText';
import { BookingQuotaNotice } from '../public-booking-form/types';
import { PatientSuggestionOption } from '../add-appointment-form/types';
import { RecentExamPatientOption } from './types';
import { AddAppointmentForm } from '../AddAppointmentForm';
import type {
  AppointmentType,
  PatientGender,
  PaymentType,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsInput,
  SecretaryVitalsVisibility,
} from '../../../types';
import type { InsuranceCompany } from '../../../services/insuranceService';
import type { DiscountReason } from '../../../services/discountReasonService';

/**
 * الخصائص (Props) التي يتقبلها مكون نموذج الحجز
 * تشمل كل ما يتعلق ببيانات المريض (الاسم، السن، الهاتف) وحالة النموذج (تحميل، أخطاء، الخ)
 */
type PublicBookingFormSectionProps = {
  bookingFormOpen: boolean; // هل قسم النموذج مفتوح أم مغلق؟
  onToggleOpen: () => void; // دالة لفتح وإغلاق القسم
  editingAppointmentId: string | null; // معرف الموعد الذي يتم تعديله حالياً (في حال تعديل موعد قديم)
  onCancelEdit: () => void;
  bookingFormLoading: boolean;
  patientName: string;
  onPatientNameChange: (value: string) => void;
  age: string;
  onAgeChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  gender: PatientGender | '';
  onGenderChange: (value: PatientGender | '') => void;
  pregnant: boolean | null;
  onPregnantChange: (value: boolean | null) => void;
  breastfeeding: boolean | null;
  onBreastfeedingChange: (value: boolean | null) => void;
  dateStr: string;
  onDateStrChange: (value: string) => void;
  timeStr: string;
  onTimeStrChange: (value: string) => void;
  visitReason: string;
  onVisitReasonChange: (value: string) => void;
  secretaryVitals: SecretaryVitalsInput;
  secretaryVitalFields: SecretaryVitalFieldDefinition[];
  secretaryVitalsVisibility: SecretaryVitalsVisibility;
  onSecretaryVitalsChange: (value: SecretaryVitalsInput) => void;
  todayStr: string;
  timeMin: string | undefined;
  submitting: boolean;
  formError: string | null;
  bookingQuotaNotice: BookingQuotaNotice | null;
  appointmentType: AppointmentType;
  onAppointmentTypeChange: (value: AppointmentType) => void;
  visibleConsultationCandidates: RecentExamPatientOption[];
  canLoadMoreConsultationCandidates?: boolean;
  onLoadMoreConsultationCandidates?: () => void;
  selectedConsultationCandidateId: string;
  onSelectConsultationCandidate: (candidate: RecentExamPatientOption) => void;
  patientSuggestions: PatientSuggestionOption[];
  onSelectPatientSuggestion: (candidate: PatientSuggestionOption) => void;
  onSubmit: (e: React.FormEvent) => void;
  // تأمين
  paymentType?: PaymentType;
  onPaymentTypeChange?: (type: PaymentType) => void;
  insuranceCompanyId?: string;
  onInsuranceCompanyIdChange?: (id: string) => void;
  insuranceCompanyName?: string;
  onInsuranceCompanyNameChange?: (name: string) => void;
  insuranceMembershipId?: string;
  onInsuranceMembershipIdChange?: (id: string) => void;
  insuranceApprovalCode?: string;
  onInsuranceApprovalCodeChange?: (code: string) => void;
  patientSharePercent?: number;
  onPatientSharePercentChange?: (percent: number) => void;
  discountAmount?: number;
  onDiscountAmountChange?: (amount: number) => void;
  discountPercent?: number;
  onDiscountPercentChange?: (percent: number) => void;
  discountReasonId?: string;
  onDiscountReasonIdChange?: (id: string) => void;
  discountReasonLabel?: string;
  onDiscountReasonLabelChange?: (label: string) => void;
  discountReasons?: DiscountReason[];
  insuranceCompanies?: InsuranceCompany[];
  userId?: string;
  bookingSecret?: string;
  /**
   * الفرع الحالي للسكرتيرة — يُمرَّر إلى `AddAppointmentForm` ثم `InsurancePaymentSelector`
   * لاختيار override نسبة تحمل المريض الخاصة بالفرع (لو الطبيب حدد نسب مختلفة لكل فرع).
   */
  sessionBranchId?: string;
};

/**
 * مكون "قسم نموذج الحجز" (PublicBookingFormSection)
 * يحتوي على حقول الإدخال لإضافة مريض جديد إلى قائمة الانتظار أو تعديل بيانات موعد موجود
 */
export const PublicBookingFormSection: React.FC<PublicBookingFormSectionProps> = ({
  bookingFormOpen,
  onToggleOpen,
  editingAppointmentId,
  onCancelEdit,
  bookingFormLoading,
  patientName,
  onPatientNameChange,
  age,
  onAgeChange,
  phone,
  onPhoneChange,
  gender,
  onGenderChange,
  pregnant,
  onPregnantChange,
  breastfeeding,
  onBreastfeedingChange,
  dateStr,
  onDateStrChange,
  timeStr,
  onTimeStrChange,
  visitReason,
  onVisitReasonChange,
  secretaryVitals,
  secretaryVitalFields,
  secretaryVitalsVisibility,
  onSecretaryVitalsChange,
  todayStr,
  timeMin,
  submitting,
  formError,
  bookingQuotaNotice,
  appointmentType,
  onAppointmentTypeChange,
  visibleConsultationCandidates,
  canLoadMoreConsultationCandidates,
  onLoadMoreConsultationCandidates,
  selectedConsultationCandidateId,
  onSelectConsultationCandidate,
  patientSuggestions,
  onSelectPatientSuggestion,
  onSubmit,
  paymentType,
  onPaymentTypeChange,
  insuranceCompanyId,
  onInsuranceCompanyIdChange,
  insuranceCompanyName,
  onInsuranceCompanyNameChange,
  insuranceMembershipId,
  onInsuranceMembershipIdChange,
  insuranceApprovalCode,
  onInsuranceApprovalCodeChange,
  patientSharePercent,
  onPatientSharePercentChange,
  discountAmount,
  onDiscountAmountChange,
  discountPercent,
  onDiscountPercentChange,
  discountReasonId,
  onDiscountReasonIdChange,
  discountReasonLabel,
  onDiscountReasonLabelChange,
  discountReasons,
  insuranceCompanies,
  userId,
  bookingSecret,
  sessionBranchId,
}) => {
  return (
    <div>
      {bookingFormOpen && (
        <div>
          {/* تنبيه يظهر للسكرتارية في حال كانت تقوم بتعديل موعد موجود بالفعل بدلاً من إضافة واحد جديد */}
          {editingAppointmentId && (
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-bold text-white">وضع التعديل - يتم تحديث الموعد الحالي</span>
              </div>
              <button type="button" onClick={onCancelEdit} className="text-xs font-bold text-white/90 hover:text-white underline">
                إلغاء التعديل
              </button>
            </div>
          )}
          {bookingFormLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-brand-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600" />
              <span className="text-sm font-bold"><LoadingText>جاري التحميل</LoadingText></span>
            </div>
          ) : (
            /* المكون الفعلي للنموذج الذي يحتوي على حقول الإدخال (الاسم، الهاتف، التوقيت) */
            <AddAppointmentForm
              patientName={patientName}
              onPatientNameChange={onPatientNameChange}
              age={age}
              onAgeChange={onAgeChange}
              phone={phone}
              onPhoneChange={onPhoneChange}
              gender={gender}
              onGenderChange={onGenderChange}
              pregnant={pregnant}
              onPregnantChange={onPregnantChange}
              breastfeeding={breastfeeding}
              onBreastfeedingChange={onBreastfeedingChange}
              dateStr={dateStr}
              onDateStrChange={onDateStrChange}
              timeStr={timeStr}
              onTimeStrChange={onTimeStrChange}
              visitReason={visitReason}
              onVisitReasonChange={onVisitReasonChange}
              secretaryVitals={secretaryVitals}
              secretaryVitalFields={secretaryVitalFields}
              secretaryVitalsVisibility={secretaryVitalsVisibility}
              onSecretaryVitalsChange={onSecretaryVitalsChange}
              todayStr={todayStr}
              timeMin={timeMin}
              saving={submitting}
              formError={formError}
              bookingQuotaNotice={bookingQuotaNotice}
              appointmentType={appointmentType}
              onAppointmentTypeChange={onAppointmentTypeChange}
              consultationCandidates={visibleConsultationCandidates}
              canLoadMoreConsultationCandidates={canLoadMoreConsultationCandidates}
              onLoadMoreConsultationCandidates={onLoadMoreConsultationCandidates}
              selectedConsultationCandidateId={selectedConsultationCandidateId}
              onSelectConsultationCandidate={onSelectConsultationCandidate}
              patientSuggestions={patientSuggestions}
              onSelectPatientSuggestion={onSelectPatientSuggestion}
              submitLabel="ارسال الى الطبيب"
              hideTopHeader
              onSubmit={onSubmit}
              bookingSecret={bookingSecret}
              paymentType={paymentType}
              onPaymentTypeChange={onPaymentTypeChange}
              insuranceCompanyId={insuranceCompanyId}
              onInsuranceCompanyIdChange={onInsuranceCompanyIdChange}
              insuranceCompanyName={insuranceCompanyName}
              onInsuranceCompanyNameChange={onInsuranceCompanyNameChange}
              insuranceMembershipId={insuranceMembershipId}
              onInsuranceMembershipIdChange={onInsuranceMembershipIdChange}
              insuranceApprovalCode={insuranceApprovalCode}
              onInsuranceApprovalCodeChange={onInsuranceApprovalCodeChange}
              patientSharePercent={patientSharePercent}
              onPatientSharePercentChange={onPatientSharePercentChange}
              discountAmount={discountAmount}
              onDiscountAmountChange={onDiscountAmountChange}
              discountPercent={discountPercent}
              onDiscountPercentChange={onDiscountPercentChange}
              discountReasonId={discountReasonId}
              onDiscountReasonIdChange={onDiscountReasonIdChange}
              discountReasonLabel={discountReasonLabel}
              onDiscountReasonLabelChange={onDiscountReasonLabelChange}
              discountReasons={discountReasons}
              insuranceCompanies={insuranceCompanies}
              userId={userId}
              activeBranchId={sessionBranchId}
            />
          )}
        </div>
      )}
    </div>
  );
};

