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
import { CITIES_BY_GOVERNORATE } from '../constants';
export const useDirectoryFilters = (ads: DoctorAdProfile[]) => {
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [governorateFilter, setGovernorateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const specialties = useMemo(() => {
    return [
      'أطفال',
      'أسنان',
      'أمراض دم',
      'أمراض صدرية',
      'أنف وأذن وحنجرة',
      'أورام',
      'باطنة',
      'تخاطب',
      'تغذية',
      'جراحة تجميل',
      'جراحة عامة',
      'جلدية',
      'رمد',
      'علاج طبيعي',
      'علاج طبيعي وتغذية',
      'عظام',
      'قلب',
      'كلية',
      'مخ وأعصاب',
      'مسالك بولية',
      'نساء وتوليد',
      'نفسية وعصبية',
      'أخرى'
    ].sort((a, b) => a.localeCompare(b));
  }, []);

  const topSpecialties = useMemo(() => {
    return ['باطنة', 'أطفال', 'أسنان', 'نساء وتوليد', 'عظام', 'جلدية', 'أنف وأذن وحنجرة'];
  }, []);

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

