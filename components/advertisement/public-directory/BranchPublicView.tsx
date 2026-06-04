/**
 * عرض بيانات فرع واحد للجمهور (يُستخدم داخل تبويبات الفروع).
 * بيعرض: العنوان، أسعار الكشف/الاستشارة، المواعيد، الخدمات، الصور، وأزرار التواصل.
 *
 * المكوّن ده محايد بين LivePreviewModal (في صفحة تحرير الإعلان)
 * وDoctorDetailsModal (في الدليل العام) — فالاتنين بيستخدموه بنفس الشكل.
 */
import React from 'react';
import { LuCalendar, LuClock, LuInfo, LuPhone } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import type { DoctorAdBranch } from '../../../types';
import { formatPrice, formatTimeWithPeriod, getFilledScheduleForBranch } from './helpers';

interface BranchPublicViewProps {
  branch: DoctorAdBranch;
  /** هل نعرض أزرار التواصل (اتصال/واتساب) — غير مطلوب في preview. */
  showContactActions?: boolean;
  /** عند الضغط على صورة: يخلي الصفحة الأم تفتح lightbox (اختياري). */
  onImageClick?: (index: number) => void;
}

export const BranchPublicView: React.FC<BranchPublicViewProps> = ({ branch, showContactActions = false, onImageClick }) => {
  const hasExamDiscount = branch.discountedExaminationPrice != null
    && branch.examinationPrice != null
    && branch.discountedExaminationPrice < branch.examinationPrice;
  const hasConsultDiscount = branch.discountedConsultationPrice != null
    && branch.consultationPrice != null
    && branch.discountedConsultationPrice < branch.consultationPrice;
  const schedule = getFilledScheduleForBranch(branch);
  const location = [branch.governorate, branch.city, branch.addressDetails].filter(Boolean).join(' - ');

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-cyan-100 bg-[linear-gradient(135deg,#ecfeff,#f0fdf4)] p-3 sm:p-4">
        <p className="text-[11px] font-black text-cyan-700">الفرع</p>
        <h3 className="mt-1 break-words text-base font-black leading-snug text-slate-900 sm:text-lg">
          {branch.name?.trim() || 'الفرع الرئيسي'}
        </h3>
      </div>
      {/* العنوان والأسعار */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-200 p-4 bg-white shadow-sm md:col-span-1">
          <p className="text-xs text-slate-500 font-black mb-1">العنوان</p>
          <p className="text-sm font-black text-slate-800 whitespace-pre-line break-words">
            {location || 'غير محدد'}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-100 p-4 bg-emerald-50/50 shadow-sm">
          <p className="text-xs text-emerald-700 font-black mb-1">الكشف</p>
          {hasExamDiscount ? (
            <div className="space-y-1">
              <p className="text-sm font-black text-success-700">
                {formatPrice(branch.discountedExaminationPrice)}
                <span className="text-slate-500 mr-1">بدلًا من</span>
              </p>
              <p className="text-xs font-bold text-slate-500 line-through">{formatPrice(branch.examinationPrice)}</p>
            </div>
          ) : (
            <p className="text-sm font-black text-emerald-950">{formatPrice(branch.examinationPrice)}</p>
          )}
        </div>
        <div className="rounded-lg border border-blue-100 p-4 bg-blue-50/50 shadow-sm">
          <p className="text-xs text-blue-700 font-black mb-1">الاستشارة</p>
          {hasConsultDiscount ? (
            <div className="space-y-1">
              <p className="text-sm font-black text-success-700">
                {formatPrice(branch.discountedConsultationPrice)}
                <span className="text-slate-500 mr-1">بدلًا من</span>
              </p>
              <p className="text-xs font-bold text-slate-500 line-through">{formatPrice(branch.consultationPrice)}</p>
            </div>
          ) : (
            <p className="text-sm font-black text-blue-950">{formatPrice(branch.consultationPrice)}</p>
          )}
        </div>
      </div>

      {/* أرقام التواصل بالفرع */}
      {(branch.contactPhone || branch.whatsapp) && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-black mb-2">بيانات التواصل بالفرع</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
              <p className="text-[11px] text-success-700 font-black mb-2">اتصال مباشر</p>
              {showContactActions && branch.contactPhone ? (
                <a
                  href={`tel:${branch.contactPhone.replace(/\D/g, '')}`}
                  className="h-10 w-full rounded-lg border bg-white text-success-800 border-success-200 font-black text-sm inline-flex items-center justify-center gap-2 hover:bg-success-100 transition-colors"
                >
                  <LuPhone className="h-4 w-4" aria-hidden="true" />
                  {branch.contactPhone}
                </a>
              ) : (
                <div className="h-10 w-full rounded-lg border bg-white text-success-800 border-success-200 font-black text-sm inline-flex items-center justify-center gap-2">
                  <LuPhone className="h-4 w-4" aria-hidden="true" />
                  {branch.contactPhone || 'غير متاح'}
                </div>
              )}
            </div>
            <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-3">
              <p className="text-[11px] text-cyan-700 font-black mb-2">واتساب</p>
              {showContactActions && (branch.whatsapp || branch.contactPhone) ? (
                <a
                  href={`https://wa.me/${(branch.whatsapp || branch.contactPhone).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-full rounded-lg border bg-white text-cyan-800 border-cyan-200 font-black text-sm inline-flex items-center justify-center gap-2 hover:bg-cyan-100 transition-colors"
                >
                  <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
                  {branch.whatsapp || branch.contactPhone}
                </a>
              ) : (
                <div className="h-10 w-full rounded-lg border bg-white text-cyan-800 border-cyan-200 font-black text-sm inline-flex items-center justify-center gap-2">
                  <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
                  {branch.whatsapp || branch.contactPhone || 'غير متاح'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* مواعيد العمل */}
      <div className="rounded-lg border border-cyan-100 bg-gradient-to-b from-cyan-50/70 to-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-white text-brand-700">
              <LuCalendar className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900">مواعيد العمل</p>
              <p className="text-[11px] font-bold text-slate-500">الأيام والساعات المتاحة للفرع</p>
            </div>
          </div>
          {schedule.length > 0 && (
            <span className="shrink-0 rounded-full border border-cyan-100 bg-white px-2.5 py-1 text-[11px] font-black text-cyan-800">
              {schedule.length} يوم
            </span>
          )}
        </div>
        {schedule.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-500">
            لم يحدد الطبيب مواعيد العمل لهذا الفرع بعد.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {schedule.map((row) => (
              <div key={row.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-black text-slate-900 text-sm">{row.day}</span>
                  {row.notes && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-800">
                      <LuInfo className="h-3 w-3" aria-hidden="true" />
                      ملاحظة
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-2">
                    <p className="mb-0.5 flex items-center gap-1 text-[10px] font-black text-emerald-700">
                      <LuClock className="h-3 w-3" aria-hidden="true" />
                      من
                    </p>
                    <p className="text-sm font-black text-emerald-900">{formatTimeWithPeriod(row.from)}</p>
                  </div>
                  <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-2.5 py-2">
                    <p className="mb-0.5 flex items-center gap-1 text-[10px] font-black text-cyan-700">
                      <LuClock className="h-3 w-3" aria-hidden="true" />
                      إلى
                    </p>
                    <p className="text-sm font-black text-cyan-900">{formatTimeWithPeriod(row.to)}</p>
                  </div>
                </div>
                {row.notes && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-bold leading-relaxed text-slate-600">
                    {row.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* خدمات الفرع */}
      {branch.clinicServices.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-black mb-2">الخدمات المتاحة</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {branch.clinicServices.map((service) => {
              const discounted = service.discountedPrice != null
                && service.price != null
                && service.discountedPrice < service.price;
              return (
                <div key={service.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="font-black text-slate-800 text-sm">{service.name}</span>
                  {discounted ? (
                    <div className="text-left">
                      <span className="font-black text-success-700 text-sm block">{formatPrice(service.discountedPrice)}</span>
                      <span className="font-bold text-slate-500 text-xs line-through block">{formatPrice(service.price)}</span>
                    </div>
                  ) : service.price != null ? (
                    <span className="font-black text-cyan-700 text-sm">{formatPrice(service.price)}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* صور الفرع — لو في onImageClick بنخلي الصور قابلة للضغط (lightbox) */}
      {branch.imageUrls.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-black mb-2">صور العيادة</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {branch.imageUrls.map((url, idx) => (
              onImageClick ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onImageClick(idx)}
                  className="relative aspect-video rounded-lg border border-slate-200 overflow-hidden bg-slate-100 hover:ring-2 hover:ring-cyan-400 transition-all"
                >
                  <img
                    src={url}
                    alt={`صورة ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </button>
              ) : (
                <img
                  key={idx}
                  src={url}
                  alt={`صورة ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// شريط تبويبات الفروع — مشترك بين LivePreviewModal وDoctorDetailsModal
// ─────────────────────────────────────────────────────────────────────────────

interface BranchTabsProps {
  branches: DoctorAdBranch[];
  activeBranchId: string;
  onSelect: (id: string) => void;
}

export const BranchTabs: React.FC<BranchTabsProps> = ({ branches, activeBranchId, onSelect }) => {
  if (branches.length <= 1) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-100 pb-2 mb-2">
      <span className="text-xs font-black text-slate-500 ml-1">الفروع:</span>
      {branches.map((branch, idx) => {
        const isActive = branch.id === activeBranchId;
        const displayName = branch.name?.trim() || `فرع ${idx + 1}`;
        return (
          <button
            key={branch.id}
            type="button"
            onClick={() => onSelect(branch.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
              isActive
                ? 'bg-[linear-gradient(135deg,#0891b2,#059669)] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {displayName}
          </button>
        );
      })}
    </div>
  );
};
