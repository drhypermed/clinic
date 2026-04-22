// ─────────────────────────────────────────────────────────────────────────────
// Schema.org JSON-LD — بيانات منظّمه للأطباء عشان جوجل يفهم الصفحه
// ─────────────────────────────────────────────────────────────────────────────
// جوجل بيستخدم الـJSON-LD ده عشان:
//   • يظهر النجوم والتقييمات في نتايج البحث (Rich Snippets)
//   • يعرف إن ده دكتور (Physician) مش أي صفحه عاديّه
//   • يفهم التخصّص والمكان والسعر → بيظهر في البحث الـLocal
//
// بنولّد نوعين:
//   1) Physician schema — صفحه طبيب فردي (/dr/:slug)
//   2) ItemList schema — صفحه الدليل (/public) بكل الأطباء
//
// الـoutput = object عادي، بنحطّه في <script type="application/ld+json">.
// ─────────────────────────────────────────────────────────────────────────────

import type { DoctorAdProfile } from '../app/drug-catalog/types/doctor-profile';
import { getPrimaryBranch, getDoctorRatingStats } from '../components/advertisement/public-directory/helpers';

// الدومين الرسمي للجمهور — www بالظبط عشان يطابق اللي شغّال في Firebase Hosting
const PATIENT_ORIGIN = 'https://www.drhypermed.com';

// يبني address object لـSchema.org من بيانات الفرع
const buildAddress = (doctor: DoctorAdProfile) => {
  const primary = getPrimaryBranch(doctor);
  const parts: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry: 'EG',
  };
  if (primary.governorate) parts.addressRegion = primary.governorate;
  if (primary.city) parts.addressLocality = primary.city;
  if (primary.addressDetails) parts.streetAddress = primary.addressDetails;
  return parts;
};

// يبني offers (السعر) — جوجل بيظهر السعر لو مكتوب صح
const buildOffers = (doctor: DoctorAdProfile) => {
  const primary = getPrimaryBranch(doctor);
  const price = primary.discountedExaminationPrice ?? primary.examinationPrice;
  if (price == null || price <= 0) return undefined;
  return {
    '@type': 'Offer',
    name: 'كشف',
    price: String(price),
    priceCurrency: 'EGP',
    availability: 'https://schema.org/InStock',
  };
};

// يبني aggregateRating — بيظهر النجوم في نتايج جوجل
const buildAggregateRating = (doctor: DoctorAdProfile) => {
  const { count, average } = getDoctorRatingStats(doctor);
  if (count < 1 || average <= 0) return undefined;
  return {
    '@type': 'AggregateRating',
    ratingValue: average.toFixed(1),
    reviewCount: String(count),
    bestRating: '5',
    worstRating: '1',
  };
};

/**
 * يبني Physician Schema للدكتور — بيتحط في صفحه /dr/:slug
 */
export const buildDoctorPhysicianSchema = (doctor: DoctorAdProfile): Record<string, unknown> => {
  const slug = doctor.publicSlug || '';
  const url = slug ? `${PATIENT_ORIGIN}/dr/${slug}` : PATIENT_ORIGIN;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctor.doctorName,
    medicalSpecialty: doctor.doctorSpecialty,
    url,
    address: buildAddress(doctor),
  };

  if (doctor.profileImage) schema.image = doctor.profileImage;
  if (doctor.bio) schema.description = doctor.bio.substring(0, 500);
  if (doctor.academicDegree) schema.hasCredential = doctor.academicDegree;

  const primary = getPrimaryBranch(doctor);
  const phone = primary.contactPhone || doctor.contactPhone;
  if (phone) schema.telephone = phone;

  const offers = buildOffers(doctor);
  if (offers) schema.makesOffer = offers;

  const rating = buildAggregateRating(doctor);
  if (rating) schema.aggregateRating = rating;

  return schema;
};

/**
 * يبني ItemList Schema لكل الأطباء في الدليل — بيتحط في /public.
 * بناخد أوّل 30 دكتور بس عشان الـJSON ميبقاش ضخم.
 */
export const buildDoctorsItemListSchema = (doctors: DoctorAdProfile[]): Record<string, unknown> => {
  const items = doctors.slice(0, 30).map((doctor, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Physician',
      name: doctor.doctorName,
      medicalSpecialty: doctor.doctorSpecialty,
      url: doctor.publicSlug ? `${PATIENT_ORIGIN}/dr/${doctor.publicSlug}` : PATIENT_ORIGIN,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'دليل الأطباء في مصر',
    itemListElement: items,
  };
};
