// ─────────────────────────────────────────────────────────────────────────────
// Hook فلاتر دليل الأطباء (useDirectoryFilters)
// ─────────────────────────────────────────────────────────────────────────────
// يدير الـ 4 فلاتر الرئيسية في دليل الأطباء:
//   1) التخصص (specialty): قائمة ثابتة بالتخصصات الشائعة في مصر
//   2) المحافظة (governorate): من ثابت GOVERNORATES
//   3) المدينة (city): تتغير حسب المحافظة (CITIES_BY_GOVERNORATE)
//   4) البحث النصي (search): في الاسم/التخصص/البيو
//
// الإخراج:
//   - filteredAds: الأطباء بعد تطبيق كل الفلاتر
//   - topSpecialties: التخصصات الأكثر توفراً (للعرض السريع)
//   - activeFiltersCount: عدد الفلاتر المفعلة حالياً (للشارة)
//   - stats: إحصائيات مختصرة عن النتيجة
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';

import type { DoctorAdProfile } from '../../../types';
import { MEDICAL_SPECIALTIES } from '../../auth/medicalSpecialties';
import { CITIES_BY_GOVERNORATE } from '../constants';

const PREFERRED_TOP_SPECIALTIES = [
  'الباطنة العامة',
  'طب الأطفال وحديثي الولادة',
  'طب وجراحة الفم والأسنان',
  'أمراض النساء والتوليد',
  'جراحة العظام والمفاصل',
  'الأمراض الجلدية والتناسلية',
  'الأنف والأذن والحنجرة',
];

export const useDirectoryFilters = (ads: DoctorAdProfile[]) => {
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const specialties = useMemo(() => {
    return Array.from(
      new Set(MEDICAL_SPECIALTIES.map((specialty) => specialty.trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, []);

  const topSpecialties = useMemo(() => {
    return PREFERRED_TOP_SPECIALTIES.filter((specialty) => specialties.includes(specialty));
  }, [specialties]);

  const citiesForFilter = useMemo(() => {
    if (!governorateFilter) return [];
    const staticCities = CITIES_BY_GOVERNORATE[governorateFilter] || [];
    // بما أننا لا نحمل كل الأطباء، سنعتمد على القائمة الثابتة للمدن
    return Array.from(new Set([...staticCities])).sort((a, b) => a.localeCompare(b));
  }, [governorateFilter]);

  // الفلترة تتم على السيرفر الآن، لذا سنرجع الإعلانات الممررة كما هي أو نتجنب استخدام filteredAds نهائياً
  // ولكن للحفاظ على واجهة الـ hook دون تغييرات جذرية على المكونات التي تعتمد عليها، نرجع ads
  const filteredAds = ads;

  const activeFiltersCount = [
    specialtyFilter,
    governorateFilter,
    cityFilter,
    searchFilter.trim(),
  ].filter(Boolean).length;

  const stats = useMemo(() => {
    // إحصائيات تقريبية / يتم تحديثها إذا أردنا جلب الـ count الحقيقي من السيرفر
    // حالياً لا يمكن جلب الإحصائيات الدقيقة من ads لأنها مجرد صفحة (20 عنصر كحد أقصى)
    return {
      doctors: ads.length, // هذا يعبر فقط عن المحمل في الشاشة
      specialties: specialties.length,
      governorates: Object.keys(CITIES_BY_GOVERNORATE).length,
    };
  }, [ads, specialties.length]);

  const resetFilters = () => {
    setSearchFilter('');
    setSpecialtyFilter('');
    setGovernorateFilter('');
    setCityFilter('');
  };

  return {
    specialtyFilter,
    setSpecialtyFilter,
    governorateFilter,
    setGovernorateFilter,
    cityFilter,
    setCityFilter,
    searchFilter,
    setSearchFilter,
    specialties,
    topSpecialties,
    citiesForFilter,
    filteredAds,
    activeFiltersCount,
    stats,
    resetFilters,
  };
};

