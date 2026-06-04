import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LuArrowRight, LuSearch } from 'react-icons/lu';
import type { DoctorAdBranch, DoctorAdProfile } from '../../../types';
import { firestoreService } from '../../../services/firestore';
import { useHideBootSplash } from '../../../hooks/useHideBootSplash';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { JsonLdTag } from '../../common/JsonLdTag';
import { buildDoctorPhysicianSchema } from '../../../utils/doctorSchema';
import { getDoctorRatingStats, getPrimaryBranch } from './helpers';
import { DoctorPublicProfileView } from './DoctorPublicProfileView';
import {
  appendBranchToPublicBookingUrl,
  resolvePublicBookingBranchForLink,
} from '../../../utils/publicBookingLinks';

const PATIENT_ORIGIN = 'https://www.drhypermed.com';

const applyDoctorMeta = (doctor: DoctorAdProfile): void => {
  if (typeof document === 'undefined') return;

  const { count, average } = getDoctorRatingStats(doctor);
  const primaryBranch = getPrimaryBranch(doctor);
  const location = [primaryBranch.governorate, primaryBranch.city].filter(Boolean).join(' - ');
  const ratingText = count > 0 ? `${average.toFixed(1)} من 5 (${count} تقييم)` : '';
  const priceText = primaryBranch.examinationPrice != null && primaryBranch.examinationPrice > 0
    ? `سعر الكشف ${primaryBranch.examinationPrice} جنيه`
    : '';
  const title = `${doctor.doctorName} - ${doctor.doctorSpecialty}${location ? ` في ${location}` : ''} | احجز ميعاد أونلاين`;
  const description = [
    `احجز ميعاد عند ${doctor.doctorName} (${doctor.doctorSpecialty})`,
    location ? `في ${location}` : '',
    priceText,
    ratingText,
    'من Dr Hyper لحجز المواعيد بسهولة.',
  ].filter(Boolean).join('. ').slice(0, 300);

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

  if (doctor.publicSlug) {
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${PATIENT_ORIGIN}/dr/${doctor.publicSlug}`);
  }
};

const NotFoundScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6" dir="rtl">
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-lg">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
        <LuSearch className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-black text-slate-900">الطبيب غير موجود</h1>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
        الصفحة دي لم تعد متاحة، أو الطبيب وقف إعلانه. تقدر تتصفح باقي الأطباء من الدليل.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-cyan-700 px-5 text-sm font-black text-white shadow-md transition-colors hover:bg-cyan-800"
      >
        <LuArrowRight className="h-4 w-4" aria-hidden="true" />
        تصفح دليل الأطباء
      </button>
    </div>
  </div>
);

export const DoctorPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [doctor, setDoctor] = useState<DoctorAdProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useHideBootSplash('doctor-public-page-mounted');

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setNotFound(false);

    firestoreService.getDoctorByPublicSlug(slug)
      .then((found) => {
        if (!active) return;
        if (!found) {
          setNotFound(true);
        } else {
          setDoctor(found);
          applyDoctorMeta(found);
        }
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const handleBookClick = async (branch: DoctorAdBranch) => {
    if (!doctor) return;

    const requestedBranch = {
      id: branch.id || '',
      name: branch.name || '',
      address: [branch.governorate, branch.city, branch.addressDetails].filter(Boolean).join(' - '),
    };
    const navigationState = { from: `${routeLocation.pathname}${routeLocation.search}` };

    const withResolvedBranch = async (basePath: string, publicSecret?: string) => {
      const secret = String(publicSecret || '').trim();
      if (!secret || !(requestedBranch.id || requestedBranch.name || requestedBranch.address)) return basePath;
      const publicBranches = await firestoreService.getPublicBranches(secret);
      const resolvedBranch = resolvePublicBookingBranchForLink(publicBranches, requestedBranch);
      return resolvedBranch ? appendBranchToPublicBookingUrl(basePath, resolvedBranch) : basePath;
    };

    try {
      const lookup = await firestoreService.getPublicBookingLookupByUserId(doctor.doctorId);
      const publicSlug = String(lookup?.publicUrlSlug || '').trim();
      if (publicSlug) {
        navigate(await withResolvedBranch(`/p/${encodeURIComponent(publicSlug)}`, lookup?.publicBookingSecret), { state: navigationState });
        return;
      }
      if (lookup?.publicBookingSecret) {
        navigate(await withResolvedBranch(`/p/${encodeURIComponent(doctor.doctorId)}`, lookup.publicBookingSecret), { state: navigationState });
        return;
      }
    } catch (error) {
      console.warn('[DoctorPublicPage] failed to resolve canonical booking link:', error);
    }

    navigate(`/p/${encodeURIComponent(doctor.doctorId)}`, { state: navigationState });
  };

  if (loading) return <LoadingStateScreen message="جاري تحميل بيانات الطبيب" />;
  if (notFound || !doctor) return <NotFoundScreen onBack={() => navigate('/public')} />;

  return (
    <>
      <JsonLdTag id="doctor-physician" json={buildDoctorPhysicianSchema(doctor)} />
      <DoctorPublicProfileView
        doctor={doctor}
        mode="page"
        onBack={() => navigate('/public')}
        onBookDoctor={(branch) => { void handleBookClick(branch); }}
      />
    </>
  );
};
