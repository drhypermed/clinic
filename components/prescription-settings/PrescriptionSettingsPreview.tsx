/**
 * الملف: PrescriptionSettingsPreview.tsx
 * الوصف: المعاينة الحية الذكية لتصميم الروشتة.
 *
 * منطق التمرير الذكي:
 * - A5 (أي تبويب): المعاينة تطفو (Sticky) مع التمرير – السلوك الحالي.
 * - غير A5 (header/footer): نفس سلوك A5 (تطفو مع التمرير).
 * - غير A5 (vitals/middle/print): المعاينة ثابتة في مكانها ولا تتبع التمرير.
 *
 * تبويب الطباعة: يعرض معاينة كاملة للورقة مع تصوير الهوامش.
 *
 * بعد التقسيم:
 * - usePreviewScroll: إدارة sticky/scroll وقياس الارتفاعات.
 * - PreviewPrintPanel: معاينة الطباعة الكاملة.
 * - PreviewMiddleBackground: طبقة صورة الخلفية الوسطى.
 */

import React, { RefObject, useRef, useMemo } from 'react';
import { PrescriptionSettings, PrescriptionItem } from '../../types';
import { PrescriptionHeader } from '../prescription/PrescriptionHeader';
import { InfoBar } from '../prescription/InfoBar';
import { PrescriptionFooter } from '../prescription/PrescriptionFooter';
import { VitalsSidebar } from '../prescription/VitalsSidebar';
import { RxList } from '../prescription/RxList';
import {
  getPaperDimensions,
  getPaperMargins,
  getPrintScale,
  getPrintOffset,
  MM_TO_PX,
} from './utils';
import type { SettingsTabId } from './PrescriptionSettingsTabs';
import {
  FOOTER_H_PX,
  HEADER_H_PX,
  INFOBAR_H_PX,
  PRINT_PREVIEW_RX_ITEMS,
  TAB_COLORS,
  TAB_LABELS,
  buildVitalConfigForPreview,
} from './prescription-settings-preview/helpers';
import { usePreviewScroll } from './prescription-settings-preview/usePreviewScroll';
import { PreviewMiddleBackground } from './prescription-settings-preview/PreviewMiddleBackground';
import { PreviewPrintPanel } from './prescription-settings-preview/PreviewPrintPanel';

interface PrescriptionSettingsPreviewProps {
  activeTab: SettingsTabId;
  localSettings: PrescriptionSettings;
  previewRef: RefObject<HTMLDivElement | null>;
  previewScale: number;
}

export const PrescriptionSettingsPreview: React.FC<PrescriptionSettingsPreviewProps> = ({
  activeTab,
  localSettings,
  previewRef,
  previewScale,
}) => {
  // كنا نستقبل نصوص وأدوية معاينة مخصّصة من تاب "المنتصف"، لكن تلك الـ inputs اتحذفت
  // (اتكررت مع تاب الطباعة). نستخدم دائماً قائمة PRINT_PREVIEW_RX_ITEMS الافتراضية.
  const previewRxItems: PrescriptionItem[] = [];
  const containerRef = useRef<HTMLDivElement>(null);
  const previewElementRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);

  // أبعاد الورقة
  const { widthMm, heightMm } = getPaperDimensions(localSettings?.paperSize);
  const paperWidthPx = widthMm * MM_TO_PX;
  const paperHeightPx = heightMm * MM_TO_PX;
  const contentAreaHeightPx = Math.max(
    200,
    paperHeightPx - HEADER_H_PX - INFOBAR_H_PX - FOOTER_H_PX,
  );

  // منطق التمرير الذكي مستخرج في hook
  const { offsetY, headerFooterHeight, isStickyMode } = usePreviewScroll({
    activeTab,
    localSettings,
    containerRef,
    innerContentRef,
  });

  // هوامش الورقة وإزاحتها (لتبويب الطباعة)
  const paperMargins = useMemo(
    () => getPaperMargins(localSettings?.paperSize),
    [localSettings?.paperSize],
  );
  const printScale = useMemo(
    () => getPrintScale(localSettings?.paperSize),
    [localSettings?.paperSize],
  );
  const printOffset = useMemo(
    () => getPrintOffset(localSettings?.paperSize),
    [localSettings?.paperSize],
  );

  // لون خلفية القسم الأوسط (مع دعم الشفافية)
  const middleBgColor = localSettings?.middle?.middleBgColor
    ? `${localSettings.middle.middleBgColor}${Math.round(
        (localSettings.middle.middleBgColorOpacity ?? 0) * 255,
      )
        .toString(16)
        .padStart(2, '0')}`
    : '#ffffff';

  // الأدوية التجريبية لتبويب الطباعة
  const printRxItems = previewRxItems.length > 0 ? previewRxItems : PRINT_PREVIEW_RX_ITEMS;

  // الـ vitals config للمعاينة (helper مستخرج)
  const vitalConfig = useMemo(
    () => buildVitalConfigForPreview(activeTab, localSettings),
    [activeTab, localSettings?.vitals, localSettings?.customBoxes],
  );

  // ارتفاع حاوية المعاينة المُصغَّرة
  const scaledContainerHeight = (() => {
    if (activeTab === 'print') return `${paperHeightPx * previewScale}px`;
    if (activeTab === 'middle' || activeTab === 'vitals')
      return `${contentAreaHeightPx * previewScale}px`;
    return headerFooterHeight > 0 ? `${headerFooterHeight * previewScale}px` : 'auto';
  })();

  const innerHeight = (() => {
    if (activeTab === 'print') return `${paperHeightPx}px`;
    if (activeTab === 'middle' || activeTab === 'vitals') return `${contentAreaHeightPx}px`;
    return 'auto';
  })();

  // ألوان التبويبات وتسمياتها (مستخرجة إلى helpers)
  const colors = TAB_COLORS[activeTab];

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center overflow-visible relative z-[100] mb-4"
      dir="ltr"
    >
      <div
        ref={(el) => {
          (previewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          previewElementRef.current = el;
        }}
        className="flex flex-col items-center"
        style={{
          width: 'fit-content',
          maxWidth: '100%',
          minWidth: 0,
          position: 'relative',
          zIndex: 60,
          boxSizing: 'border-box',
          transform: `translateY(${offsetY}px)`,
          transition: 'transform 0.05s linear',
        }}
      >
        {/* ---- شريط العنوان ---- */}
        <div
          className={`w-full bg-gradient-to-r ${colors.bg} px-3 py-2 flex items-center justify-between gap-2 rounded-t-xl`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <span className="text-white font-black text-xs">
              معاينة حية — {TAB_LABELS[activeTab]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/80 text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">
              {widthMm}×{heightMm}mm
            </span>
            {!isStickyMode && (
              <span className="text-white/70 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">
                ثابتة
              </span>
            )}
          </div>
        </div>

        {/* ---- حاوية المعاينة المُصغَّرة ---- */}
        <div
          className="flex justify-center"
          style={{
            width: `${paperWidthPx * previewScale}px`,
            maxWidth: '100%',
            height: scaledContainerHeight,
            overflow: 'visible',
            padding: 0,
            margin: 0,
          }}
        >
          <div
            style={{
              width: `${paperWidthPx}px`,
              minWidth: `${paperWidthPx}px`,
              maxWidth: 'none',
              height: innerHeight,
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              backgroundColor: 'white',
              position: 'relative',
              margin: 0,
              padding: 0,
              fontFamily: '"El Messiri", "Playfair Display", sans-serif',
              display: 'block',
              overflow:
                activeTab === 'middle' || activeTab === 'vitals' || activeTab === 'print'
                  ? 'hidden'
                  : 'visible',
            }}
          >
            {/* معاينة الهيدر */}
            {activeTab === 'header' && (
              <div ref={innerContentRef} className="w-full bg-white">
                <PrescriptionHeader
                  headerSettings={localSettings.header}
                  isDataOnlyMode={false}
                />
                <InfoBar
                  patientName="اسم المريض"
                  setPatientName={() => {}}
                  ageString="35 سنة و 2 شهر"
                  headerFontSize="text-[13px]"
                  isDataOnlyMode={false}
                  isPrintMode={true}
                  hasContent={true}
                  date={new Date().toISOString()}
                  headerSettings={localSettings.header}
                />
              </div>
            )}

            {/* معاينة الفوتر */}
            {activeTab === 'footer' && (
              <div ref={innerContentRef} className="w-full bg-white">
                <PrescriptionFooter
                  footerSettings={localSettings.footer}
                  isDataOnlyMode={false}
                  footerSize="medium"
                />
              </div>
            )}

            {/* معاينة الجانبي (vitals) */}
            {activeTab === 'vitals' && (
              <div
                style={{
                  width: '100%',
                  height: `${contentAreaHeightPx}px`,
                  minHeight: 200,
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  borderTop: '3px solid #cbd5e1',
                  borderBottom: '4px solid #7f1d1d',
                  boxSizing: 'border-box',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  direction: 'rtl',
                }}
              >
                <PreviewMiddleBackground middle={localSettings.middle} />
                <VitalsSidebar
                  vitalConfig={vitalConfig}
                  isDataOnlyMode={false}
                  vitalsSection={localSettings.vitalsSection}
                />
                <div className="flex-1 relative" style={{ zIndex: 1 }} />
              </div>
            )}

            {/* معاينة الوسط */}
            {activeTab === 'middle' && (
              <div
                style={{
                  width: '100%',
                  height: `${contentAreaHeightPx}px`,
                  minHeight: 200,
                  position: 'relative',
                  backgroundColor: middleBgColor,
                  overflow: 'hidden',
                  borderTop: '3px solid #cbd5e1',
                  borderBottom: '4px solid #7f1d1d',
                  boxSizing: 'border-box',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  direction: 'rtl',
                }}
              >
                <PreviewMiddleBackground middle={localSettings.middle} />
                <VitalsSidebar
                  vitalConfig={vitalConfig}
                  isDataOnlyMode={false}
                  vitalsSection={localSettings.vitalsSection}
                />
                <div
                  className="flex-1 p-1 flex flex-col overflow-y-auto"
                  style={{ zIndex: 1 }}
                >
                  {previewRxItems.length > 0 && (
                    <>
                      <div
                        className="text-xl font-serif font-black text-danger-900 italic mb-2 shrink-0 text-left"
                        dir="ltr"
                      >
                        Rx
                      </div>
                      <RxList
                        rxItems={previewRxItems}
                        medNameSize="text-[8.5px]"
                        medInstSize="text-[8.8px]"
                        leading="leading-[1.1]"
                        itemPad="py-1"
                        listGap="gap-0.5"
                        isDataOnlyMode={false}
                        isPrintMode={true}
                        onUpdateItemName={() => {}}
                        onUpdateItemInstruction={() => {}}
                        onMedicationClick={() => {}}
                        onRemoveItem={() => {}}
                        onSetAltModal={() => {}}
                        englishStyle={localSettings.middle?.englishStyle}
                        arabicStyle={localSettings.middle?.arabicStyle}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* معاينة إعدادات الطباعة: روشتة كاملة بكل أقسامها */}
            {activeTab === 'print' && (
              <PreviewPrintPanel
                localSettings={localSettings}
                paperHeightPx={paperHeightPx}
                paperMargins={paperMargins}
                printScale={printScale}
                printOffset={printOffset}
                middleBgColor={middleBgColor}
                printRxItems={printRxItems}
                vitalConfig={vitalConfig}
              />
            )}
          </div>
        </div>

        {/* تلميح ثبات المعاينة */}
        {!isStickyMode && (
          <div className="w-full text-center py-1 bg-warning-50 border-t border-warning-100 rounded-b-xl">
            <span className="text-[9px] text-warning-600 font-semibold">
              المعاينة ثابتة في هذا التبويب للحفاظ على وضوح المحتوى
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
