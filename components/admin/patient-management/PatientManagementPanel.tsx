/**
 * لوحة إدارة الجمهور (Patient Management Panel)
 * المكون الرئيسي لإدارة حسابات المستخدمين العاديين (المرضى) في النظام.
 * 
 * الميزات:
 * 1. عرض قائمة بكافة حسابات الجمهور مع إحصائيات حجوزاتهم.
 * 2. البحث المتقدم بالاسم أو البريد مع تمييز (Highlight) نتائج البحث.
 * 3. تفعيل أو تعطيل الحسابات (Enable/Disable).
 * 4. استعراض وحذف التقييمات التي قام بها المستخدم.
 * 5. حذف الحسابات نهائياً من النظام.
 */

import React, { useState } from 'react';
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

  // جلب وإدارة بيانات الجمهور (مع دعم التحميل اللامتناهي)
  const {
    patients,
    setPatients,
    filteredPatients,
    loading,
    loadingMore,
    autoLoadingAll,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadMore,
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
   * دالة لإبراز (Highlight) الكلمات المطابقة للبحث في النصوص.
   * تستخدم لتحسين تجربة المستخدم عند البحث عن مرضى معينين.
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
      // إضافة النص قبل التطابق
      if (matchIndex > cursor) {
        parts.push(text.slice(cursor, matchIndex));
      }

      // إضافة النص المطابق محاطاً بوسم <mark>
      const end = matchIndex + term.length;
      parts.push(
        <mark key={`${matchIndex}-${end}`} className="bg-yellow-300/80 text-slate-900 px-0.5 rounded-sm">
          {text.slice(matchIndex, end)}
        </mark>
      );

      cursor = end;
      matchIndex = lowerText.indexOf(lowerTerm, cursor);
    }

    // إضافة النص المتبقي بعد آخر تطابق
    if (cursor < text.length) {
      parts.push(text.slice(cursor));
    }

    return <>{parts}</>;
  };

  /** فتح نافذة المراجعات والتقييمات لمريض معين */
  const handleOpenReviews = (patient: PatientAccount) => {
    // تصفية الحجوزات التي تحتوي على تقييم فعلي فقط
    const ratedBookings = patient.bookings.filter((booking) => isRatedBooking(booking));
    setSelectedPatientId(patient.id);
    setSelectedPatientName(patient.name);
    setSelectedPatientReviews(ratedBookings);
  };


  const handleCloseReviewsModal = () => {
    setSelectedPatientReviews(null);
    setSelectedPatientId('');
    setSelectedPatientName('');
  };

  if (currentView === 'patients' && !isAdminUser) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-red-200">
        غير مصرح لك بالوصول إلى إدارة الجمهور.
      </div>
    );
  }

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل بيانات الجمهور" />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-xl p-6 border-t-4 border-blue-500 dh-stagger-1">
        <h1 className="text-3xl font-black text-white mb-2">⚙️ إدارة الجمهور</h1>
        <p className="text-slate-300">
          إدارة حسابات الجمهور، وتفعيل/تعطيل الحسابات، ومتابعة التقييمات
        </p>
      </div>

      <div className="bg-slate-700 rounded-2xl shadow-xl p-6 border-t-4 border-blue-500 dh-stagger-2">
        <h3 className="text-xl font-black text-white mb-6">🔍 بحث عام</h3>
        <input
          type="text"
          placeholder="بحث بالاسم أو البريد..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full md:w-1/2 px-4 py-2 rounded-lg bg-slate-600 text-white placeholder-slate-400 border-2 border-slate-500 focus:border-blue-500 transition"
        />
      </div>

      {autoLoadingAll && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-2 text-xs font-bold text-sky-700">
          جاري تحميل كل حسابات الجمهور للبحث…
        </div>
      )}

      <div className="dh-stagger-3"><PatientManagementTable
        patients={patients}
        filteredPatients={filteredPatients}
        highlightMatch={highlightMatch}
        onDisableAccount={handleDisableAccount}
        onEnableAccount={handleEnableAccount}
        onDeletePatient={handleDeletePatient}
        onOpenReviews={handleOpenReviews}
        hasMore={hasMore && !autoLoadingAll}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      /></div>

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
