import React from 'react';
import { formatUserDate } from '../../utils/cairoTime';
import type { PrescriptionHeaderSettings, TextStyle } from '../../types';
import { hexToRgba } from './shared/prescriptionStyleUtils';

interface InfoBarProps {
  patientName: string;
  setPatientName: (name: string) => void;
  ageString: string;
  headerFontSize: string;
  /** Override بالـ inline px من إعدادات المستخدم — يطغى على className لو مُمرَّر */
  headerInfoPx?: number;
  headerInfoColor?: string;
  headerInfoFontFamily?: string;
  isDataOnlyMode: boolean;
  isPrintMode: boolean;
  hasContent: boolean;
  date?: string | null;
  headerSettings?: PrescriptionHeaderSettings;
}

const applyAlphaToColor = (color: string, opacity: number): string => {
  if (!color) return `rgba(255, 255, 255, ${opacity})`;
  if (color.startsWith('#')) return hexToRgba(color, opacity);
  const rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map(p => p.trim());
    const r = Number(parts[0] || 0);
    const g = Number(parts[1] || 0);
    const b = Number(parts[2] || 0);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

const buildTextStyles = (
  textStyle: TextStyle | undefined,
  defaults: {
    color?: string;
    fontWeight?: string;
    fontFamily?: string;
    fontStyle?: string;
  } = {}
): React.CSSProperties => {
  const xOffset = textStyle?.xOffset || 0;
  const yOffset = textStyle?.yOffset || 0;
  const style: React.CSSProperties = {
    color: textStyle?.color || defaults.color,
    fontSize: textStyle?.fontSize,
    fontWeight: (textStyle?.fontWeight as any) || defaults.fontWeight,
    fontFamily: textStyle?.fontFamily || defaults.fontFamily,
    fontStyle: (textStyle?.fontStyle as any) || defaults.fontStyle as any,
    lineHeight: textStyle?.lineHeight,
    letterSpacing: textStyle?.letterSpacing !== undefined ? `${textStyle.letterSpacing}px` : undefined,
    transform: yOffset ? `translateY(${yOffset}px)` : undefined,
    marginInlineStart: xOffset ? `${xOffset}px` : undefined,
  };

  if (textStyle?.textStrokeWidth && textStyle.textStrokeWidth > 0) {
    const w = textStyle.textStrokeWidth;
    const c = textStyle.textStrokeColor || '#000';
    const shadows: string[] = [];
    const step = w < 1 ? 0.1 : (w < 2 ? 0.2 : 0.5);
    for (let r = step; r <= w; r += step) {
      const numAngles = Math.max(8, Math.ceil(r * 8));
      for (let i = 0; i < numAngles; i++) {
        const angle = (i / numAngles) * 2 * Math.PI;
        const x = (r * Math.cos(angle)).toFixed(1);
        const y = (r * Math.sin(angle)).toFixed(1);
        shadows.push(`${x}px ${y}px 0 ${c}`);
      }
    }
    (style as any).textShadow = shadows.join(',');
  }

  if (textStyle?.textBgOpacity && textStyle.textBgOpacity > 0) {
    const bgColor = textStyle.textBgColor || '#ffffff';
    style.backgroundColor = applyAlphaToColor(bgColor, textStyle.textBgOpacity);
    style.borderRadius = textStyle.textBgRadius ? `${textStyle.textBgRadius}px` : undefined;
    if (textStyle.textBgPaddingTop !== undefined || textStyle.textBgPaddingRight !== undefined ||
      textStyle.textBgPaddingBottom !== undefined || textStyle.textBgPaddingLeft !== undefined) {
      style.paddingTop = textStyle.textBgPaddingTop !== undefined ? `${textStyle.textBgPaddingTop}px` : undefined;
      style.paddingRight = textStyle.textBgPaddingRight !== undefined ? `${textStyle.textBgPaddingRight}px` : undefined;
      style.paddingBottom = textStyle.textBgPaddingBottom !== undefined ? `${textStyle.textBgPaddingBottom}px` : undefined;
      style.paddingLeft = textStyle.textBgPaddingLeft !== undefined ? `${textStyle.textBgPaddingLeft}px` : undefined;
    } else if (textStyle.textBgPadding) {
      style.padding = `${textStyle.textBgPadding}px`;
    }
    if (textStyle.textBgBorderWidth && textStyle.textBgBorderWidth > 0) {
      style.borderWidth = `${textStyle.textBgBorderWidth}px`;
      style.borderStyle = 'solid';
      style.borderColor = textStyle.textBgBorderColor || '#000000';
    }
    style.display = 'inline-block';
  }

  return style;
};

export const InfoBar: React.FC<InfoBarProps> = ({
  patientName,
  setPatientName,
  ageString,
  headerFontSize,
  headerInfoPx,
  headerInfoColor,
  headerInfoFontFamily,
  isDataOnlyMode,
  isPrintMode,
  hasContent,
  date,
  headerSettings
}) => {
  const headerInfoStyle = {
    ...(headerInfoPx ? { fontSize: `${headerInfoPx}px` } : {}),
    ...(headerInfoColor ? { color: headerInfoColor } : {}),
    ...(headerInfoFontFamily ? { fontFamily: headerInfoFontFamily } : {}),
  };
  const barRef = React.useRef<HTMLDivElement | null>(null);
  const [barWidth, setBarWidth] = React.useState(0);

  React.useEffect(() => {
    if (!barRef.current || typeof ResizeObserver === 'undefined') return;
    const el = barRef.current;
    const observer = new ResizeObserver(entries => {
      const width = entries?.[0]?.contentRect?.width || el.getBoundingClientRect().width || 0;
      setBarWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getNameFontSize = (name: string) => {
    if (name.length > 40) return 'text-[9px]';
    if (name.length > 30) return 'text-[10px]';
    if (name.length > 20) return 'text-[11.5px]';
    return headerFontSize;
  };

  const getAgeFontSizePx = (age: string): number => {
    const len = age.length;
    if (len > 40) return 5;
    if (len > 32) return 6;
    if (len > 26) return 7;
    if (len > 20) return 8;
    if (len > 15) return 9;
    if (len > 10) return 10;
    if (len > 6) return 11;
    return 13;
  };

  const displayDate = React.useMemo(() => {
    if (date) {
      const formatted = formatUserDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-GB');
      if (formatted) return formatted;
    }
    if (hasContent || patientName) return formatUserDate(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-GB');
    return '';
  }, [date, hasContent, patientName]);

  const nameLabel = headerSettings?.nameLabel || 'الاسم';
  const ageLabel = headerSettings?.ageLabel || 'السن';
  const dateLabel = headerSettings?.dateLabel || 'التاريخ';

  const infoBarBg = headerSettings?.infoBarBackgroundColor || '#ffffff';
  const infoBarBgOpacity = headerSettings?.infoBarBackgroundOpacity ?? 1;
  const infoBarLabelColor = headerSettings?.infoBarLabelColor || '#991b1b';
  const infoBarValueColor = headerSettings?.infoBarValueColor || '#0f172a';
  const showInfoBarBottomBorder = headerSettings?.showInfoBarBottomBorder ?? true;
  const infoBarBorderColor = headerSettings?.infoBarBorderColor || '#cbd5e1';
  const infoBarBorderOpacity = headerSettings?.infoBarBorderOpacity ?? 1;
  const infoBarBorderWidth = headerSettings?.infoBarBorderWidth ?? 3;

  const showInfoBarDividers = headerSettings?.showInfoBarDividers ?? true;
  const infoBarDividerColor = headerSettings?.infoBarDividerColor || '#f1f5f9';
  const infoBarDividerWidth = headerSettings?.infoBarDividerWidth ?? 1;
  const infoBarDividerOpacity = headerSettings?.infoBarDividerOpacity ?? 1;

  const showInfoBarDivider1 = headerSettings?.showInfoBarDivider1 ?? showInfoBarDividers;
  const infoBarDivider1Color = headerSettings?.infoBarDivider1Color || infoBarDividerColor;
  const infoBarDivider1Width = headerSettings?.infoBarDivider1Width ?? infoBarDividerWidth;
  const infoBarDivider1Opacity = headerSettings?.infoBarDivider1Opacity ?? infoBarDividerOpacity;
  const infoBarDivider1OffsetX = headerSettings?.infoBarDivider1OffsetX ?? 0;
  const infoBarDivider1OffsetY = headerSettings?.infoBarDivider1OffsetY ?? 0;

  const showInfoBarDivider2 = headerSettings?.showInfoBarDivider2 ?? showInfoBarDividers;
  const infoBarDivider2Color = headerSettings?.infoBarDivider2Color || infoBarDividerColor;
  const infoBarDivider2Width = headerSettings?.infoBarDivider2Width ?? infoBarDividerWidth;
  const infoBarDivider2Opacity = headerSettings?.infoBarDivider2Opacity ?? infoBarDividerOpacity;
  const infoBarDivider2OffsetX = headerSettings?.infoBarDivider2OffsetX ?? 0;
  const infoBarDivider2OffsetY = headerSettings?.infoBarDivider2OffsetY ?? 0;

  const backgroundColor = isDataOnlyMode ? 'transparent' : hexToRgba(infoBarBg, infoBarBgOpacity);
  const borderBottomColor = isDataOnlyMode ? 'transparent' : hexToRgba(infoBarBorderColor, infoBarBorderOpacity);
  const divider1Color = isDataOnlyMode ? 'transparent' : hexToRgba(infoBarDivider1Color, infoBarDivider1Opacity);
  const divider2Color = isDataOnlyMode ? 'transparent' : hexToRgba(infoBarDivider2Color, infoBarDivider2Opacity);

  const pxToPercent = (px: number) => (barWidth > 0 ? (px / barWidth) * 100 : 0);
  const minColumnPercent = 12;
  const rawDivider1Percent = 45 + pxToPercent(infoBarDivider1OffsetX);
  const divider1Percent = Math.min(100 - (minColumnPercent * 2), Math.max(minColumnPercent, rawDivider1Percent));
  const rawDivider2Percent = 70 + pxToPercent(infoBarDivider2OffsetX);
  const divider2Percent = Math.min(100 - minColumnPercent, Math.max(divider1Percent + minColumnPercent, rawDivider2Percent));
  
  const col1 = divider1Percent;
  const col2 = Math.max(minColumnPercent, divider2Percent - divider1Percent);
  const col3 = Math.max(minColumnPercent, 100 - divider2Percent);
  const isReadOnlyName = isPrintMode || isDataOnlyMode;
  const infoValueColorStyle = { color: infoBarValueColor };
  const labelClass = `font-black ${headerFontSize} shrink-0 whitespace-nowrap ml-2 ${isDataOnlyMode ? 'invisible' : ''}`;
  const labelStyleDefaults = { color: infoBarLabelColor, fontWeight: '900' as const, ...(headerInfoStyle || {}) };
  const renderDivider = (
    show: boolean,
    top: number,
    right: number,
    width: number,
    color: string
  ) => {
    if (!show || isDataOnlyMode) return null;
    return (
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          top: `${top}px`,
          right: `${right}%`,
          height: '100%',
          width: `${Math.max(0, width)}px`,
          backgroundColor: color,
        }}
      />
    );
  };

  return (
    <div
      ref={barRef}
      className="relative h-[42px] overflow-hidden grid grid-cols-[45%_25%_30%] items-center font-bold text-slate-800 shrink-0"
      style={{
        gridTemplateColumns: `${col1}% ${col2}% ${col3}%`,
        borderBottomStyle: 'solid',
        borderBottomWidth: showInfoBarBottomBorder ? `${Math.max(0, infoBarBorderWidth)}px` : '0px',
        borderBottomColor,
        backgroundColor,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
      dir="rtl"
    >
      {renderDivider(showInfoBarDivider1, infoBarDivider1OffsetY, divider1Percent, infoBarDivider1Width, divider1Color)}
      {renderDivider(showInfoBarDivider2, infoBarDivider2OffsetY, divider2Percent, infoBarDivider2Width, divider2Color)}

      <div className="flex items-center min-w-0 h-full px-2">
        <span
          className={labelClass}
          style={buildTextStyles(headerSettings?.nameLabelStyle, labelStyleDefaults)}
        >
          {nameLabel} :
        </span>
        <div className="flex-1 min-w-0 overflow-hidden">
          {isReadOnlyName ? (
            <div className={`font-bold ${getNameFontSize(patientName)} leading-tight whitespace-nowrap text-right truncate`} style={infoValueColorStyle}>
              {patientName}
            </div>
          ) : (
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className={`bg-transparent w-full font-bold ${getNameFontSize(patientName)} outline-none h-full text-right`}
              style={infoValueColorStyle}
              placeholder=""
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-start min-w-0 h-full px-2 overflow-hidden">
        <span
          className={labelClass}
          style={buildTextStyles(headerSettings?.ageLabelStyle, labelStyleDefaults)}
        >
          {ageLabel} :
        </span>
        <div className="font-bold text-right leading-tight min-w-0 flex-1 overflow-hidden whitespace-nowrap text-ellipsis" style={{ ...infoValueColorStyle, fontSize: `${getAgeFontSizePx(ageString)}px` }}>
          {ageString}
        </div>
      </div>

      <div className="flex items-center justify-start min-w-0 h-full px-2 overflow-hidden">
        <div className="flex items-center min-w-0">
          <span
            className={labelClass}
            style={buildTextStyles(headerSettings?.dateLabelStyle, labelStyleDefaults)}
          >
            {dateLabel} :
          </span>
          <div dir="ltr" className={`font-mono font-black ${headerFontSize} text-left whitespace-nowrap truncate min-w-0`} style={{ ...infoValueColorStyle, ...(headerInfoStyle || {}) }}>
            {displayDate}
          </div>
        </div>
      </div>
    </div>
  );
};
