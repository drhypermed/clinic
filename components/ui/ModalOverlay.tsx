/**
 * ModalOverlay — هيكل مودال أساسي مشترك
 *
 * الهدف: تقليل التكرار في مئات أسطر مودالات التأكيد/التحذير/الاختيار عبر
 * توفير shell موحّد يتولى:
 *   1. الـ backdrop الثابت (fixed inset-0) مع z-index قابل للتخصيص.
 *   2. الإغلاق عند الضغط على الـ backdrop (اختياري).
 *   3. الإغلاق بمفتاح ESC (اختياري).
 *   4. منع انتشار النقرات على محتوى المودال (stopPropagation).
 *   5. اختيار الحركة `fade` / `slideUp` / `both`.
 *   6. إخفاء من الطباعة عبر class `no-print` (اختياري).
 *
 * ملاحظات دلالية حرجة:
 * - الفروقات بين المودالات الحالية (z-[9999] مقابل z-[200]، backdrop مختلف،
 *   `no-print` في بعضها دون الآخر) يجب الحفاظ عليها كما هي عبر الـ props،
 *   لأنها تؤثر على الطبقات المطبوعة وعلى ظهور تحذيرات فوق مودالات أخرى.
 * - يستخدم `createPortal` على document.body للهروب من stacking contexts الأب
 *   (transform/zoom/filter) التي كانت تسبب اختفاء بعض المودالات تحت هيدر التطبيق على الموبايل.
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type ModalAnimation = 'fade' | 'slideUp' | 'both' | 'none';

interface ModalOverlayProps {
  /** هل المودال مفتوح؟ */
  isOpen: boolean;
  /** دالة تُستدعى عند طلب الإغلاق (ESC أو backdrop click) */
  onClose: () => void;
  children: React.ReactNode;
  /** z-index للـ overlay — افتراضي 9999 */
  zIndex?: number;
  /** Tailwind classes لخلفية الـ backdrop — افتراضي `bg-black/50 backdrop-blur-sm` */
  backdropClass?: string;
  /** إضافة class `no-print` لإخفاء المودال عند الطباعة */
  noPrint?: boolean;
  /** إغلاق عند النقر على الـ backdrop خارج المحتوى — افتراضي true */
  closeOnBackdropClick?: boolean;
  /** إغلاق عند الضغط على ESC — افتراضي true */
  closeOnEsc?: boolean;
  /** نوع حركة الدخول — افتراضي `fade` */
  animateIn?: ModalAnimation;
  /** classes إضافية للحاوية الخارجية (padding مثلاً) */
  overlayClassName?: string;
  /** classes إضافية للحاوية الداخلية للمحتوى */
  contentClassName?: string;
  /** aria-labelledby للوصولية */
  labelledBy?: string;
}

const animationClassMap: Record<ModalAnimation, string> = {
  fade: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  both: 'animate-fadeIn animate-slideUp',
  none: '',
};

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  isOpen,
  onClose,
  children,
  zIndex = 9999,
  backdropClass = 'bg-black/50 backdrop-blur-sm',
  noPrint = false,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  animateIn = 'fade',
  overlayClassName = '',
  contentClassName = '',
  labelledBy,
}) => {
  // الإغلاق بمفتاح ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return;
    if (event.target === event.currentTarget) onClose();
  };

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdropClick) return;
    if (event.target === event.currentTarget) onClose();
  };

  const overlayClasses = [
    'fixed inset-0 flex items-center justify-center p-4',
    backdropClass,
    animationClassMap[animateIn] || '',
    noPrint ? 'no-print' : '',
    overlayClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // Portal المودال إلى document.body للهروب من أي stacking context
  // (transform, zoom, filter) في المكونات الأب اللي بيكسر position:fixed
  // ويخلي المودال يظهر تحت هيدر التطبيق على الموبايل.
  const modalTree = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className={overlayClasses}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className={contentClassName}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return modalTree;
  return createPortal(modalTree, document.body);
};
