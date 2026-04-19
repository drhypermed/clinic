import React from 'react';
import type { VitalsSectionSettings } from '../../types';
import { hexToRgba } from './shared/prescriptionStyleUtils';

const getBMICategory = (bmi: string): string => {
  const bmiValue = parseFloat(bmi);
  if (isNaN(bmiValue) || bmiValue === 0) return '';
  if (bmiValue < 18.5) return 'نحافة';
  if (bmiValue < 25) return 'وزن طبيعي';
  if (bmiValue < 30) return 'وزن زائد';
  return 'سمنة';
};

const applyTextStyle = (style?: any): React.CSSProperties => {
  if (!style) return {};
  const baseStyle: React.CSSProperties = {
    color: style.color,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    letterSpacing: style.letterSpacing,
    transform: `translate(${style.xOffset || 0}px, ${style.yOffset || 0}px)`,
    textShadow: style.textStrokeWidth && style.textStrokeColor
      ? `-${style.textStrokeWidth}px -${style.textStrokeWidth}px 0 ${style.textStrokeColor}, ${style.textStrokeWidth}px -${style.textStrokeWidth}px 0 ${style.textStrokeColor}, -${style.textStrokeWidth}px ${style.textStrokeWidth}px 0 ${style.textStrokeColor}, ${style.textStrokeWidth}px ${style.textStrokeWidth}px 0 ${style.textStrokeColor}`
      : undefined,
  };

  if (style?.textBgOpacity && style.textBgOpacity > 0) {
    const bgColor = style.textBgColor || '#ffffff';
    const opacity = style.textBgOpacity;
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    baseStyle.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    baseStyle.borderRadius = style.textBgRadius ? `${style.textBgRadius}px` : undefined;

    if (style.textBgPaddingTop !== undefined || style.textBgPaddingRight !== undefined ||
      style.textBgPaddingBottom !== undefined || style.textBgPaddingLeft !== undefined) {
      baseStyle.paddingTop = style.textBgPaddingTop !== undefined ? `${style.textBgPaddingTop}px` : undefined;
      baseStyle.paddingRight = style.textBgPaddingRight !== undefined ? `${style.textBgPaddingRight}px` : undefined;
      baseStyle.paddingBottom = style.textBgPaddingBottom !== undefined ? `${style.textBgPaddingBottom}px` : undefined;
      baseStyle.paddingLeft = style.textBgPaddingLeft !== undefined ? `${style.textBgPaddingLeft}px` : undefined;
    } else if (style.textBgPadding) {
      baseStyle.padding = `${style.textBgPadding}px`;
    }

    if (style.textBgBorderWidth && style.textBgBorderWidth > 0) {
      baseStyle.borderWidth = `${style.textBgBorderWidth}px`;
      baseStyle.borderStyle = 'solid';
      baseStyle.borderColor = style.textBgBorderColor || '#000000';
    }

    baseStyle.display = 'inline-block';
  }

  return baseStyle;
};

interface VitalsSidebarProps {
  vitalConfig: { key?: string; label: string; value: string; unit: string; isCustom?: boolean; customBoxId?: string; order?: number }[];
  isDataOnlyMode: boolean;
  vitalsSection?: VitalsSectionSettings;
  forceFullWidth?: boolean;
  onCustomBoxValueChange?: (boxId: string, value: string) => void;
}

const DEFAULT_LABEL_STYLE = { color: '#b91c1c', fontWeight: 'bold' };
const DEFAULT_VALUE_STYLE = { color: '#0f172a', fontWeight: '900' };
const DEFAULT_BMI_STYLE = { color: '#475569', fontWeight: 'bold' };

const withOpacityColorStyle = (color: string, opacity: number, property: 'backgroundColor' | 'borderColor') => (
  opacity < 1 ? { [property]: hexToRgba(color, opacity) } : { [property]: color }
);

const buildTitleUnderline = (section: VitalsSectionSettings) => {
  const underlineColor = section.titleUnderlineColor || '#dc2626';
  const underlineWidth = section.titleUnderlineWidth || 1;
  const underlineOpacity = section.titleUnderlineOpacity ?? 1;
  if (underlineOpacity === 0) return 'none';
  if (underlineOpacity < 1) return `${underlineWidth}px solid ${hexToRgba(underlineColor, underlineOpacity)}`;
  return `${underlineWidth}px solid ${underlineColor}`;
};

export const VitalsSidebar: React.FC<VitalsSidebarProps> = ({
  vitalConfig,
  isDataOnlyMode,
  vitalsSection,
  forceFullWidth = false,
  onCustomBoxValueChange
}) => {
  if (vitalConfig.length === 0) {
    return null;
  }

  const section = vitalsSection || {};
  const title = section.title || 'القياسات والعلامات الحيوية';

  const sectionBgColor = section.backgroundColor || '#f1f5f9';
  const sectionBgOpacity = section.backgroundColorOpacity ?? 1;
  const sectionBgStyle = withOpacityColorStyle(sectionBgColor, sectionBgOpacity, 'backgroundColor');

  const borderColor = section.borderColor || '#cbd5e1';
  const borderOpacity = section.borderOpacity ?? 1;
  const borderStyle = withOpacityColorStyle(borderColor, borderOpacity, 'borderColor');

  const itemBgColor = section.itemBackgroundColor || '#ffffff';
  const itemBgOpacity = section.itemBackgroundColorOpacity ?? 1;
  const itemBgStyle = withOpacityColorStyle(itemBgColor, itemBgOpacity, 'backgroundColor');

  const itemBorderColor = section.itemBorderColor || '#cbd5e1';
  const itemBorderOpacity = section.itemBorderColorOpacity ?? 1;
  const itemBorderStyle = withOpacityColorStyle(itemBorderColor, itemBorderOpacity, 'borderColor');

  const sectionWidth = forceFullWidth ? '100%' : '22%';
  const itemWidthPercent = section.width !== undefined ? section.width : 100;
  const itemWidthStyle = { width: `${itemWidthPercent}%` };

  const itemsOffsetX = section.itemsOffsetX || 0;
  const itemsOffsetY = section.itemsOffsetY || 0;
  const itemsContainerStyle = (itemsOffsetX !== 0 || itemsOffsetY !== 0)
    ? { transform: `translate(${-itemsOffsetX}px, ${itemsOffsetY}px)` }
    : {};
  const valueStyle = section.valueStyle || DEFAULT_VALUE_STYLE;
  const labelStyle = section.labelStyle || DEFAULT_LABEL_STYLE;
  const bmiStyle = section.valueStyle || DEFAULT_BMI_STYLE;

  return (
    <div
      className={`${forceFullWidth ? 'w-full' : ''} p-1 flex flex-col gap-1 shrink-0 pt-2 border-l-[3px] ${isDataOnlyMode ? 'border-transparent bg-transparent' : ''}`}
      style={isDataOnlyMode ? {
        width: forceFullWidth ? '100%' : sectionWidth
      } : {
        ...sectionBgStyle,
        ...borderStyle,
        width: forceFullWidth ? '100%' : sectionWidth
      }}
    >
      <div className="text-center pb-0.5 mb-0.5 border-b border-transparent h-[18px]">
        <span
          className={`font-black text-[8px] pb-0.5 block whitespace-nowrap overflow-hidden ${isDataOnlyMode ? 'invisible' : ''}`}
          style={isDataOnlyMode ? {} : {
            ...applyTextStyle(section.titleStyle),
            borderBottom: buildTitleUnderline(section),
          }}
        >
          {title}
        </span>
      </div>

      <div style={itemsContainerStyle}>
        {vitalConfig.map((item, idx) => {
          const isBMI = (item.key === 'bmi' || item.label === 'BMI') && !item.isCustom;
          const bmiCategory = isBMI && item.value ? getBMICategory(item.value) : '';

          if (itemBgOpacity === 0) return null;

          return (
            <div
              key={item.isCustom ? `custom-${idx}` : idx}
              className={`text-center rounded p-0.5 min-h-[44px] flex flex-col justify-start pt-1 border-[2px] ${isDataOnlyMode ? 'border-transparent bg-transparent' : 'shadow-sm'}`}
              style={isDataOnlyMode ? {} : {
                ...itemBgStyle,
                ...itemBorderStyle,
                ...itemWidthStyle
              }}
            >
              <span
                className={`block text-[8px] leading-tight ${isDataOnlyMode ? 'invisible' : ''}`}
                style={isDataOnlyMode ? {} : applyTextStyle(labelStyle)}
              >
                {item.label}
              </span>
              <div className="flex items-baseline justify-center gap-0.5 mt-1 flex-wrap" dir="ltr">
                {item.isCustom && item.customBoxId && onCustomBoxValueChange ? (
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) => onCustomBoxValueChange(item.customBoxId!, e.target.value)}
                    className="text-[12px] leading-tight text-center bg-transparent border-none outline-none w-full px-1"
                    style={applyTextStyle(valueStyle)}
                    placeholder="..."
                  />
                ) : item.value ? (
                  <>
                    <span
                      className="text-[12px] leading-tight"
                      style={applyTextStyle(valueStyle)}
                    >
                      {item.value}
                    </span>
                    {!isBMI && item.unit && (
                      <span
                        className="text-[8px]"
                        style={applyTextStyle(section.unitStyle || valueStyle)}
                      >
                        {item.unit}
                      </span>
                    )}
                    {isBMI && bmiCategory && (
                      <span
                        className="text-[8px] font-bold"
                        style={applyTextStyle(bmiStyle)}
                      >
                        ({bmiCategory})
                      </span>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
