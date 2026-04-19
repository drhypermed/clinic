/**
 * WhatsAppDownloadGuideModal — تنبيه توجيهي لزر إرسال واتساب.
 *
 * يظهر عندما يضغط الطبيب زر "إرسال واتساب" قبل أن ينزّل ملف الـ PDF.
 * الرسالة توجّهه لاتّباع خطوتين:
 *   1) اضغط "تنزيل الروشتة" واحفظها كـ PDF.
 *   2) ارجع واضغط "إرسال واتساب" لفتح محادثة المريض ثم أرفق الملف يدوياً.
 *
 * التنبيه لا يختفي تلقائياً — يجب على الطبيب الضغط على "فهمت" لإغلاقه،
 * عشان يتأكد من قراءة التعليمات قبل المتابعة.
 */

import React from 'react';
import { ModalOverlay } from '../ui/ModalOverlay';

interface WhatsAppDownloadGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WhatsAppDownloadGuideModal: React.FC<WhatsAppDownloadGuideModalProps> = ({
    isOpen,
    onClose,
}) => {
    return (
        <ModalOverlay
            isOpen={isOpen}
            onClose={onClose}
            zIndex={9999}
            backdropClass="bg-slate-900/70 backdrop-blur-sm"
            noPrint
            animateIn="both"
            contentClassName="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            labelledBy="wa-guide-title"
        >
            <>
                {/* رأس النافذة — أخضر واتساب */}
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 px-5 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 id="wa-guide-title" className="text-xl font-black mb-1 leading-tight">
                                قبل الإرسال عبر واتساب
                            </h2>
                            <p className="text-emerald-50 text-xs font-bold">
                                اتّبع الخطوتين لإرسال الروشتة للمريض
                            </p>
                        </div>
                    </div>
                </div>

                {/* الخطوات */}
                <div className="p-5 space-y-3">
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0">
                                1
                            </div>
                            <div className="flex-1 pt-0.5">
                                <p className="text-emerald-900 font-black text-sm leading-relaxed">
                                    اضغط زر <span className="text-emerald-700">«تنزيل الروشتة»</span> أولاً
                                </p>
                                <p className="text-emerald-700 text-xs font-bold mt-1 leading-relaxed">
                                    اختر "حفظ كملف PDF" من نافذة الطباعة — سيُحفظ الملف باسم المريض تلقائياً.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0">
                                2
                            </div>
                            <div className="flex-1 pt-0.5">
                                <p className="text-emerald-900 font-black text-sm leading-relaxed">
                                    اضغط زر <span className="text-emerald-700">«إرسال واتساب»</span> مرة أخرى
                                </p>
                                <p className="text-emerald-700 text-xs font-bold mt-1 leading-relaxed">
                                    ستُفتح محادثة المريض على الرقم المسجّل — أرفق ملف الـ PDF اللي نزّلته يدوياً.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                            <span className="text-lg shrink-0">💡</span>
                            <p className="text-amber-800 text-[11px] font-bold leading-relaxed">
                                واتساب لا يسمح بإرفاق الملفات تلقائياً عبر الروابط لأسباب أمنية — لذلك الإرفاق يدوي داخل المحادثة.
                            </p>
                        </div>
                    </div>
                </div>

                {/* زر التأكيد */}
                <div className="bg-slate-50 p-4 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        autoFocus
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>فهمت، حسناً</span>
                        </div>
                    </button>
                </div>
            </>
        </ModalOverlay>
    );
};
