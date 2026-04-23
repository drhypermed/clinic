// ─────────────────────────────────────────────────────────────────────────────
// DoctorPublicPage — صفحه الطبيب المستقلّه (URL: /dr/:slug)
// ─────────────────────────────────────────────────────────────────────────────
// الغرض: صفحه SEO-friendly لكل دكتور — URL صديق + meta + JSON-LD + محتوى
// قابل لفهرسه جوجل بدون تسجيل دخول.
//
// الـURL بيوصل من:
//   • الـsitemap.xml الديناميكي (جوجل يشوفها أولاً)
//   • مشاركه المرضى للينك على واتساب/سوشيال
//   • دليل الأطباء — لمّا المستخدم يدوس على دكتور
//
// الـbot (Googlebot) بيشوف:
//   1. <title> و <meta description> محدّثين بيانات الدكتور
//   2. <script type="application/ld+json"> Physician schema
//   3. HTML نضيف فيه اسم الدكتور والتخصّص والتقييمات والسعر
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineMapPin,
  HiOutlineStar,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineArrowRight,
  HiOutlinePhone,
} from 'react-icons/hi2';
import type { DoctorAdProfile } from '../../../types';
import { firestoreService } from '../../../services/firestore';
import { useHideBootSplash } from '../../../hooks/useHideBootSplash';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { JsonLdTag } from '../../common/JsonLdTag';
import { buildDoctorPhysicianSchema } from '../../../utils/doctorSchema';
import {
  getAdBranches,
  getPrimaryBranch,
  getAvatarImage,
  getInitials,
  getDoctorRatingStats,
  normalizePhoneForTel,
  sanitizeBioForDisplay,
} from './helpers';

// الدومين الرسمي للجمهور — www بالظبط عشان يطابق اللي شغّال في Firebase Hosting
const PATIENT_ORIGIN = 'https://www.drhypermed.com';

/**
 * تحديث meta tags للصفحه بيانات الدكتور — بيساعد جوجل وفيسبوك يعرضوا
 * معلومات الدكتور في نتايج البحث وروابط السوشيال.
 */
const applyDoctorMeta = (doctor: DoctorAdProfile): void => {
  if (typeof document === 'undefined') return;

  const { count, average } = getDoctorRatingStats(doctor);
  const primary = getPrimaryBranch(doctor);
  const location = [primary.governorate, primary.city].filter(Boolean).join(' - ');
  const ratingText = count > 0 ? `⭐ ${average.toFixed(1)} (${count} تقييم)` : '';
  const priceText = primary.examinationPrice != null && primary.examinationPrice > 0
    ? `سعر الكشف ${primary.examinationPrice} جنيه`
    : '';

  const title = `${doctor.doctorName} - ${doctor.doctorSpecialty}${location ? ` في ${location}` : ''} | احجز ميعاد اون لاين`;
  const descParts = [
    `احجز ميعاد عند ${doctor.doctorName} (${doctor.doctorSpecialty})`,
    location ? `في ${location}` : '',
    priceText,
    ratingText,
    'من Dr Hyper — حجز فوري بدون اتصالات.',
  ].filter(Boolean);
  const description = descParts.join('. ').substring(0, 300);

  document.title = title;

  const setTag = (attr: 'name' | 'property', key: string, content: string) => {
    let tag = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  setTag('name', 'description', description);
  setTag('property', 'og:title', title);
  setTag('property', 'og:description', description);
  setTag('property', 'og:type', 'profile');
  if (doctor.profileImage) setTag('property', 'og:image', doctor.profileImage);

  // canonical للصفحه دي
  const slug = doctor.publicSlug || '';
  if (slug) {
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${PATIENT_ORIGIN}/dr/${slug}`);
  }
};

const formatPrice = (value: number | null | undefined): string | null => {
  if (value == null || value <= 0) return null;
  return `${value} جنيه`;
};

export const DoctorPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorAdProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // الفرع النشط — يتغير لما المريض يضغط تبويب فرع
  const [activeBranchIdx, setActiveBranchIdx] = useState(0);
  useHideBootSplash('doctor-public-page-mounted');

  // تحميل بيانات الدكتور من Firestore حسب الـslug
  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    firestoreService.getDoctorByPublicSlug(slug).then((found) => {
      if (!active) return;
      if (!found) {
        setNotFound(true);
      } else {
        setDoctor(found);
        applyDoctorMeta(found);
      }
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setNotFound(true);
      setLoading(false);
    });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل بيانات الطبيب" />;
  }

  if (notFound || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h1 className="text-xl font-black text-slate-900">الطبيب غير موجود</h1>
          <p className="text-sm text-slate-600 font-semibold">
            الصفحه دي لم تعد متاحه، أو الدكتور وقف إعلانه. تقدر تتصفّح باقي الأطباء من الدليل.
          </p>
          <button
            type="button"
            onClick={() => navigate('/public')}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <HiOutlineArrowRight className="w-4 h-4" />
            تصفّح دليل الأطباء
          </button>
        </div>
      </div>
    );
  }

  const branches = getAdBranches(doctor);
  // الفرع النشط — بتبدأ بالفرع الأول وبتتغير لما المريض يضغط التبويب
  const activeBranch = branches[Math.min(activeBranchIdx, branches.length - 1)] ?? getPrimaryBranch(doctor);
  const { count: ratingCount, average: ratingAvg } = getDoctorRatingStats(doctor);
  const avatar = getAvatarImage(doctor);
  const initials = getInitials(doctor.doctorName);
  const location = [activeBranch.governorate, activeBranch.city].filter(Boolean).join(' - ');
  const price = formatPrice(activeBranch.discountedExaminationPrice ?? activeBranch.examinationPrice);
  const consultationPrice = formatPrice(activeBranch.discountedConsultationPrice ?? activeBranch.consultationPrice);
  const phoneForTel = normalizePhoneForTel(activeBranch.contactPhone || doctor.contactPhone);
  const cleanBio = sanitizeBioForDisplay(doctor.bio);

  // الـJSON-LD لجوجل — بيظهر النجوم والسعر في نتايج البحث
  const physicianSchema = buildDoctorPhysicianSchema(doctor);

  const handleBookClick = () => {
    // ننقل المستخدم لصفحه الدليل وبنفتح modal الطبيب ده
    navigate(`/public?doctor=${encodeURIComponent(doctor.publicSlug || '')}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-white" dir="rtl">
      <JsonLdTag id="doctor-physician" json={physicianSchema} />

      {/* شريط تنقّل علوي */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/public')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800"
          >
            <HiOutlineArrowRight className="w-4 h-4" />
            دليل الأطباء
          </button>
          <span className="text-xs text-slate-500 font-semibold">Dr Hyper</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* بطاقه الرأس — الصوره + الاسم + التخصّص + التقييم */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {avatar ? (
              <img
                src={avatar}
                alt={doctor.doctorName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-2 ring-teal-100 shadow-md"
                loading="eager"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center font-black text-3xl shadow-md">
                {initials}
              </div>
            )}
            <div className="flex-1 text-center sm:text-right space-y-2">
              {/* h1 = إشاره قويّه لجوجل إن ده اسم الطبيب (الصفحه كلها عن المحتوى ده) */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {doctor.doctorName}
              </h1>
              <p className="text-base font-bold text-teal-700">{doctor.doctorSpecialty}</p>
              {doctor.academicDegree && (
                <p className="text-sm text-slate-600 font-semibold">{doctor.academicDegree}</p>
              )}
              {ratingCount > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm font-bold">
                  <HiOutlineStar className="w-4 h-4" />
                  <span>{ratingAvg.toFixed(1)}</span>
                  <span className="text-amber-600 font-semibold">({ratingCount} تقييم)</span>
                </div>
              )}
            </div>
          </div>

          {/* تبويبات الفروع — تظهر فقط لو الطبيب عنده أكتر من فرع */}
          {branches.length > 1 && (
            <div className="flex gap-2 mt-4 flex-wrap border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500 font-bold self-center ml-1">اختر الفرع:</span>
              {branches.map((branch, idx) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setActiveBranchIdx(idx)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                    activeBranchIdx === idx
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {branch.name || `فرع ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* الموقع والتواصل والـCTA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            {location && (
              <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2">
                <HiOutlineMapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-bold">المكان</div>
                  <div className="text-sm text-slate-900 font-bold">{location}</div>
                </div>
              </div>
            )}
            {price && (
              <div className="bg-emerald-50 rounded-xl p-3 flex items-start gap-2">
                <HiOutlineBanknotes className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-emerald-700 font-bold">سعر الكشف</div>
                  <div className="text-sm text-emerald-900 font-bold">{price}</div>
                </div>
              </div>
            )}
            {consultationPrice && (
              <div className="bg-cyan-50 rounded-xl p-3 flex items-start gap-2">
                <HiOutlineBanknotes className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-cyan-700 font-bold">الاستشاره</div>
                  <div className="text-sm text-cyan-900 font-bold">{consultationPrice}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            <button
              type="button"
              onClick={handleBookClick}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <HiOutlineCalendarDays className="w-5 h-5" />
              احجز ميعاد
            </button>
            {phoneForTel && (
              <a
                href={`tel:${phoneForTel}`}
                className="inline-flex items-center gap-2 bg-white ring-1 ring-slate-300 hover:ring-slate-400 text-slate-800 font-bold px-5 py-3 rounded-xl transition-colors"
              >
                <HiOutlinePhone className="w-4 h-4" />
                اتصل بالعياده
              </a>
            )}
          </div>
        </section>

        {/* النبذه — فيها النص اللي جوجل هيفهرسه كمحتوى أساسي */}
        {cleanBio && (
          <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-5">
            <h2 className="text-base font-black text-slate-900 mb-2">نبذه عن الدكتور</h2>
            <p className="text-sm text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
              {cleanBio}
            </p>
          </section>
        )}

        {/* العنوان التفصيلي للفرع النشط */}
        {activeBranch.addressDetails && (
          <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-5">
            <h2 className="text-base font-black text-slate-900 mb-2">
              عنوان العياده
              {branches.length > 1 && (
                <span className="mr-2 text-xs text-teal-600 font-bold">
                  ({activeBranch.name || `فرع ${activeBranchIdx + 1}`})
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-700 font-semibold">{activeBranch.addressDetails}</p>
          </section>
        )}

        {/* سنوات الخبره */}
        {doctor.yearsExperience != null && doctor.yearsExperience > 0 && (
          <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-5">
            <h2 className="text-base font-black text-slate-900 mb-1">الخبره</h2>
            <p className="text-sm text-slate-700 font-semibold">
              {doctor.yearsExperience} سنه خبره في {doctor.doctorSpecialty}
            </p>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-8 py-4 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-500 font-semibold">
          Dr Hyper — دليل الأطباء وحجز المواعيد في مصر
        </div>
      </footer>
    </div>
  );
};
