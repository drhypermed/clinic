import React from 'react';
import { LABEL_CLASS } from '../utils';
import type { HeaderPatientInfoSectionProps } from '../../../types';

type HeaderPatientInfoDividersSectionProps = Pick<HeaderPatientInfoSectionProps, 'header' | 'updateHeader'>;

export const HeaderPatientInfoDividersSection: React.FC<HeaderPatientInfoDividersSectionProps> = ({
  header,
  updateHeader,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 p-3 bg-white">
      <label className={LABEL_CLASS}>الخطوط العمودية بين الخانات</label>
      <div className="space-y-4 mt-3">
        {/* التحكم في الخط العمودي الأول (بين الاسم والسن) */}
        <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={(header.showInfoBarDivider1 ?? header.showInfoBarDividers) !== false}
              onChange={(e) => updateHeader({ showInfoBarDivider1: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-sm font-bold text-slate-700">الخط بين الاسم والسن</span>
          </label>

          {(header.showInfoBarDivider1 ?? header.showInfoBarDividers) !== false && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">لون الخط</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={header.infoBarDivider1Color || header.infoBarDividerColor || '#f1f5f9'}
                      onChange={(e) => updateHeader({ infoBarDivider1Color: e.target.value })}
                      className="h-10 w-16 rounded cursor-pointer border border-slate-200 p-1"
                    />
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{header.infoBarDivider1Color || header.infoBarDividerColor || '#f1f5f9'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">سمك الخط: {header.infoBarDivider1Width ?? header.infoBarDividerWidth ?? 1}px</label>
                  <div className="slider-wrapper">
                    <div className="slider-track"></div>
                    <div className="slider-fill" style={{ width: `${((header.infoBarDivider1Width ?? header.infoBarDividerWidth ?? 1) / 8) * 100}%`, backgroundColor: '#64748b' }}></div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={header.infoBarDivider1Width ?? header.infoBarDividerWidth ?? 1}
                      onChange={(e) => updateHeader({ infoBarDivider1Width: parseInt(e.target.value, 10) })}
                      className="modern-slider slider-blue"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-slate-500 mb-1 block">شفافية الخط: {Math.round((header.infoBarDivider1Opacity ?? header.infoBarDividerOpacity ?? 1) * 100)}%</label>
                <div className="slider-wrapper">
                  <div className="slider-track"></div>
                  <div className="slider-fill" style={{ width: `${(header.infoBarDivider1Opacity ?? header.infoBarDividerOpacity ?? 1) * 100}%`, backgroundColor: header.infoBarDivider1Color || header.infoBarDividerColor || '#3b82f6' }}></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((header.infoBarDivider1Opacity ?? header.infoBarDividerOpacity ?? 1) * 100)}
                    onChange={(e) => updateHeader({ infoBarDivider1Opacity: parseInt(e.target.value, 10) / 100 })}
                    className="modern-slider slider-blue"
                  />
                </div>
              </div>

              {/* التحكم في موضع الخط بدقة بالبكسل */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">تحريك أفقي: {header.infoBarDivider1OffsetX ?? 0}px</label>
                  <div className="slider-wrapper">
                    <div className="slider-track"></div>
                    <div className="slider-fill" style={{ width: `${(((header.infoBarDivider1OffsetX ?? 0) + 40) / 80) * 100}%`, backgroundColor: '#0ea5e9' }}></div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={header.infoBarDivider1OffsetX ?? 0}
                      onChange={(e) => updateHeader({ infoBarDivider1OffsetX: parseInt(e.target.value, 10) })}
                      className="modern-slider slider-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">تحريك رأسي: {header.infoBarDivider1OffsetY ?? 0}px</label>
                  <div className="slider-wrapper">
                    <div className="slider-track"></div>
                    <div className="slider-fill" style={{ width: `${(((header.infoBarDivider1OffsetY ?? 0) + 20) / 40) * 100}%`, backgroundColor: '#0ea5e9' }}></div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={header.infoBarDivider1OffsetY ?? 0}
                      onChange={(e) => updateHeader({ infoBarDivider1OffsetY: parseInt(e.target.value, 10) })}
                      className="modern-slider slider-blue"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* التحكم في الخط العمودي الثاني (بين السن والتاريخ) */}
        <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={(header.showInfoBarDivider2 ?? header.showInfoBarDividers) !== false}
              onChange={(e) => updateHeader({ showInfoBarDivider2: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-sm font-bold text-slate-700">الخط بين السن والتاريخ</span>
          </label>

          {(header.showInfoBarDivider2 ?? header.showInfoBarDividers) !== false && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">لون الخط</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={header.infoBarDivider2Color || header.infoBarDividerColor || '#f1f5f9'}
                      onChange={(e) => updateHeader({ infoBarDivider2Color: e.target.value })}
                      className="h-10 w-16 rounded cursor-pointer border border-slate-200 p-1"
                    />
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{header.infoBarDivider2Color || header.infoBarDividerColor || '#f1f5f9'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">سمك الخط: {header.infoBarDivider2Width ?? header.infoBarDividerWidth ?? 1}px</label>
                  <div className="slider-wrapper">
                    <div className="slider-track"></div>
                    <div className="slider-fill" style={{ width: `${((header.infoBarDivider2Width ?? header.infoBarDividerWidth ?? 1) / 8) * 100}%`, backgroundColor: '#64748b' }}></div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={header.infoBarDivider2Width ?? header.infoBarDividerWidth ?? 1}
                      onChange={(e) => updateHeader({ infoBarDivider2Width: parseInt(e.target.value, 10) })}
                      className="modern-slider slider-blue"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-slate-500 mb-1 block">شفافية الخط: {Math.round((header.infoBarDivider2Opacity ?? header.infoBarDividerOpacity ?? 1) * 100)}%</label>
                <div className="slider-wrapper">
                  <div className="slider-track"></div>
                  <div className="slider-fill" style={{ width: `${(header.infoBarDivider2Opacity ?? header.infoBarDividerOpacity ?? 1) * 100}%`, backgroundColor: header.infoBarDivider2Color || header.infoBarDividerColor || '#3b82f6' }}></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((header.infoBarDivider2Opacity ?? header.infoBarDividerOpacity ?? 1) * 100)}
                    onChange={(e) => updateHeader({ infoBarDivider2Opacity: parseInt(e.target.value, 10) / 100 })}
                    className="modern-slider slider-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">تحريك أفقي: {header.infoBarDivider2OffsetX ?? 0}px</label>
                  <div className="slider-wrapper">
                    <div className="slider-track"></div>
                    <div className="slider-fill" style={{ width: `${(((header.infoBarDivider2OffsetX ?? 0) + 40) / 80) * 100}%`, backgroundColor: '#0ea5e9' }}></div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={header.infoBarDivider2OffsetX ?? 0}
                      onChange={(e) => updateHeader({ infoBarDivider2OffsetX: parseInt(e.target.value, 10) })}
                      className="modern-slider slider-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">تحريك رأسي: {header.infoBarDivider2OffsetY ?? 0}px</label>
                  <div className="slider-wrapper">
                    <div className="slider-track"></div>
                    <div className="slider-fill" style={{ width: `${(((header.infoBarDivider2OffsetY ?? 0) + 20) / 40) * 100}%`, backgroundColor: '#0ea5e9' }}></div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={header.infoBarDivider2OffsetY ?? 0}
                      onChange={(e) => updateHeader({ infoBarDivider2OffsetY: parseInt(e.target.value, 10) })}
                      className="modern-slider slider-blue"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
