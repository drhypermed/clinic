/**
 * ImageUploadUpgradeModal — مودال يظهر للحساب المجاني لما يحاول يرفع صورة.
 *
 * بيستدعى من `useImageUploadGate` hook لما `tryUpload` يرفض. تصميمه موحّد
 * مع باقي مودالات التطبيق (Modal component) عشان يظهر في نص الشاشة بشكل احترافي.
 */

import React from 'react';
import { FaImage, FaWhatsapp } from 'react-icons/fa6';
import { Modal } from '../ui/Modal';

interface ImageUploadUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** نص رسالة الترقية من إعدادات الأدمن */
  message: string;
  /** رابط واتساب جاهز برسالة الترقية (لو موجود) */
  whatsappUrl: string;
}

export const ImageUploadUpgradeModal: React.FC<ImageUploadUpgradeModalProps> = ({
  isOpen,
  onClose,
  message,
  whatsappUrl,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🌟 ترقية الباقة">
      <div className="p-6 space-y-5" dir="rtl">
        {/* أيقونة + توضيح */}
        <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <FaImage className="w-5 h-5" />
          </div>
          <p className="text-sm font-bold text-slate-800 leading-relaxed">
            {message}
          </p>
        </div>

        {/* أزرار */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            ليس الآن
          </button>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-success-600 to-success-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:from-success-700 hover:to-success-800"
            >
              <FaWhatsapp className="w-4 h-4" />
              تواصل للترقية
            </a>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:from-brand-700 hover:to-brand-800"
            >
              حسناً
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
