// ─────────────────────────────────────────────────────────────────────────────
// لوحة إدارة الأطباء الموحدة (AccountManagementPanel)
// ─────────────────────────────────────────────────────────────────────────────
// الشاشة الرئيسية للأدمن لإدارة حسابات الأطباء:
//   - عرض قائمة الأطباء مع pagination وتحميل تلقائي عند الفلترة
//   - فلاتر ذكية (بحث بالاسم/البريد/الواتساب + حالة التحقق + التخصص + نوع الاشتراك)
//   - إجراءات: تفعيل/تعطيل/حذف/تغيير نوع الحساب/تعديل الاشتراك
//
// بعد التقسيم المكون ده بقى orchestrator بسيط — المنطق الثقيل في:
//   - useDoctorsPagination: تحميل الصفحات + قواعد الأدمن + Auto-load
//   - useAdminEmails: اشتراك لحظي بقائمة الأدمن
//   - useAccountManagementActions: كل الإجراءات (enable/disable/delete/subscription)
//   - ActionConfirmationModal: مودال تأكيد الإجراءات
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { FaCircleXmark } from 'react-icons/fa6';
import { ActionModalState, SmartFilter } from './types';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { sanitizeAdminReasonInput } from './securityUtils';
import { normalizeEmail } from '../../../services/auth-service/validation';
import { LoadingText } from '../../ui/LoadingText';
import { ApprovedDoctor } from '../../../types';
import { AccountManagementHeader } from './AccountManagementHeader';
import { AccountManagementFilters } from './AccountManagementFilters';
import { AccountManagementTable } from './AccountManagementTable';
import { useAccountManagementActions } from './useAccountManagementActions';
import { useAdminEmails } from './useAdminEmails';
import { useDoctorsPagination } from './useDoctorsPagination';
import { ActionConfirmationModal } from './ActionConfirmationModal';
import { exportDoctorsToCsv } from './exportDoctorsCsv';
import { Pagination } from './Pagination';

// ─ خيارات حجم الصفحة المتاحة للأدمن (يقدر يغير من dropdown)
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

export const AccountManagementPanel: React.FC = () => {
  const { user } = useAuth();
  const canManageAccounts = useIsAdmin(user);

  // ── فلاتر البحث ──
  const [filters, setFilters] = useState<SmartFilter>({
    searchTerm: '',
    verificationStatus: 'all',
    sortBy: 'recent',
    specialty: 'all',
    subscriptionType: 'all',
  });

  // ── قائمة بريد الأدمن (من /admins/* لحظياً) ──
  const adminEmails = useAdminEmails(canManageAccounts);

  /** تحديد هل بريد معين يخص أدمن — مع مراعاة المستخدم الحالي والقائمة اللحظية. */
  const isAdminDoctorEmail = (email?: string) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return false;
    // يحمي: المستخدم الحالي + أي بريد في /admins/* + البريد الثابت (لو محدد).
    if (user?.email && normalized === normalizeEmail(user.email)) return true;
    return adminEmails.has(normalized);
  };

  // ── تحميل الأطباء مع pagination + قواعد الأدمن + Auto-load ──
  const {
    approvedDoctors,
    setApprovedDoctors,
    loadingAccounts,
    loadingMoreDoctors,
    loadError,
    hasMoreDoctors,
    autoLoadingAll,
    loadMoreDoctors,
  } = useDoctorsPagination({
    canManageAccounts,
    userUid: user?.uid,
    userEmail: user?.email,
    isAdminDoctorEmail,
    filters,
  });

  // ── فلترة client-side (تبحث في الاسم/البريد/الواتساب) ──
  const [filteredDoctors, setFilteredDoctors] = useState<ApprovedDoctor[]>([]);

  // ── Pagination state: الصفحة الحالية + حجم الصفحة ──
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  // عند تغيير الفلاتر → نرجع لـpage 1 (تجنب الوقوف على صفحة بدون نتائج)
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.verificationStatus, filters.specialty, filters.subscriptionType, filters.sortBy]);

  // قائمة الأطباء الـpaginated (slice من الـfiltered حسب الصفحة)
  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  // safeCurrentPage: لو حصل race condition وعدد الـfilteredDoctors نقص فجأة، نعرض آخر صفحة بدل صفحة فاضية
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDoctors = filteredDoctors.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  useEffect(() => {
    let result = [...approvedDoctors];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          (d.doctorName?.toLowerCase() || '').includes(term) ||
          (d.doctorEmail?.toLowerCase() || '').includes(term) ||
          (d.doctorWhatsApp || '').includes(term),
      );
    }

    if (filters.verificationStatus !== 'all') {
      result = result.filter((d) => d.verificationStatus === filters.verificationStatus);
    }
    if (filters.specialty !== 'all') {
      result = result.filter((d) => (d.doctorSpecialty || '').trim() === filters.specialty);
    }
    if (filters.subscriptionType !== 'all') {
      // ─ Bug fix: الفلتر بيراعي انتهاء الاشتراك دلوقتي.
      // طبيب accountType='premium' لكن premiumExpiryDate انتهى = نعتبره 'free'
      // (مش هيظهر تحت فلتر "برو" — هيظهر تحت "مجاني" زي ما الـUI بيعرضه).
      // الأدمن (premiumExpiryDate يبدأ بـ9999) معفي من الـexpiry check.
      const nowMs = Date.now();
      result = result.filter((d) => {
        const declared = (d.accountType || 'free') as 'free' | 'premium' | 'pro_max';
        // المجاني ما عندوش expiry — يفضل مجاني
        if (declared === 'free') return filters.subscriptionType === 'free';
        // الأدمن (premiumExpiryDate سنة 9999) دائماً paid
        const isLifetime = d.premiumExpiryDate?.startsWith('9999');
        if (isLifetime) return declared === filters.subscriptionType;
        // باقة فعلياً منتهية → نعتبره مجاني
        const expiryMs = d.premiumExpiryDate ? new Date(d.premiumExpiryDate).getTime() : 0;
        const isExpired = expiryMs > 0 && expiryMs < nowMs;
        const effectiveType = isExpired ? 'free' : declared;
        return effectiveType === filters.subscriptionType;
      });
    }

    // الترتيب: الأحدث أولاً (recent) أو أبجدي بالاسم (name)
    if (filters.sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    } else if (filters.sortBy === 'name') {
      result.sort((a, b) => (a.doctorName || '').localeCompare(b.doctorName || ''));
    }

    setFilteredDoctors(result);
  }, [approvedDoctors, filters]);

  /** قائمة التخصصات الموجودة — تستخدم في فلتر التخصص (memoized). */
  const specialties = useMemo(() => {
    const set = new Set<string>();
    approvedDoctors.forEach((d) => {
      const s = (d.doctorSpecialty || '').trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [approvedDoctors]);

  // ── الإجراءات (enable/disable/delete/subscription) ──
  const {
    editingDurationId, editingStartDate, editingEndDate,
    editingStartTime, editingEndTime, editMode,
    editingDurationValue, editingDurationUnit, actionInProgress,
    setEditingDurationId, setEditingStartDate, setEditingEndDate,
    setEditingStartTime, setEditingEndTime, setEditMode,
    setEditingDurationValue, setEditingDurationUnit,
    handleDisableAccount, handleEnableAccount, handleUpdateAccountType,
    handleUpdateSubscriptionDuration, handleUpdateSubscriptionDates,
    handleDeleteDoctor,
  } = useAccountManagementActions({
    approvedDoctors,
    setApprovedDoctors,
    canManageAccounts,
    isAdminDoctorEmail,
    userEmail: normalizeEmail(user?.email) || 'admin',
  });

  // ── Modal state (للتأكيد قبل أي إجراء حساس) ──
  const [actionModal, setActionModal] = useState<ActionModalState | null>(null);
  const [modalReason, setModalReason] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const openActionModal = (modal: ActionModalState) => {
    setActionModal(modal);
    setModalReason('');
    setModalError('');
    setModalSuccess('');
  };

  const closeModal = () => {
    setActionModal(null);
    setModalReason('');
    setModalError('');
    setModalSuccess('');
  };

  /** تنفيذ الإجراء المطلوب مع سانيتايزر للسبب وإظهار نجاح/خطأ. */
  const executeModalAction = async () => {
    if (!actionModal) return;
    setModalError('');
    setModalSuccess('');

    const reason = sanitizeAdminReasonInput(modalReason, 500);

    try {
      switch (actionModal.type) {
        case 'disable':
          if (!reason) { setModalError('يرجى كتابة سبب التعطيل.'); return; }
          await handleDisableAccount(actionModal.doctorId, actionModal.doctorEmail, reason);
          setModalSuccess('تم تعطيل الحساب بنجاح.');
          setTimeout(closeModal, 1200);
          break;

        case 'enable':
          await handleEnableAccount(actionModal.doctorId);
          setModalSuccess('تم تفعيل الحساب بنجاح.');
          setTimeout(closeModal, 1200);
          break;

        case 'delete':
          if (!reason) { setModalError('يرجى كتابة سبب الحذف.'); return; }
          await handleDeleteDoctor(actionModal.doctorId, actionModal.doctorEmail, reason);
          setModalSuccess('تم حذف الطبيب وحظره نهائيا.');
          setTimeout(closeModal, 1200);
          break;
      }
    } catch (err: any) {
      setModalError(err?.message || 'حدث خطأ غير متوقع.');
    }
  };

  // ── حماية: لو مش أدمن، ارجع رسالة منع ──
  if (!canManageAccounts) {
    return (
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-bold text-danger-700">
        غير مصرح لك بالوصول إلى إدارة الأطباء.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="dh-stagger-1">
        <AccountManagementHeader
          totalCount={approvedDoctors.length}
          filteredCount={filteredDoctors.length}
          // ─ التصدير يستخدم الـfilteredDoctors (يحترم الفلاتر النشطة)
          onExport={() => exportDoctorsToCsv(filteredDoctors, 'doctors-list')}
          exportDisabled={filteredDoctors.length === 0}
        />
      </div>

      {/* رسالة خطأ تحميل البيانات */}
      {loadError && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-bold text-danger-700">
          <FaCircleXmark className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}

      <div className="dh-stagger-2">
        <AccountManagementFilters filters={filters} setFilters={setFilters} specialties={specialties} />
      </div>

      {loadingAccounts ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dh-stagger-3">
          <LoadingText>جاري تحميل بيانات الأطباء</LoadingText>
        </div>
      ) : (
        <div className="dh-stagger-3 space-y-3">
          <AccountManagementTable
            approvedDoctors={approvedDoctors}
            filteredDoctors={paginatedDoctors}
            totalFilteredCount={filteredDoctors.length}
            isAdminDoctorEmail={isAdminDoctorEmail}
            actionInProgress={actionInProgress}
            editingDurationId={editingDurationId}
            editingStartDate={editingStartDate}
            editingEndDate={editingEndDate}
            editingStartTime={editingStartTime}
            editingEndTime={editingEndTime}
            editMode={editMode}
            editingDurationValue={editingDurationValue}
            editingDurationUnit={editingDurationUnit}
            setEditingDurationId={setEditingDurationId}
            setEditingStartDate={setEditingStartDate}
            setEditingEndDate={setEditingEndDate}
            setEditingStartTime={setEditingStartTime}
            setEditingEndTime={setEditingEndTime}
            setEditMode={setEditMode}
            setEditingDurationValue={setEditingDurationValue}
            setEditingDurationUnit={setEditingDurationUnit}
            onOpenActionModal={openActionModal}
            onUpdateAccountType={handleUpdateAccountType}
            onUpdateSubscriptionDates={handleUpdateSubscriptionDates}
            onUpdateSubscriptionDuration={handleUpdateSubscriptionDuration}
          />

          {/* Pagination UI — يظهر لو في أكتر من صفحة واحدة (أو لتغيير حجم الصفحة) */}
          {filteredDoctors.length > 0 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          )}

          {/* مؤشر "جاري تحميل كل الصفحات تلقائياً للبحث" */}
          {autoLoadingAll && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-2 text-xs font-bold text-brand-700">
              <LoadingText>جاري تحميل كل الأطباء للبحث</LoadingText>
            </div>
          )}

          {/* زر "تحميل مزيد" (ظاهر فقط لو مفيش autoloading) */}
          {hasMoreDoctors && !autoLoadingAll && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => { void loadMoreDoctors(); }}
                disabled={loadingMoreDoctors}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMoreDoctors ? <LoadingText>جاري تحميل المزيد</LoadingText> : 'تحميل مزيد من الأطباء'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* مودال تأكيد الإجراءات (تفعيل/تعطيل/حذف) */}
      <ActionConfirmationModal
        actionModal={actionModal}
        modalReason={modalReason}
        modalError={modalError}
        modalSuccess={modalSuccess}
        actionInProgress={actionInProgress}
        onChangeReason={(value) => { setModalReason(value); setModalError(''); }}
        onClose={closeModal}
        onExecute={executeModalAction}
      />
    </div>
  );
};
