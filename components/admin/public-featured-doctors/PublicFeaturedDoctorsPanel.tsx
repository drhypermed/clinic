import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCircleCheck,
  FaCircleXmark,
  FaClock,
  FaPlus,
  FaStar,
  FaTrash,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import {
  publicFeaturedDoctorsService,
  type PublicFeaturedDoctorEntry,
} from '../../../services/firestore/publicFeaturedDoctors';
import { LoadingText } from '../../ui/LoadingText';

const MAX_EMAIL_LENGTH = 160;
const MAX_DURATION_DAYS = 365;

const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return 'غير محدد';
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isActiveEntry = (entry: PublicFeaturedDoctorEntry): boolean => {
  const expiresAtMs = Date.parse(entry.expiresAt);
  return entry.isActive && Number.isFinite(expiresAtMs) && expiresAtMs > Date.now();
};

const clampDuration = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(MAX_DURATION_DAYS, Math.max(1, Math.floor(parsed)));
};

export const PublicFeaturedDoctorsPanel: React.FC = () => {
  const { user } = useAuth();
  const isAdminUser = useIsAdmin(user);
  const adminEmail = user?.email || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [removingId, setRemovingId] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [items, setItems] = useState<PublicFeaturedDoctorEntry[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeItems = useMemo(() => items.filter(isActiveEntry), [items]);
  const expiredItems = useMemo(() => items.filter((item) => !isActiveEntry(item)), [items]);

  const loadItems = async () => {
    if (!isAdminUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const data = await publicFeaturedDoctorsService.listPublicFeaturedDoctors();
      setItems(data);
    } catch (err) {
      console.error('[PublicFeaturedDoctorsPanel] load failed:', err);
      setFeedback({ type: 'error', message: 'تعذر تحميل قائمة الأطباء المميزين.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminUser]);

  const handleAdd = async () => {
    if (!isAdminUser || saving) return;
    const safeEmail = doctorEmail.trim().toLowerCase();
    if (!safeEmail) {
      setFeedback({ type: 'error', message: 'اكتب بريد حساب الطبيب أولا.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const added = await publicFeaturedDoctorsService.addPublicFeaturedDoctorByEmail(
        safeEmail,
        clampDuration(durationDays),
        adminEmail,
      );
      setItems((prev) => [added, ...prev.filter((item) => item.doctorId !== added.doctorId)]);
      setDoctorEmail('');
      setFeedback({ type: 'success', message: 'تم إضافة الطبيب كطبيب مميز في الصفحة الرئيسية للجمهور.' });
    } catch (err) {
      console.error('[PublicFeaturedDoctorsPanel] add failed:', err);
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'تعذر إضافة الطبيب.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (entry: PublicFeaturedDoctorEntry) => {
    if (!isAdminUser || removingId) return;
    if (!window.confirm(`إزالة ${entry.doctorName || entry.doctorEmail} من الأطباء المميزين؟`)) return;

    setRemovingId(entry.doctorId);
    setFeedback(null);
    try {
      await publicFeaturedDoctorsService.removePublicFeaturedDoctor(entry.doctorId, adminEmail);
      setItems((prev) => prev.filter((item) => item.doctorId !== entry.doctorId));
      setFeedback({ type: 'success', message: 'تمت إزالة الطبيب من الصفحة الرئيسية للجمهور.' });
    } catch (err) {
      console.error('[PublicFeaturedDoctorsPanel] remove failed:', err);
      setFeedback({ type: 'error', message: 'تعذر إزالة الطبيب. حاول مرة أخرى.' });
    } finally {
      setRemovingId('');
    }
  };

  const handleCleanupExpired = async () => {
    if (!isAdminUser || cleaning) return;
    setCleaning(true);
    setFeedback(null);
    try {
      const removed = await publicFeaturedDoctorsService.cleanupExpiredPublicFeaturedDoctors(adminEmail);
      await loadItems();
      setFeedback({
        type: 'success',
        message: removed > 0 ? `تم تنظيف ${removed} طبيب منتهي.` : 'لا توجد عناصر منتهية للتنظيف.',
      });
    } catch (err) {
      console.error('[PublicFeaturedDoctorsPanel] cleanup failed:', err);
      setFeedback({ type: 'error', message: 'تعذر تنظيف العناصر المنتهية.' });
    } finally {
      setCleaning(false);
    }
  };

  if (!isAdminUser) {
    return (
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-bold text-danger-700">
        غير مصرح لك بإدارة الأطباء المميزين.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
        <LoadingText>جاري تحميل الأطباء المميزين</LoadingText>
      </div>
    );
  }

  return (
    <section className="space-y-5" dir="rtl">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <FaStar className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black text-slate-900">أطباء الصفحة الرئيسية للجمهور</h3>
            <p className="mt-1 text-sm font-bold leading-relaxed text-slate-600">
              الأطباء الموجودون هنا فقط يظهرون في الصفحة الرئيسية. بعد انتهاء المدة لا يظهر الطبيب في الرئيسية،
              ويظل متاحا عند البحث أو استخدام الفلاتر.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_160px_auto]">
          <div>
            <label className="mb-1 block text-xs font-black text-slate-600">بريد حساب الطبيب</label>
            <input
              type="email"
              value={doctorEmail}
              onChange={(event) => setDoctorEmail(event.target.value.slice(0, MAX_EMAIL_LENGTH))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleAdd();
                }
              }}
              placeholder="doctor@example.com"
              dir="ltr"
              className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-brand-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-black text-slate-600">مدة الظهور بالأيام</label>
            <input
              type="number"
              min={1}
              max={MAX_DURATION_DAYS}
              value={durationDays}
              onChange={(event) => setDurationDays(String(clampDuration(event.target.value)))}
              className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none transition focus:border-brand-400"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => void handleAdd()}
              disabled={saving || !doctorEmail.trim()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            >
              {saving ? <LoadingText>جاري الإضافة</LoadingText> : (
                <>
                  <FaPlus className="h-3.5 w-3.5" />
                  إضافة
                </>
              )}
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${
              feedback.type === 'success'
                ? 'border-success-200 bg-success-50 text-success-800'
                : 'border-danger-200 bg-danger-50 text-danger-800'
            }`}
          >
            {feedback.type === 'success' ? <FaCircleCheck className="h-3.5 w-3.5" /> : <FaCircleXmark className="h-3.5 w-3.5" />}
            {feedback.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-base font-black text-slate-900">نشط الآن ({activeItems.length})</h4>
            <button
              type="button"
              onClick={() => void loadItems()}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-100"
            >
              تحديث
            </button>
          </div>

          {activeItems.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
              لا يوجد أطباء مميزون حاليا.
            </p>
          ) : (
            <div className="space-y-2">
              {activeItems.map((entry) => (
                <div key={entry.doctorId} className="rounded-xl border border-brand-100 bg-brand-50/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{entry.doctorName || 'طبيب'}</p>
                      <p className="truncate text-xs font-bold text-brand-700">{entry.doctorSpecialty || 'بدون تخصص'}</p>
                      <p className="mt-1 truncate text-[11px] font-bold text-slate-500" dir="ltr">{entry.doctorEmail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRemove(entry)}
                      disabled={removingId === entry.doctorId}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-700 hover:bg-danger-100 disabled:opacity-60"
                      aria-label="إزالة"
                    >
                      {removingId === entry.doctorId ? <LoadingText>...</LoadingText> : <FaTrash className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-success-200 bg-success-50 px-2.5 py-1 text-[11px] font-black text-success-800">
                    <FaClock className="h-3 w-3" />
                    ينتهي: {formatDateTime(entry.expiresAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-base font-black text-slate-900">منتهي أو غير نشط ({expiredItems.length})</h4>
            <button
              type="button"
              onClick={() => void handleCleanupExpired()}
              disabled={cleaning || expiredItems.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-3 py-1.5 text-xs font-black text-warning-800 hover:bg-warning-100 disabled:opacity-60"
            >
              {cleaning ? <LoadingText>تنظيف</LoadingText> : (
                <>
                  <FaTriangleExclamation className="h-3 w-3" />
                  تنظيف المنتهي
                </>
              )}
            </button>
          </div>

          {expiredItems.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
              لا توجد عناصر منتهية.
            </p>
          ) : (
            <div className="space-y-2">
              {expiredItems.map((entry) => (
                <div key={entry.doctorId} className="rounded-xl border border-slate-200 bg-slate-50 p-3 opacity-80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-800">{entry.doctorName || 'طبيب'}</p>
                      <p className="truncate text-[11px] font-bold text-slate-500" dir="ltr">{entry.doctorEmail}</p>
                      <p className="mt-1 text-[11px] font-bold text-slate-500">انتهى: {formatDateTime(entry.expiresAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRemove(entry)}
                      disabled={removingId === entry.doctorId}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-700 hover:bg-danger-100 disabled:opacity-60"
                      aria-label="إزالة"
                    >
                      {removingId === entry.doctorId ? <LoadingText>...</LoadingText> : <FaTrash className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
