import React from 'react';
import { LABEL_CLASS } from '../utils';
import type { HeaderPatientInfoSectionProps } from '../../../types';

type HeaderPatientInfoAppearanceSectionProps = Pick<HeaderPatientInfoSectionProps, 'header' | 'updateHeader'>;

export const HeaderPatientInfoAppearanceSection: React.FC<HeaderPatientInfoAppearanceSectionProps> = ({
  header,
  updateHeader,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* لون خلفية شريط المعلومات بالكامل */}
        <div>
          <label className={LABEL_CLASS}>لون خلفية شريط البيانات</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={header.infoBarBackgroundColor || '#ffffff'}
              onChange={(e) => updateHeader({ infoBarBackgroundColor: e.target.value })}
              className="h-10 w-16 rounded cursor-pointer border border-slate-200 p-1"
            />
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{header.infoBarBackgroundColor || '#ffffff'}</span>
          </div>
          {/* محرك الشفافية لخلفية الشريط */}
          <div className="mt-3">
            <label className="text-xs font-bold text-slate-500 mb-1 block">شفافية الخلفية: {Math.round((header.infoBarBackgroundOpacity ?? 1) * 100)}%</label>
            <div className="slider-wrapper">
              <div className="slider-track"></div>
              <div className="slider-fill" style={{ width: `${(header.infoBarBackgroundOpacity ?? 1) * 100}%`, backgroundColor: header.infoBarBackgroundColor || '#3b82f6' }}></div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round((header.infoBarBackgroundOpacity ?? 1) * 100)}
                onChange={(e) => updateHeader({ infoBarBackgroundOpacity: parseInt(e.target.value, 10) / 100 })}
                className="modern-slider slider-blue"
              />
            </div>
          </div>
        </div>

        {/* ألوان الخطوط المستخدمة في الشريط */}
        <div>
          <label className={LABEL_CLASS}>لون نص العناوين (الاسم/السن/التاريخ)</label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="color"
              value={header.infoBarLabelColor || '#991b1b'}
              onChange={(e) => updateHeader({ infoBarLabelColor: e.target.value })}
              className="h-10 w-16 rounded cursor-pointer border border-slate-200 p-1"
            />
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{header.infoBarLabelColor || '#991b1b'}</span>
          </div>

          <label className={LABEL_CLASS}>لون نص القيم</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={header.infoBarValueColor || '#0f172a'}
              onChange={(e) => updateHeader({ infoBarValueColor: e.target.value })}
              className="h-10 w-16 rounded cursor-pointer border border-slate-200 p-1"
            />
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{header.infoBarValueColor || '#0f172a'}</span>
          </div>
        </div>
      </div>

      {/* التحكم في الخط السفلي الفاصل لشريط البيانات */}
      <div className="rounded-xl border border-slate-200 p-3 bg-white">
        <label className={LABEL_CLASS}>الخط السفلي لشريط البيانات</label>
        <label className="flex items-center gap-2 my-3">
          <input
            type="checkbox"
            checked={header.showInfoBarBottomBorder !== false}
            onChange={(e) => updateHeader({ showInfoBarBottomBorder: e.target.checked })}
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <span className="text-sm font-bold text-slate-700">إظهار الخط السفلي</span>
        </label>

        {header.showInfoBarBottomBorder !== false && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* اختيار لون الخط السفلي */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">لون الخط</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={header.infoBarBorderColor || '#cbd5e1'}
                    onChange={(e) => updateHeader({ infoBarBorderColor: e.target.value })}
                    className="h-10 w-16 rounded cursor-pointer border border-slate-200 p-1"
                  />
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{header.infoBarBorderColor || '#cbd5e1'}</span>
                </div>
              </div>

              {/* اختيار سُمك الخط السفلي (بكسل) */}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">سمك الخط: {header.infoBarBorderWidth || 3}px</label>
                <div className="slider-wrapper">
                  <div className="slider-track"></div>
                  <div className="slider-fill" style={{ width: `${((header.infoBarBorderWidth || 3) / 8) * 100}%`, backgroundColor: '#64748b' }}></div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={header.infoBarBorderWidth || 3}
                    onChange={(e) => updateHeader({ infoBarBorderWidth: parseInt(e.target.value, 10) })}
                    className="modern-slider slider-blue"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-500 mb-1 block">شفافية الخط: {Math.round((header.infoBarBorderOpacity ?? 1) * 100)}%</label>
              <div className="slider-wrapper">
                <div className="slider-track"></div>
                <div className="slider-fill" style={{ width: `${(header.infoBarBorderOpacity ?? 1) * 100}%`, backgroundColor: header.infoBarBorderColor || '#3b82f6' }}></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((header.infoBarBorderOpacity ?? 1) * 100)}
                  onChange={(e) => updateHeader({ infoBarBorderOpacity: parseInt(e.target.value, 10) / 100 })}
                  className="modern-slider slider-blue"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
