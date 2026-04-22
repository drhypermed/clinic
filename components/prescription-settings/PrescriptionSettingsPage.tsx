/**
 * الملف: PrescriptionSettingsPage.tsx
 * الوصف: الصفحة الرئيسية لإعدادات تصميم الروشتة.
 * تتضمن خمسة تبويبات: الجزء العلوي، السفلي، الجانبي، الوسط، وإعدادات الطباعة.
 * إعدادات الطباعة تتحكم في مقاس الورقة والهوامش وتُحفظ ضمن إعدادات الروشتة.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { PrescriptionSettings } from '../../types';
import { useTabSync } from '../../hooks/useTabSync';
import { usePrescriptionSettingsForm } from './usePrescriptionSettingsForm';
import { PrescriptionSettingsPreview } from './PrescriptionSettingsPreview';
import { PrescriptionSettingsTabs, type SettingsTabId } from './PrescriptionSettingsTabs';
import { HeaderSettingsTab } from './header-settings/HeaderSettingsTab';
import { FooterSettingsTab } from './footer-settings/FooterSettingsTab';
import { VitalsSettingsTab } from './vitals-settings/VitalsSettingsTab';
import { MiddleSettingsTab } from './MiddleSettingsTab';
import { PaperSizeSelector } from './PaperSizeSelector';
import { TypographyControls } from './TypographyControls';
import { getPaperWidthPx } from './utils';
import { LogoCropper } from '../croppers/LogoCropper';
import { HeaderBgCropper } from '../croppers/HeaderBgCropper';
import { MiddleBgCropper } from '../croppers/MiddleBgCropper';

interface PrescriptionSettingsPageProps {
    settings: PrescriptionSettings;
    onSave: (settings: PrescriptionSettings) => Promise<void>;
    onBack: () => void;
}

/** عنوان التبويب لزر إعادة الضبط */
const TAB_RESET_LABEL: Record<SettingsTabId, string> = {
    header: 'الجزء العلوي',
    footer: 'الجزء السفلي',
    vitals: 'الجزء الجانبي',
    middle: 'الوسط',
    print: 'إعدادات الطباعة',
};

export const PrescriptionSettingsPage: React.FC<PrescriptionSettingsPageProps> = ({ settings, onSave, onBack }) => {
    // التبويب النشط (متزامن مع URL ?tab=...)
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<SettingsTabId>(
        () => {
            const urlTab = searchParams.get('tab');
            const valid: SettingsTabId[] = ['header', 'footer', 'vitals', 'middle', 'print'];
            return urlTab && valid.includes(urlTab as SettingsTabId) ? urlTab as SettingsTabId : 'header';
        },
    );
    const { setTabWithUrl } = useTabSync<SettingsTabId>(
        'tab', activeTab, setActiveTab, 'header',
        ['header', 'footer', 'vitals', 'middle', 'print'] as const,
    );
    const [previewScale, setPreviewScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = usePrescriptionSettingsForm({ settings, onSave });

    // إعادة حساب مقياس المعاينة عند تغيير حجم النافذة أو مقاس الورقة
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.getBoundingClientRect().width;
            const availableWidth = Math.min(containerWidth, window.innerWidth - 32);
            const paperWidthPx = getPaperWidthPx(form.localSettings.paperSize);
            const scale = Math.min(availableWidth / paperWidthPx, 1);
            setPreviewScale(Math.max(scale, 0.2));
        };

        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) observer.observe(containerRef.current);
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.localSettings.paperSize]);

    return (
        // توحيد الخلفيه مع صفحات السجلات وملفات المرضى: بيضاء بدون تدرّج.
        // قبل كده كانت from-slate-50 via-blue-50/30 to-indigo-50/20 (تدرّج فاتح).
        <div className="bg-white min-h-screen max-w-[100vw] overflow-x-hidden pb-32" dir="rtl">

            {/* Toast Notification */}
            {form.notification && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
                    <div className={`pointer-events-auto px-8 py-4 rounded-2xl shadow-2xl font-black text-center text-lg animate-bounce ${
                        form.notification.type === 'success'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                    }`}>
                        {form.notification.message}
                    </div>
                </div>,
                document.body
            )}

            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pb-4">

                {/* ---- التبويبات ---- */}
                <div className="pt-4 pb-1 dh-stagger-1">
                    <PrescriptionSettingsTabs activeTab={activeTab} onTabChange={setTabWithUrl} />
                </div>

                {/* ---- منطقة المعاينة الحية ---- */}
                <div ref={containerRef} className="w-full relative z-50 dh-stagger-2">
                    <PrescriptionSettingsPreview
                        activeTab={activeTab}
                        localSettings={form.localSettings}
                        previewRef={previewRef}
                        previewScale={previewScale}
                    />
                </div>

                {/* ---- لوحة الإعدادات ---- */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 overflow-hidden relative z-10 dh-stagger-3">

                    {/* شريط علوي ملون حسب التبويب */}
                    <div className={`h-1.5 w-full ${
                        activeTab === 'header' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        activeTab === 'footer' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                        activeTab === 'vitals' ? 'bg-gradient-to-r from-rose-500 to-pink-600' :
                        activeTab === 'middle' ? 'bg-gradient-to-r from-violet-500 to-purple-600' :
                        'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`} />

                    <div className="p-5 sm:p-6">

                        {/* محتوى كل تبويب */}
                        {activeTab === 'header' && (
                            <HeaderSettingsTab
                                header={form.localSettings.header}
                                defaultHeader={form.defaultSettings.header}
                                updateHeader={form.updateHeader}
                                openSection={form.openSection}
                                setOpenSection={form.setOpenSection}
                                showNotification={form.showNotification}
                                handleStyleChange={form.handleStyleChange}
                                handlePreset={form.handlePreset}
                                editorRefs={form.editorRefs}
                                fileInputRef={fileInputRef}
                                setLogoToCrop={form.setLogoToCrop}
                                setHeaderBgToCrop={form.setHeaderBgToCrop}
                            />
                        )}

                        {activeTab === 'footer' && (
                            <FooterSettingsTab
                                footer={form.localSettings.footer}
                                updateFooter={form.updateFooter}
                                openSection={form.openSection}
                                setOpenSection={form.setOpenSection}
                                showNotification={form.showNotification}
                                handleStyleChange={form.handleStyleChange}
                                handlePreset={form.handlePreset}
                                editorRefs={form.editorRefs}
                                setFooterBgToCrop={form.setFooterBgToCrop}
                                setFooterLogoToCrop={form.setFooterLogoToCrop}
                            />
                        )}

                        {activeTab === 'vitals' && (
                            <VitalsSettingsTab
                                vitals={form.localSettings.vitals}
                                updateVital={form.updateVital}
                                moveVital={form.moveVital}
                                vitalsSection={form.localSettings.vitalsSection}
                                updateVitalsSection={form.updateVitalsSection}
                                customBoxes={Array.isArray(form.localSettings.customBoxes) ? form.localSettings.customBoxes : []}
                                addCustomBox={form.addCustomBox}
                                updateCustomBox={form.updateCustomBox}
                                deleteCustomBox={form.deleteCustomBox}
                                moveCustomBox={form.moveCustomBox}
                            />
                        )}

                        {activeTab === 'middle' && (
                            <MiddleSettingsTab
                                middle={form.localSettings.middle || {}}
                                updateMiddle={form.updateMiddle}
                                openSection={form.openSection}
                                setOpenSection={form.setOpenSection}
                                showNotification={form.showNotification}
                                setMiddleBgToCrop={form.setMiddleBgToCrop}
                            />
                        )}

                        {activeTab === 'print' && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="font-black text-slate-800 text-base">إعدادات الطباعة</h2>
                                        <p className="text-xs text-slate-500">تحكم في مقاس ورقة الروشتة والهوامش لجميع الطابعات</p>
                                    </div>
                                </div>
                                <PaperSizeSelector
                                    paperSize={form.localSettings.paperSize}
                                    onChange={form.updatePaperSize}
                                />
                                <TypographyControls
                                    typography={form.localSettings.typography}
                                    onChange={form.updateTypography}
                                />
                            </div>
                        )}

                        {/* ---- أزرار الحفظ وإعادة الضبط ---- */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-slate-100">
                            <button
                                onClick={form.handleSave}
                                disabled={form.saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-xl shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {form.saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        جاري الحفظ
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        حفظ الإعدادات
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => form.handleReset(activeTab)}
                                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98] border border-slate-200 text-sm whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                إعادة {TAB_RESET_LABEL[activeTab]} للافتراضي
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---- Modals للقص ---- */}
            {form.logoToCrop && (
                <LogoCropper
                    imageSrc={form.logoToCrop}
                    onCropComplete={cropped => {
                        form.updateHeader({ logoBase64: cropped });
                        form.setLogoToCrop(null);
                        form.showNotification('success', 'تم حفظ الشعار بنجاح');
                    }}
                    onCancel={() => form.setLogoToCrop(null)}
                />
            )}
            {form.headerBgToCrop && (
                <HeaderBgCropper
                    imageSrc={form.headerBgToCrop}
                    onCropComplete={(cropped, opacity) => {
                        form.updateHeader({ headerBackgroundImage: cropped, headerBackgroundOpacity: opacity });
                        form.setHeaderBgToCrop(null);
                        form.showNotification('success', 'تم حفظ تصميم الهيدر بنجاح');
                    }}
                    onCancel={() => form.setHeaderBgToCrop(null)}
                />
            )}
            {form.footerBgToCrop && (
                <HeaderBgCropper
                    imageSrc={form.footerBgToCrop}
                    onCropComplete={(cropped, opacity) => {
                        form.updateFooter({ footerBackgroundImage: cropped, footerBgOpacity: opacity });
                        form.setFooterBgToCrop(null);
                        form.showNotification('success', 'تم حفظ تصميم الفوتر بنجاح');
                    }}
                    onCancel={() => form.setFooterBgToCrop(null)}
                />
            )}
            {form.footerLogoToCrop && (
                <LogoCropper
                    imageSrc={form.footerLogoToCrop}
                    onCropComplete={cropped => {
                        form.updateFooter({ logoBase64: cropped });
                        form.setFooterLogoToCrop(null);
                        form.showNotification('success', 'تم حفظ شعار الفوتر بنجاح');
                    }}
                    onCancel={() => form.setFooterLogoToCrop(null)}
                />
            )}
            {form.middleBgToCrop && (
                <MiddleBgCropper
                    imageSrc={form.middleBgToCrop}
                    onCropComplete={(cropped, opacity) => {
                        form.updateMiddle({ middleBackgroundImage: cropped, middleBgOpacity: opacity });
                        form.setMiddleBgToCrop(null);
                        form.showNotification('success', 'تم حفظ تصميم منتصف الروشتة بنجاح');
                    }}
                    onCancel={() => form.setMiddleBgToCrop(null)}
                />
            )}
        </div>
    );
};
