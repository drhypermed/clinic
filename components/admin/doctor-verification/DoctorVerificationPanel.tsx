// ─────────────────────────────────────────────────────────────────────────────
// لوحة تحقق الأطباء الجدد (DoctorVerificationPanel)
// ─────────────────────────────────────────────────────────────────────────────
// الشاشة اللي بيشوفها الأدمن عشان يعتمد أو يرفض طلبات الأطباء الجدد.
//
// بعد التقسيم، المكون ده بقى orchestrator بسيط:
//   - useDoctorVerification: كل المنطق (تحميل + اعتماد + رفض + حذف جماعي)
//   - DoctorVerificationCard: بطاقة طبيب واحد
//   - RejectConfirmModal + BulkDeleteModal: مودالات التأكيد
//
// الـ bugs اللي اتصلحت في النسخة دي:
//   1) Race condition: Cloud Function بينفذ قبل deleteDoc (شوف executeReject).
//   2) State لكل كارد بدل global — عشان ما نفقدش حالة كارد لما كارد تاني يتحدث.
//   3) مودالات تأكيد مخصصة بدل window.confirm (UX أفضل + تحذير واضح).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  FaArrowsRotate, FaCircleCheck, FaCircleXmark,
  FaHourglassHalf, FaShieldHalved, FaTrashCan,
} from 'react-icons/fa6';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { LoadingText } from '../../ui/LoadingText';
import { PENDING_FETCH_LIMIT_PER_STATUS } from './doctorVerificationHelpers';
import { useDoctorVerification } from './useDoctorVerification';
import { DoctorVerificationCard } from './DoctorVerificationCard';
import { RejectConfirmModal, BulkDeleteModal } from './DoctorVerificationModals';

export const DoctorVerificationPanel: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user);

  const {
    items, loading, fetchError, isResultTruncated,
    rejectNotes, setRejectNotes,
    accountTypes, setAccountTypes,
    subscriptionDurations, setSubscriptionDurations,
    actionLoading, cardError, setCardError, cardSuccess,
    rejectConfirm, setRejectConfirm,
    bulkDeleteOpen, setBulkDeleteOpen,
    bulkDeleteConfirmText, setBulkDeleteConfirmText,
    bulkDeleteRunning, bulkDeleteError, setBulkDeleteError,
    bulkDeleteProgress,
    setRefreshKey,
    handleApprove, handleReject, executeReject,
    openBulkDelete, executeBulkDelete,
  } = useDoctorVerification(isAdmin, user?.email);

  if (!isAdmin) return null;

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* ═══ هيدر الصفحة: عنوان + عداد + أزرار (تحديث + حذف الكل) ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-3 dh-stagger-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-brand-50 text-brand-600 rounded-lg p-1.5 sm:p-2">
              <FaShieldHalved className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight">
              مراجعة الأطباء الجدد
            </h2>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
            طلبات الأطباء المعلقة التي تنتظر المراجعة والتحقق.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-200 bg-warning-50 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-warning-700">
              <FaHourglassHalf className="w-2.5 h-2.5" />
              {items.length.toLocaleString('ar-EG')} طلب
            </span>
          )}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-600 transition hover:bg-brand-100 disabled:opacity-50"
          >
            <FaArrowsRotate className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
          {items.length > 0 && (
            <button
              onClick={openBulkDelete}
              disabled={loading || bulkDeleteRunning}
              className="inline-flex items-center gap-1.5 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-xs font-bold text-danger-700 transition hover:bg-danger-100 disabled:opacity-50"
              title="حذف جميع الطلبات المعلقة (للاستخدام الإداري فقط)"
            >
              <FaTrashCan className="w-3 h-3" />
              <span className="hidden sm:inline">حذف الكل</span>
            </button>
          )}
        </div>
      </div>

      {/* رسالة خطأ تحميل عام */}
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-bold text-danger-700">
          <FaCircleXmark className="w-3.5 h-3.5 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* تحذير لو النتائج متقطعة (تجاوزت حد الجلب) */}
      {!fetchError && isResultTruncated && (
        <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-xs font-bold text-warning-700">
          تم عرض أول {(PENDING_FETCH_LIMIT_PER_STATUS * 2).toLocaleString('ar-EG')} طلب فقط لتحسين الأداء. يرجى
          المتابعة على دفعات.
        </div>
      )}

      {/* حالة التحميل */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          <LoadingText>جاري تحميل الطلبات</LoadingText>
        </div>
      )}

      {/* حالة فاضية (ولا طلب واحد) */}
      {!loading && items.length === 0 && !fetchError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-14">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 mb-4">
            <FaCircleCheck className="w-7 h-7 text-slate-200" />
          </div>
          <p className="text-sm font-bold text-slate-400">لا توجد طلبات قيد المراجعة</p>
          <p className="text-[11px] text-slate-300 mt-1">الطلبات الجديدة ستظهر هنا تلقائيا</p>
        </div>
      )}

      {/* قائمة البطاقات */}
      <div className="space-y-4 dh-stagger-2">
        {items.map((item) => (
          <DoctorVerificationCard
            key={item.id}
            item={item}
            accountType={accountTypes[item.id] || 'free'}
            subscriptionDuration={subscriptionDurations[item.id] || 30}
            rejectNote={rejectNotes[item.id] || ''}
            actionLoading={actionLoading[item.id] || null}
            cardError={cardError[item.id] || ''}
            cardSuccess={cardSuccess[item.id] || ''}
            onAccountTypeChange={(type) => setAccountTypes((prev) => ({ ...prev, [item.id]: type }))}
            onDurationChange={(duration) => setSubscriptionDurations((prev) => ({ ...prev, [item.id]: duration }))}
            onRejectNoteChange={(note) => {
              setRejectNotes((prev) => ({ ...prev, [item.id]: note }));
              if (cardError[item.id]) setCardError((prev) => ({ ...prev, [item.id]: '' }));
            }}
            onApprove={() => handleApprove(item.id)}
            onReject={() => handleReject(item.id)}
          />
        ))}
      </div>

      {/* مودال تأكيد الرفض */}
      <RejectConfirmModal
        rejectConfirm={rejectConfirm}
        onClose={() => setRejectConfirm(null)}
        onConfirm={executeReject}
      />

      {/* مودال الحذف الجماعي */}
      <BulkDeleteModal
        isOpen={bulkDeleteOpen}
        itemsCount={items.length}
        confirmText={bulkDeleteConfirmText}
        running={bulkDeleteRunning}
        error={bulkDeleteError}
        progress={bulkDeleteProgress}
        onConfirmTextChange={(value) => {
          setBulkDeleteConfirmText(value);
          if (bulkDeleteError) setBulkDeleteError('');
        }}
        onClose={() => setBulkDeleteOpen(false)}
        onExecute={executeBulkDelete}
      />
    </section>
  );
};
