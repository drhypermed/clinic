import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  alt?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  glow?: boolean;
}

/**
 * شعار دكتور هايبر مع أنيميشن اللمعة المنسابة.
 * className يحدد الأبعاد (مثلاً: "w-56 h-56").
 * glow يضيف ظلاً ملوناً خلف الشعار — مناسب للشعارات الكبيرة.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 320,
  alt = 'Dr Hyper',
  fetchPriority,
  loading,
  glow = true,
}) => {
  const stageClass = `dh-logo-stage${glow ? ' dh-logo-stage--glow' : ''} ${className}`;
  return (
    <div className={stageClass} role="img" aria-label={alt}>
      <img
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        fetchPriority={fetchPriority}
        loading={loading}
        decoding="async"
        className="dh-logo-base"
      />
      <div className="dh-logo-shine" aria-hidden="true" />
    </div>
  );
};
