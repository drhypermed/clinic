import React from 'react';
import { formatUserDate, formatUserTime } from '../../utils/cairoTime';

interface PremiumExpiryWarningProps {
  expiryDate: Date;
  mode?: 'expiring' | 'expired';
  onClose?: () => void;
}

/**
 * إشعار تحذيري يظهر في أعلى الصفحة عند اقتراب انتهاء اشتراك برو
 */
export const PremiumExpiryWarning: React.FC<PremiumExpiryWarningProps> = ({ expiryDate, mode = 'expiring', onClose }) => {
  const isExpired = mode === 'expired';
  const dateStr = formatUserDate(expiryDate, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }, 'ar-EG');
  const timeStr = formatUserTime(expiryDate, {
    hour: '2-digit',
    minute: '2-digit'
  }, 'ar-EG');

  const handleWhatsAppClick = () => {
    const phoneNumber = '201092805293'; // مع كود الدولة
    const message = encodeURIComponent(
      isExpired
        ? 'مرحباً، اشتراكي برو انتهى وأرغب في التجديد'
        : 'مرحباً، أريد تجديد اشتراكي برو'
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const bannerGradient = isExpired
    ? 'from-rose-600 via-red-600 to-orange-500'
    : 'from-amber-500 via-orange-500 to-red-500';
  const title = isExpired
    ? 'انتهى اشتراكك برو'
    : 'اشتراك برو سينتهي قريبًا';
  const bodyText = isExpired
    ? 'يرجى إعادة تجديد الاشتراك للاستمرار في استخدام كل بروات.'
    : 'الرجاء تجديد اشتراكك للاستمرار في استخدام كافة بروات.';

  return (
    <div className={`w-full bg-gradient-to-r ${bannerGradient} text-white shadow-xl animate-slideDown`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="relative rounded-2xl border border-white/25 bg-black/10 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute left-2 top-2 sm:left-3 sm:top-3 p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="إغلاق"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="shrink-0 mt-0.5 rounded-full bg-white/20 p-2 sm:p-2.5 animate-pulse">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] sm:text-xs font-black tracking-wide mb-1.5 sm:mb-2">
                  تنبيه الاشتراك
                </span>
                <h3 className="text-base sm:text-lg font-black leading-tight mb-1.5">{title}</h3>
                <p className="text-sm sm:text-[15px] leading-7 font-bold text-white/95">
                  {isExpired ? 'انتهى اشتراكك برو' : 'اشتراك برو سينتهي'} في <span className="font-black">{dateStr}</span> الساعة <span className="font-black">{timeStr}</span>. {bodyText}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-lg border border-white/30 bg-white/15 px-2.5 py-1.5 text-xs sm:text-sm font-black">
                تاريخ الانتهاء: {dateStr}
              </span>
              <span className="inline-flex items-center rounded-lg border border-white/30 bg-white/15 px-2.5 py-1.5 text-xs sm:text-sm font-black">
                الساعة: {timeStr}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm font-bold text-white/90">
                للتجديد السريع تواصل معنا عبر واتساب
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm sm:text-base transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>تواصل معنا</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
