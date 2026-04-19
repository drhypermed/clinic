/**
 * مكون تخطيط صفحات المواثقة (AuthLayout):
 * خلفية فيسبوك-style: رمادي فاتح ثابت #f0f2f5 بدون أي تدرّجات أو كرات ضوء.
 * الكروت البيضاء تبان بوضوح والنص عالي التباين.
 */
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#f5f7fa] text-slate-900">
      {/* تدرج ملوّن خفيف */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(700px 500px at 15% 10%, rgba(37,99,235,0.22) 0%, transparent 62%), radial-gradient(650px 500px at 90% 15%, rgba(168,85,247,0.18) 0%, transparent 62%), radial-gradient(750px 550px at 85% 90%, rgba(16,185,129,0.20) 0%, transparent 62%)',
        }}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};
