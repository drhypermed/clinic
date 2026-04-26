/**
 * لوحة إدارة الجمهور (Patient Management Panel)
 * المكون الرئيسي لإدارة حسابات المستخدمين العاديين (المرضى) في النظام.
 *
 * الميزات:
 * 1. عرض قائمة بكافة حسابات الجمهور — الإحصائيات تُجلب عند الطلب فقط (lazy)
 * 2. البحث المتقدم بالاسم أو البريد مع تمييز (Highlight) نتائج البحث
 * 3. تفعيل أو تعطيل الحسابات (Enable/Disable)
 * 4. استعراض وحذف التقييمات التي قام بها المستخدم
 * 5. حذف الحسابات نهائياً من النظام
 *
 * ملاحظات الأداء (مهم عند آلاف المستخدمين):
 *   - الحجوزات لا تُجلب في القائمة الرئيسية (وفر ~83% من قراءات Firestore)
 *   - البحث client-side فقط على المرضى المحملين — لا auto-load كلي
 */

import React, { useState } from 'react';
import { FaUsers, FaUserGroup } from 'react-icons/fa6';
import { PatientManagementPanelProps } from './types';
import { PublicUserBooking } from '../../../app/drug-catalog/types';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { isRatedBooking } from './patientUtils';
import { PatientManagementTable } from './PatientManagementTable';
import { LoadingText } from '../../ui/LoadingText';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { PatientReviewsModal } from './PatientReviewsModal';
import { PatientAccount } from '../../../types';
import { usePatientManagementActions } from './usePatientManagementActions';
import { usePatientManagementData } from './usePatientManagementData';

export const PatientManagementPanel: React.FC<PatientManagementPanelProps> = ({ currentView }) => {
  const { user } = useAuth();
  const isAdminUser = useIsAdmin(user);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedPatientReviews, setSelectedPatientReviews] = useState<PublicUserBooking[] | null>(null);
  // عند فتح مودال التقييمات نحتاج loading state حتى يجيب الحجوزات أولاً
  const [openingReviewsId, setOpeningReviewsId] = useState<string | null>(null);

  // جلب وإدارة بيانات الجمهور (lazy bookings — انظر التعليق في الـ hook)
  const {
    patients,
    setPatients,
    filteredPatients,
    loading,
    loadingMore,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadMore,
    loadPatientBookings,
    bookingsLoadingId,
  } = usePatientManagementData({
    currentView,
    isAdminUser,
  });

  // إدارة الإجراءات (تعطيل، تفعيل، حذف)
  const { handleDisableAccount, handleEnableAccount, handleDeletePatient, handleDeleteReview } =
    usePatientManagementActions({
      isAdminUser,
      adminEmail: user?.email,
      setPatients,
      setSelectedPatientReviews,
    });

  /**
   * إبراز (Highlight) الكلمات المطابقة للبحث
   */
  const highlightMatch = (value: string | undefined | null) => {
    const text = value || '';
    const term = searchTerm.trim();
    if (!term) return text;

    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    if (!lowerText.includes(lowerTerm)) return text;

    const parts: React.ReactNode[] = [];
    let cursor = 0;
    let matchIndex = lowerText.indexOf(lowerTerm);

    while (matchIndex !== -1) {
      if (matchIndex > cursor) {
        parts.push(text.slice(cursor, matchIndex));
      }
      const end = matchIndex + term.length;
      parts.push(
        <mark key={`${matchIndex}-${end}`} className="bg-warning-100 text-warning-900 px-0.5 rounded-sm">
          {text.slice(matchIndex, end)}
        </mark>
      );
      cursor = end;
      matchIndex = lowerText.indexOf(lowerTerm, cursor);
    }

    if (cursor < text.length) {
      parts.push(text.slice(cursor));
    }

    return <>{parts}</>;
  };

  /**
   * فتح مودال التقييمات — يجلب الحجوزات الأول لو لم تكن مُحمّلة (lazy)
   */
  const handleOpenReviews = async (patient: PatientAccount) => {
    setOpeningReviewsId(patient.id);
    try {
      // لو الحجوزات مش محملة، نجيبها الأول
      const bookings = patient.bookingsLoaded
        ? patient.bookings
        : await loadPatientBookings(patient.id);

      const ratedBookings = bookings.filter((booking) => isRatedBooking(booking));
      setSelectedPatientId(patient.id);
      setSelectedPatientName(patient.name);
      setSelectedPatientReviews(ratedBookings);
    } finally {
      setOpeningReviewsId(null);
    }
  };

  const handleCloseReviewsModal = () => {
    setSelectedPatientReviews(null);
    setSelectedPatientId('');
    setSelectedPatientName('');
  };

  if (currentView === 'patients' && !isAdminUser) {
    return (
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-bold text-danger-700">
        غير مصرح لك بالوصول إلى إدارة الجمهور.
      </div>
    );
  }

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل بيانات الجمهور" />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── الهيدر بنفس نمط إدارة الأطباء (light theme + brand accents) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 dh-stagger-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-brand-50 text-brand-600 rounded-lg p-1.5 sm:p-2">
              <FaUserGroup className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight">
              إدارة الجمهور
            </h2>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
            إدارة حسابات الجمهور، وتفعيل/تعطيل الحسابات، ومتابعة التقييمات.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-brand-700">
          <FaUsers className="w-2.5 h-2.5" />
          {filteredPatients.length === patients.length
            ? `${patients.length.toLocaleString('ar-EG')} مستخدم`
            : `${filteredPatients.length.toLocaleString('ar-EG')} من ${patients.length.toLocaleString('ar-EG')}`}
        </span>
      </div>

      {/* ── شريط البحث ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dh-stagger-2">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
          <h3 className="text-xs sm:text-sm font-black text-slate-700">بحث وتصفية</h3>
        </div>
        <div className="p-3 sm:p-4">
          <label className="mb-1.5 block text-[11px] sm:text-xs font-bold text-slate-500">
            بحث عام
          </label>
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full md:w-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
          />
          {searchTerm.trim() && hasMore && (
            <p className="mt-2 text-[11px] text-slate-500">
              البحث يطبق على المرضى المحملين فقط. لو لم تجد المريض، اضغط "تحميل المزيد" أسفل الجدول.
            </p>
          )}
        </div>
      </div>

      {/* ── الجدول ── */}
      <div className="dh-stagger-3">
        <PatientManagementTable
          patients={patients}
          filteredPatients={filteredPatients}
          highlightMatch={highlightMatch}
          onDisableAccount={handleDisableAccount}
          onEnableAccount={handleEnableAccount}
          onDeletePatient={handleDeletePatient}
          onOpenReviews={(patient) => { void handleOpenReviews(patient); }}
          onLoadStats={(patientId) => { void loadPatientBookings(patientId); }}
          bookingsLoadingId={bookingsLoadingId || openingReviewsId}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        />
      </div>

      {/* مؤشر تحميل التقييمات (لما الأدمن يفتح مودال) */}
      {openingReviewsId && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-xs font-bold text-brand-700">
          <LoadingText>جاري تحميل التقييمات</LoadingText>
        </div>
      )}

      <PatientReviewsModal
        selectedPatientId={selectedPatientId}
        selectedPatientName={selectedPatientName}
        selectedPatientReviews={selectedPatientReviews}
        highlightMatch={highlightMatch}
        onDeleteReview={handleDeleteReview}
        onClose={handleCloseReviewsModal}
      />
    </div>
  );
};
