import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { Medication } from '../../types';
import { useMedicationSearch } from '../../hooks/medications';
import { WarningModal } from '../common/WarningModal';
import { MedicationSearchDropdown } from '../common/MedicationSearchDropdown';
import { sanitizeDosageText } from '../../utils/rx/rxUtils';

interface QuickSearchSectionProps {
  weight: number;                // وزن المريض الحالي كجم
  totalAgeMonths: number;        // عمر المريض الحالي بالشهور
  onAddMedication: (med: Medication, dosage: string) => void; // دالة إضافة الدواء للروشتة
  onAddEmptyMedication: () => void; // إضافة دواء فارغ للتعديل اليدوي
  onAddCustomItem: () => void;     // إضافة ملاحظة مخصصة
  onAddManualLab: () => void;      // إضافة طلب فحص معملي
  onAddManualAdvice: () => void;   // إضافة نصيحة طبية
  onOpenReadyPrescriptions: () => void; // فتح نافذة الروشتات الجاهزة (Templates)
}

export const QuickSearchSection: React.FC<QuickSearchSectionProps> = ({
  weight,
  totalAgeMonths,
  onAddMedication,
  onAddEmptyMedication,
  onAddCustomItem,
  onAddManualLab,
  onAddManualAdvice,
  onOpenReadyPrescriptions
}) => {
  const [searchTerm, setSearchTerm] = useState(''); // نص البحث الحالي
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null); // الدواء المختار للعرض قبل الإضافة
  const [isOpen, setIsOpen] = useState(false); // حالة فتح قائمة البحث المنسدلة
  const searchContainerRef = useRef<HTMLDivElement>(null); // مرجع لحاوية البحث للكشف عن النقر خارجها
  const [showWarningModal, setShowWarningModal] = useState(false); // إظهار نافذة التحذير الطبي
  const [warningData, setWarningData] = useState<any>(null); // بيانات التحذير (نوع المخالفة: سن/وزن)
  const [pendingDose, setPendingDose] = useState<string>(''); // الجرعة المحسوبة المعلّقة لحين تأكيد التحذير (تجنب إعادة الحساب)
  // نفس روح زر "كشف جديد" مع لون موحد لتقليل التشتيت البصري.
  const manualActionPrimaryBtnClass = 'apple-quick-search__action-btn manual-action-btn manual-action-btn--ready w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-[0.98] text-right shadow-sm';
  const manualActionChipBtnClass = 'apple-quick-search__action-btn manual-action-btn flex items-center justify-start gap-2.5 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-[0.98] w-full text-right shadow-sm';

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dr_hyper_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      // تحذير فقط — لا نفشل الواجهة بسبب تالف localStorage
      console.warn('[favorites] failed to parse stored favorites:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dr_hyper_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('[favorites] failed to persist favorites:', e);
    }
  }, [favorites]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

    const toggleFavorite = (e: React.MouseEvent, medId: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(medId)) {
        return prev.filter(id => id !== medId);
      } else {
        return [...prev, medId];
      }
    });
  };


    const formatMinAge = (months?: number) => {
    if (!Number.isFinite(months)) return 'غير محدد';
    if (!months || months <= 0) return 'من الولادة';
    if (months < 12) return `من ${months} شهر`;
    return `+${Math.floor((months || 0) / 12)} سنة`;
  };

    const safeAgeDisplay = (months?: number) => {
    if (!Number.isFinite(months) || (months ?? 0) <= 0) return 'غير مدخل';
    if ((months || 0) < 12) return `${months} شهر`;
    return `${Math.floor((months || 0) / 12)} سنة`;
  };

    const safeWeightDisplay = (val?: number) => {
    if (!Number.isFinite(val) || (val ?? 0) <= 0) return 'غير مدخل';
    return `${val} كجم`;
  };

  const { search } = useMedicationSearch();
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const filteredMeds = useMemo(() => {
    return search(deferredSearchTerm, isOpen ? favorites : []);
  }, [deferredSearchTerm, favorites, isOpen, search]);

    const handleSelectMed = (med: Medication) => {
    setSelectedMed(med);
    setSearchTerm('');
    setIsOpen(false);
  };

    const calculateDose = (med: Medication) => {
    if (!weight || weight <= 0 || Number.isNaN(weight)) return "⚠️ أدخل الوزن أولاً";
    if (!totalAgeMonths || totalAgeMonths <= 0 || Number.isNaN(totalAgeMonths)) return "⚠️ أدخل العمر أولاً";
    if (typeof med.calculationRule === 'function') {
      const raw = med.calculationRule(weight, totalAgeMonths);
      return sanitizeDosageText(raw);
    }
    // fallback للأدوية اللي جاية من خارج Medication type (legacy أو AlternativeMed)
    return (med as unknown as { dosage?: string }).dosage || "حسب الحالة";
  };

    const handleAddToPrescription = () => {
    if (selectedMed) {
      const isWeightValid = Number.isFinite(weight) && weight > 0;
      const isAgeValid = Number.isFinite(totalAgeMonths) && totalAgeMonths > 0;

      if (!isWeightValid || !isAgeValid) {
        onAddMedication(selectedMed, '');
        setSelectedMed(null);
        setSearchTerm('');
        setIsOpen(false);
        return;
      }

      const dose = calculateDose(selectedMed);

      const minAge = selectedMed.minAgeMonths || 0;
      const maxAge = selectedMed.maxAgeMonths || Infinity;
      const isAgeOutOfRange = totalAgeMonths < minAge || totalAgeMonths > maxAge;

      const minWeight = selectedMed.minWeight || 0;
      const maxWeight = selectedMed.maxWeight || Infinity;
      const isWeightOutOfRange = weight < minWeight || weight > maxWeight;

      if (isAgeOutOfRange || isWeightOutOfRange) {
        const formatAge = (months: number) => {
          if (months < 12) return `${months} شهر`;
          return `${Math.floor(months / 12)} سنة`;
        };

        const warnings = [];

        if (isAgeOutOfRange) {
          let expected = `من ${formatAge(minAge)}`;
          if (maxAge !== Infinity) {
            expected += ` إلى ${formatAge(maxAge)}`;
          } else {
            expected += ` فما فوق`;
          }

          warnings.push({
            icon: '📅',
            label: 'العمر خارج النطاق المسموح',
            expected: expected,
            actual: formatAge(totalAgeMonths)
          });
        }

        if (isWeightOutOfRange) {
          let expected = `من ${minWeight} كجم`;
          if (maxWeight !== Infinity) {
            expected += ` إلى ${maxWeight} كجم`;
          } else {
            expected += ` فما فوق`;
          }

          warnings.push({
            icon: '⚖️',
            label: 'الوزن خارج النطاق المسموح',
            expected: expected,
            actual: `${weight} كجم`
          });
        }

        setPendingDose(dose);
        setWarningData({
          title: 'تحذير طبي هام',
          warnings: warnings,
          recommendation: 'يُنصح باختيار دواء بديل مناسب من نفس الفئة العلاجية.'
        });
        setShowWarningModal(true);
        return;
      }

      onAddMedication(selectedMed, dose);
    }
  };

    const handleConfirmWarning = () => {
    setShowWarningModal(false);
    if (selectedMed) {
      onAddMedication(selectedMed, pendingDose);
      setPendingDose('');
    }
  };

  return (
    <section data-no-reveal className="apple-quick-search bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-200 relative z-20 text-right" dir="rtl">
      <div className="flex flex-wrap justify-between items-center mb-3 sm:mb-4 gap-2">
        <h2 className="apple-quick-search__title text-base sm:text-lg font-black text-slate-900 flex items-center gap-3">
          <span className="apple-quick-search__bar w-1.5 h-6 bg-blue-600 rounded-full"></span>
          البحث السريع عن الأدوية
        </h2>
      </div>

      <div className="relative" ref={searchContainerRef}>
        <div className="relative group">
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); setSelectedMed(null); }}
            className="apple-quick-search__input w-full p-3.5 pl-12 pr-12 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:border-blue-400 outline-none shadow-sm transition-all placeholder-slate-400 text-ellipsis text-right"
            placeholder="ابحث باسم الدواء أو المادة الفعالة أو الاستخدام..."
            dir="rtl"
          />
          <svg className="apple-quick-search__icon w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>

          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setIsOpen(true); }}
              className="apple-quick-search__clear absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-400 p-1 hover:bg-slate-100 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {isOpen && filteredMeds.length > 0 && (
          <MedicationSearchDropdown
            medications={filteredMeds}
            onSelect={handleSelectMed}
            searchTerm={searchTerm}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            currentAgeMonths={totalAgeMonths}
            currentWeight={weight}
            showPrice={true}
          />
        )}

        {isOpen && searchTerm && filteredMeds.length === 0 && (
          <div className="apple-quick-search__empty absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center text-right z-50">
            <div className="text-2xl mb-2">🤔</div>
            <div className="text-slate-500 font-bold text-sm">لا توجد نتائج لـ "{searchTerm}"</div>
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-5">
        <h3 className="apple-quick-search__subtitle text-slate-600 font-black flex items-center gap-2 text-[0.78rem] mb-2.5">
          <span className="apple-quick-search__bar-small w-1.5 h-4 rounded-full"></span>
          إضافات يدوية للروشتة
        </h3>
        {/* زر أساسي: الروشتات الجاهزة */}
        <button onClick={onOpenReadyPrescriptions} className={`${manualActionPrimaryBtnClass} mb-2`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-base shrink-0">📂</span>
          <span className="flex-1">الروشتات الجاهزة</span>
          <svg className="w-4 h-4 opacity-75" style={{transform: 'scaleX(-1)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        {/* أزرار الإضافة السريعة: لون موحد متسق مع ثيم التطبيق */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
          <button onClick={onAddEmptyMedication} className={`${manualActionChipBtnClass} manual-action-btn--med`}>
            <span className="text-sm">💊</span>
            <span>إضافة دواء</span>
          </button>
          <button onClick={onAddManualLab} className={`${manualActionChipBtnClass} manual-action-btn--lab`}>
            <span className="text-sm">🧪</span>
            <span>إضافة فحص</span>
          </button>
          <button onClick={onAddManualAdvice} className={`${manualActionChipBtnClass} manual-action-btn--advice`}>
            <span className="text-sm">💡</span>
            <span>إضافة تعليمات</span>
          </button>
          <button onClick={onAddCustomItem} className={`${manualActionChipBtnClass} manual-action-btn--note`}>
            <span className="text-sm">📝</span>
            <span>إضافة ملاحظة</span>
          </button>
        </div>
      </div>

      {selectedMed && (
        <div className="apple-quick-search__result mt-4 bg-white p-5 rounded-[1.5rem] border border-emerald-200 shadow-md animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100%] -mr-10 -mt-10 z-0"></div>

          <button
            onClick={() => setSelectedMed(null)}
            className="apple-quick-search__dismiss absolute top-3 right-3 z-30 bg-white/80 hover:bg-red-100 text-slate-400 hover:text-red-500 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition-all"
            title="إلغاء"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="relative z-10">
            {(() => {
              const minAge = selectedMed.minAgeMonths || 0;
              const maxAge = selectedMed.maxAgeMonths || Infinity;

              const isAgeEntered = Number.isFinite(totalAgeMonths) && totalAgeMonths > 0;
              const isAgeOutOfRange = isAgeEntered && (totalAgeMonths < minAge || totalAgeMonths > maxAge);

              const minWeight = selectedMed.minWeight || 0;
              const maxWeight = selectedMed.maxWeight || Infinity;

              const isWeightEntered = Number.isFinite(weight) && weight > 0;
              const isWeightOutOfRange = isWeightEntered && (weight < minWeight || weight > maxWeight);

              if (!isAgeEntered || !isWeightEntered) {
                return (
                  <div className="apple-quick-search__alert mb-4 bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⚠️</div>
                      <div className="flex-1">
                        <div className="font-black text-amber-800 text-sm mb-1" dir="rtl">بيانات ناقصة (الوزن أو العمر)</div>
                        <div className="text-sm text-amber-700 font-bold leading-relaxed" dir="rtl">
                          يتم اضافة الجرعه والتعليمات بواسطة الطبيب في حال عدم ادخال سن ووزن المريض
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (isAgeOutOfRange || isWeightOutOfRange) {
                return (
                  <div className="apple-quick-search__alert mb-4 bg-red-50 border-2 border-red-300 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⚠️</div>
                      <div className="flex-1">
                        <div className="font-black text-red-700 text-sm mb-2" dir="rtl">تحذير: هذا الدواء خارج النطاق المسموح طبياً!</div>
                        <div className="text-xs text-red-600 font-bold space-y-1" dir="rtl">
                          {isAgeOutOfRange && (
                            <div className="flex items-center gap-2">
                              <span>📅</span>
                              <span>
                                عمر المريض ({safeAgeDisplay(totalAgeMonths)})
                                {totalAgeMonths < minAge ? ' أصغر من' : ' أكبر من'} النطاق المناسب
                              </span>
                            </div>
                          )}
                          {isWeightOutOfRange && (
                            <div className="flex items-center gap-2">
                              <span>⚖️</span>
                              <span>
                                وزن المريض ({safeWeightDisplay(weight)})
                                {weight < minWeight ? ' أقل من' : ' أكثر من'} النطاق المناسب
                              </span>
                            </div>
                          )}
                          <div className="mt-2 text-red-800 font-black">
                            ⚕️ يُنصح باختيار دواء بديل مناسب
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex justify-between items-start mb-4 pr-8">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="apple-quick-search__med-name font-black text-xl text-emerald-900 flex items-center gap-2">
                    <span>{selectedMed.name}</span>
                  </h3>
                  <button
                    onClick={(e) => toggleFavorite(e, selectedMed.id)}
                    className={`p-1 rounded-full transition-all ${favorites.includes(selectedMed.id) ? 'text-amber-400' : 'text-slate-200 hover:text-amber-400'}`}
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </button>
                </div>
                <p className="apple-quick-search__generic text-sm text-slate-500 font-bold mt-1 italic">{selectedMed.genericName}</p>
              </div>
              <div className="apple-quick-search__price text-right">
                <span className="block text-lg font-black text-slate-800">{selectedMed.price} <span className="text-xs text-slate-400">ج.م</span></span>
                <span className="inline-block bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-lg font-bold mt-1">{selectedMed.form}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="apple-quick-search__dose flex items-center gap-4 bg-emerald-600 p-4 rounded-2xl shadow-lg shadow-emerald-200/50 text-white">
                <div className="text-3xl">💊</div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase text-emerald-200 font-bold tracking-wider">
                    {(!weight || weight <= 0 || !totalAgeMonths || totalAgeMonths <= 0)
                      ? '⚠️ أدخل الوزن والعمر لحساب الجرعة'
                      : 'الجرعة الموصى بها'}
                  </div>
                  <div className="text-xl font-black">
                    {(!weight || weight <= 0 || !totalAgeMonths || totalAgeMonths <= 0)
                      ? 'يتم اضافة الجرعه والتعليمات بواسطة الطبيب'
                      : calculateDose(selectedMed)}
                  </div>
                  {weight > 0 && totalAgeMonths > 0 && (
                    <div className="text-[10px] text-emerald-100 font-bold mt-1">
                      بناءً على الوزن {safeWeightDisplay(weight)} والعمر {safeAgeDisplay(totalAgeMonths)}
                    </div>
                  )}
                </div>
              </div>

              <div className="apple-quick-search__info-grid grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="min-w-0 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">نقطة العمر الآمنة</span>
                  <span className="block font-bold text-blue-700 text-sm break-words">{formatMinAge(selectedMed.minAgeMonths)}</span>
                </div>
                <div className="min-w-0 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">التركيز</span>
                  <span className="block font-bold text-slate-700 text-sm break-words">{selectedMed.concentration}</span>
                </div>
                <div className="min-w-0 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">التصنيف</span>
                  <span className="block font-bold text-emerald-700 text-sm break-words">{selectedMed.category}</span>
                </div>
                <div className="min-w-0 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">طريقة التعاطي</span>
                  <span className="block font-bold text-slate-700 text-sm break-words">{selectedMed.timing || 'غير محدد'}</span>
                </div>
              </div>

              <div className="apple-quick-search__usage bg-blue-50 p-3 rounded-2xl border border-blue-200 text-blue-800 text-xs font-bold leading-relaxed">
                <span className="text-blue-700 uppercase text-[9px] block mb-1">الاستخدام / الدواعي</span>
                {selectedMed.usage}
              </div>

              <div className="apple-quick-search__instructions bg-white p-3 rounded-2xl border border-slate-100 text-xs font-bold leading-relaxed text-slate-700 whitespace-pre-line">
                <span className="text-slate-400 uppercase text-[9px] block mb-2">تعليمات هامة</span>
                {(() => {
                  const t = (selectedMed.instructions ?? '').toString().trim();
                  if (!t) return 'لا توجد تعليمات خاصة.';
                  if (t.startsWith('طريقة التحضير') || t.startsWith('تحضير ')) return 'لا توجد تعليمات خاصة.';
                  return t;
                })()}
                {selectedMed.warnings && selectedMed.warnings.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {selectedMed.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-amber-800">
                        <span className="text-sm">⚠️</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={handleAddToPrescription}
                  className="apple-quick-search__cta w-full bg-emerald-900 hover:bg-emerald-800 text-white font-black py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  أضف إلى الروشتة
                </button>
              </div>
            </div>
          </div>
        </div >
      )
      }

      {warningData && (
        <WarningModal
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          onConfirm={handleConfirmWarning}
          title={warningData.title}
          warnings={warningData.warnings}
          recommendation={warningData.recommendation}
        />
      )}
    </section>
  );
};

