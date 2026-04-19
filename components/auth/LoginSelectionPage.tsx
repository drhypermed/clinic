/**
 * صفحة اختيار نوع الدخول (Login Selection Page):
 * تصميم فيسبوك-style: شعار كبير جنب كارد أبيض واحد بأزرار دخول واضحة.
 * على الشاشات الصغيرة: شعار فوق وكارد تحت. على الديسكتوب: شعار شمال وكارد يمين.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserDoctor,
  FaUserPlus,
  FaClipboardUser,
  FaUserGroup,
  FaShieldHalved,
} from 'react-icons/fa6';
import { AuthLayout } from './AuthLayout';
import { BrandLogo } from '../common/BrandLogo';
import { useHideBootSplash } from '../../hooks/useHideBootSplash';

interface RoleOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: 'blue' | 'emerald';
  route: string;
}

const OPTIONS: RoleOption[] = [
  {
    id: 'login-doctor',
    title: 'تسجيل دخول الطبيب',
    subtitle: 'للأطباء المسجّلين — عبر Google',
    icon: <FaUserDoctor className="w-6 h-6" />,
    tone: 'blue',
    route: '/login/doctor',
  },
  {
    id: 'signup-doctor',
    title: 'إنشاء حساب جديد للطبيب',
    subtitle: 'للأطباء الجدد المنضمّين للمنصة',
    icon: <FaUserPlus className="w-6 h-6" />,
    tone: 'blue',
    route: '/signup/doctor',
  },
  {
    id: 'login-secretary',
    title: 'دخول السكرتارية',
    subtitle: 'بإيميل الطبيب والرقم السري',
    icon: <FaClipboardUser className="w-6 h-6" />,
    tone: 'emerald',
    route: '/login/secretary',
  },
  {
    id: 'login-public',
    title: 'دخول الجمهور',
    subtitle: 'للمرضى — دليل الأطباء وحجز المواعيد',
    icon: <FaUserGroup className="w-6 h-6" />,
    tone: 'emerald',
    route: '/login/public',
  },
];

export const LoginSelectionPage: React.FC = () => {
  useHideBootSplash('login-selection-mounted');
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-4 lg:gap-20 py-4 lg:py-8" dir="rtl">
        {/* Brand side */}
        <div className="flex-1 flex flex-col items-center text-center max-w-md">
          <BrandLogo className="w-72 h-72 lg:w-[22rem] lg:h-[22rem] mb-2" size={352} fetchPriority="high" />
          <div className="mt-2 lg:mt-5 inline-block bg-white/90 rounded-xl ring-1 ring-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_-10px_rgba(15,23,42,0.15)] px-5 py-3">
            <p className="text-xl lg:text-2xl font-bold text-slate-900 leading-snug">
              النظام الأقوى لإدارة العيادات
            </p>
            <p className="mt-2 text-base text-slate-700 font-semibold leading-relaxed">
              اختر نوع الدخول المناسب لك من القائمة وابدأ استخدام المنصة.
            </p>
          </div>
        </div>

        {/* Card side */}
        <div className="flex-1 w-full max-w-md">
          <div className="relative bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.15)] ring-1 ring-slate-200/60 p-5 space-y-3 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500" />
            {OPTIONS.map((opt) => {
              const isBlue = opt.tone === 'blue';
              const iconBg = isBlue
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white';
              const hoverBg = isBlue ? 'hover:bg-blue-50' : 'hover:bg-emerald-50';
              const hoverBorder = isBlue ? 'hover:border-blue-400' : 'hover:border-emerald-400';
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => navigate(opt.route)}
                  className={`group w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl text-right transition-all ${hoverBg} ${hoverBorder} hover:shadow-sm active:scale-[0.99]`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-black text-slate-900 leading-tight">{opt.title}</div>
                    <div className="text-sm text-slate-600 font-semibold mt-0.5">{opt.subtitle}</div>
                  </div>
                </button>
              );
            })}

            <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-center gap-2">
              <FaShieldHalved className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-xs text-slate-600 font-semibold">
                جميع البيانات محمية ومشفّرة — موثّق طبياً
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
