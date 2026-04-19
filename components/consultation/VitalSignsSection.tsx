/**
 * مكون القياسات والعلامات الحيوية (Vital Signs Section)
 * يتيح للطبيب إدخال المؤشرات الحيوية للمريض مثل الوزن، الطول، الضغط، والحرارة.
 * 
 * الوظائف المميزة:
 * 1. حساب BMI: يتم حساب مؤشر كتلة الجسم تلقائياً من الوزن والطول.
 * 2. التخصيص: يمكن عرض أو إخفاء أي علامة حيوية بناءً على إعدادات الطبيب.
 * 3. المربعات المخصصة: يدعم إضافة حقول إدخال إضافية يحددها الطبيب لاحتياجات تخصصه.
 */

import React from 'react';
import { VitalSignConfig, CustomBox, VitalsSectionSettings } from '../../types';

interface VitalSignsSectionProps {
  weight: string; setWeight: (v: string) => void;        // الوزن كجم
  height?: string; setHeight?: (v: string) => void;      // الطول سم
  bmi?: string;                                         // مؤشر كتلة الجسم المحسوب
  vitals: { bp: string; pulse: string; temp: string; rbs: string; spo2: string; rr: string }; // العلامات الحيوية الأخرى
  setVitals: (field: string, v: string) => void;         // دالة تحديث العلامات الحيوية
  vitalsConfig?: VitalSignConfig[];                      // قائمة إعدادات العلامات الحيوية (ظهورها وترتيبها)
  vitalsSection?: VitalsSectionSettings;                 // إعدادات القسم العام (العنوان)
  customBoxes?: CustomBox[];                             // الحقول المخصصة التي أضافها الطبيب
  customBoxValues?: Record<string, string>;              // قيم الحقول المخصصة
  setCustomBoxValue?: (boxId: string, value: string) => void; // دالة تحديث الحقول المخصصة
  alwaysShowWeight?: boolean;
}

// الإعدادات الافتراضية للعلامات الحيوية في حال عدم توفر إعدادات مخصصة
const DEFAULT_VITAL_CONFIG: VitalSignConfig[] = [
  { key: 'weight', label: 'Weight', labelAr: 'الوزن', unit: 'kg', enabled: true, order: 1 },
  { key: 'height', label: 'Height', labelAr: 'الطول', unit: 'cm', enabled: true, order: 2 },
  { key: 'bmi', label: 'BMI', labelAr: 'مؤشر الكتلة', unit: '', enabled: true, order: 3 },
  { key: 'rbs', label: 'RBS', labelAr: 'سكر الدم', unit: 'mg/dl', enabled: true, order: 4 },
  { key: 'bp', label: 'BP', labelAr: 'الضغط', unit: 'mmHg', enabled: true, order: 5 },
  { key: 'pulse', label: 'Pulse', labelAr: 'النبض', unit: 'bpm', enabled: true, order: 6 },
  { key: 'temp', label: 'Temp', labelAr: 'الحرارة', unit: '°C', enabled: true, order: 7 },
  { key: 'spo2', label: 'SpO2', labelAr: 'تشبع الأكسجين', unit: '%', enabled: true, order: 8 },
  { key: 'rr', label: 'RR', labelAr: 'التنفس', unit: '/min', enabled: true, order: 9 },
];

export const VitalSignsSection: React.FC<VitalSignsSectionProps> = ({
  weight, setWeight, height, setHeight, bmi, vitals, setVitals, vitalsConfig = DEFAULT_VITAL_CONFIG,
  vitalsSection, customBoxes = [], customBoxValues = {}, setCustomBoxValue,
  alwaysShowWeight = true,
}) => {
  const fieldTitleClass = 'text-[12px] font-black text-slate-700 mb-1.5 px-1 tracking-[0.01em]';
  
  // عنوان القسم (يمكن تغييره من الإعدادات)
  const sectionTitle = vitalsSection?.title || 'القياسات والعلامات الحيوية';

  // تصفية وترتيب العلامات الحيوية المفعلة (باستثناء الوزن والطول المعروضين في الصف الأول)
  const enabledVitals = vitalsConfig
    .filter(v => v.enabled && v.key !== 'weight' && v.key !== 'height' && v.key !== 'bmi' && v.key !== 'rbs')
    .sort((a, b) => a.order - b.order);

  // تصفية وترتيب الحقول المخصصة المفعلة
  const enabledCustomBoxes = customBoxes
    .filter(b => b.enabled)
    .sort((a, b) => a.order - b.order);

  // منطق العرض لمدخلات الصف الأول
  const weightConfig = vitalsConfig.find(v => v.key === 'weight');
  const heightConfig = vitalsConfig.find(v => v.key === 'height');
  const bmiConfig = vitalsConfig.find(v => v.key === 'bmi');
  const rbsConfig = vitalsConfig.find(v => v.key === 'rbs');
  const isWeightShown = alwaysShowWeight || (weightConfig?.enabled ?? true);
  const isHeightEnabled = heightConfig?.enabled ?? true;
  const isBmiEnabled = bmiConfig?.enabled ?? true;
  const isRbsEnabled = rbsConfig?.enabled ?? true;

  // التحقق مما إذا كان هناك أي عنصر مفعل للعرض
  const hasAnyEnabled = isWeightShown || isHeightEnabled || isBmiEnabled || isRbsEnabled || enabledVitals.length > 0 || enabledCustomBoxes.length > 0;
  if (!hasAnyEnabled) return null;

  return (
    <section className="clinic-section clinic-section--vitals p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-right" dir="rtl">
      {/* رأس القسم */}
      <div className="clinic-section-header mb-4">
        <div className="clinic-section-header__group">
          <div className="clinic-section-header__bar"></div>
          <div>
            <h2 className="clinic-section-header__title">{sectionTitle}</h2>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* شبكة موحدة: بدون فصل بين أول 4 مربعات وباقي العلامات */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-2 sm:gap-x-3 gap-y-5 sm:gap-y-6 items-stretch">
            {/* حقل إدخال الوزن (ضروري لحسابات ذكاء الأدوية) */}
            {isWeightShown && (
              <div className="flex-1 flex flex-col">
                <p className={fieldTitleClass}>{weightConfig?.labelAr || 'الوزن'}</p>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="clinic-field w-full h-[44px] px-2 rounded-2xl font-black text-slate-700 text-base text-center !bg-white !border-2 !border-slate-200 focus:!border-rose-400 hover:!border-rose-300 transition-colors dropdown-shadow"
                  placeholder={weightConfig?.unit || 'kg'}
                />
              </div>
            )}

            {/* حقل إدخال الطول */}
            {isHeightEnabled && (
              <div className="flex-1 flex flex-col">
                <p className={fieldTitleClass}>{heightConfig?.labelAr || 'الطول'}</p>
                <input
                  type="number"
                  step="0.1"
                  value={height || ''}
                  onChange={(e) => setHeight?.(e.target.value)}
                  className="clinic-field w-full h-[44px] px-2 rounded-2xl font-black text-slate-700 text-base text-center !bg-white !border-2 !border-slate-200 focus:!border-rose-400 hover:!border-rose-300 transition-colors dropdown-shadow"
                  placeholder={heightConfig?.unit || 'cm'}
                />
              </div>
            )}

            {/* حقل BMI + حقل السكر في نفس الصف */}
            {isBmiEnabled && (
              <div className="flex-1 flex flex-col">
                <p className={fieldTitleClass}>{bmiConfig?.labelAr || 'مؤشر الكتلة'}</p>
                <input
                  type="text"
                  readOnly
                  value={bmi || ''}
                  className="clinic-field clinic-field--readonly w-full h-[44px] px-4 rounded-2xl font-black text-slate-700 text-base text-center cursor-not-allowed !bg-slate-50/50 !border-2 !border-slate-200 dropdown-shadow"
                />
              </div>
            )}

            {isRbsEnabled && (
              <div className="flex-1 flex flex-col">
                <p className={fieldTitleClass}>{rbsConfig?.labelAr || 'سكر الدم'}</p>
                <input
                  type="number"
                  value={vitals.rbs}
                  onChange={(e) => setVitals('rbs', e.target.value)}
                  className="clinic-field w-full h-[44px] px-2 rounded-2xl font-black text-slate-700 text-base text-center !bg-white !border-2 !border-slate-200 focus:!border-rose-400 hover:!border-rose-300 transition-colors dropdown-shadow"
                  placeholder={rbsConfig?.unit || 'mg/dl'}
                />
              </div>
            )}

            {/* رندرة العلامات الحيوية المفعلة (نبض، حرارة، إلخ) */}
            {enabledVitals.map((vitalConfig) => (
              <div key={vitalConfig.key} className="flex flex-col">
                <p className={fieldTitleClass}>{vitalConfig.labelAr || vitalConfig.label}</p>
                <input
                  type={vitalConfig.key === 'bp' ? "text" : "number"}
                  inputMode={vitalConfig.key === 'bp' ? "text" : "numeric"}
                  value={(vitals as any)[vitalConfig.key] || ''}
                  onChange={(e) => setVitals(vitalConfig.key, e.target.value)}
                  className="clinic-field clinic-field--compact w-full h-[44px] px-2 rounded-xl font-bold text-center text-sm !bg-white !border-2 !border-slate-200 focus:!border-rose-400 hover:!border-rose-300 transition-colors dropdown-shadow"
                  placeholder={vitalConfig.unit}
                />
              </div>
            ))}
            
            {/* رندرة الحقول المخصصة التي أضافها الطبيب لنفسه */}
            {enabledCustomBoxes.map((box) => (
              <div key={box.id} className="flex flex-col">
                <p className={`${fieldTitleClass} uppercase tracking-wider`}>{box.label}</p>
                <input
                  type="text"
                  value={customBoxValues[box.id] !== undefined ? customBoxValues[box.id] : (box.value || '')}
                  onChange={(e) => setCustomBoxValue?.(box.id, e.target.value)}
                  className="clinic-field clinic-field--compact w-full h-[44px] px-2 rounded-xl font-bold text-center text-sm !bg-white !border-2 !border-slate-200 focus:!border-rose-400 hover:!border-rose-300 transition-colors dropdown-shadow"
                  placeholder="..."
                />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

