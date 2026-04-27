import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

// ─ تصميم موحّد مع باقي شاشات الأدمن (إدارة الحسابات / فئات الاشتراك):
//   هيدر فاتح أبيض + accent متدرج أزرق-أخضر بدل الهيدر الأسود الغامق القديم.
//   التصميم القديم كان يظهر "غريب" في وسط شاشات الأدمن الفاتحة.
//
// ─ كمان: الـbackdrop بقى overflow-y-auto + الـbody بـmax-h عشان لو الـcontent
//   أطول من الشاشة، الـmodal يـscroll جواه بدل ما يخرج لأعلى/أسفل الـviewport.
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[300] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white rounded-2xl shadow-[0_25px_70px_-30px_rgba(0,0,0,0.45)] w-full ${maxWidth} max-h-[calc(100vh-2rem)] overflow-hidden border border-slate-200 flex flex-col my-auto`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-200 flex-shrink-0 relative">
            {/* شريط accent متدرج فوق الهيدر — نفس نمط شاشات الأدمن */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-success-500" />
            <h3 className="text-lg font-black tracking-tight text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-all active:scale-90 border border-slate-200"
              aria-label="إغلاق"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* الـbody بـoverflow-y-auto عشان الـcontent الكبير يـscroll جواه */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
