import type React from 'react';
import type { TextStyle } from '../../../types';

type TextDefaults = {
  fontSize?: string;
  color?: string;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  lineHeight?: string;
};

export const buildTextStyles = (
  textStyle: TextStyle | undefined,
  defaults: TextDefaults = {}
): React.CSSProperties => {
  const style: React.CSSProperties = {
    fontSize: textStyle?.fontSize || defaults.fontSize,
    color: textStyle?.color || defaults.color,
    fontWeight: (textStyle?.fontWeight as any) || defaults.fontWeight,
    fontFamily: textStyle?.fontFamily || defaults.fontFamily,
    fontStyle: textStyle?.fontStyle || (defaults.fontStyle as any),
    lineHeight: textStyle?.lineHeight || defaults.lineHeight,
    letterSpacing: textStyle?.letterSpacing ? `${textStyle.letterSpacing}px` : undefined,
    transform: `translate(${textStyle?.xOffset || 0}px, ${textStyle?.yOffset || 0}px)`,
  };

  if (textStyle?.textStrokeWidth && textStyle.textStrokeWidth > 0) {
    const w = textStyle.textStrokeWidth;
    const c = textStyle.textStrokeColor || '#000';
    const shadows: string[] = [];
    const step = w < 1 ? 0.1 : w < 2 ? 0.2 : 0.5;
    for (let r = step; r <= w; r += step) {
      const numAngles = Math.max(8, Math.ceil(r * 8));
      for (let i = 0; i < numAngles; i++) {
        const angle = (i / numAngles) * 2 * Math.PI;
        const x = (r * Math.cos(angle)).toFixed(1);
        const y = (r * Math.sin(angle)).toFixed(1);
        shadows.push(`${x}px ${y}px 0 ${c}`);
      }
    }
    if (w > 0) {
      const numAngles = Math.max(8, Math.ceil(w * 8));
      for (let i = 0; i < numAngles; i++) {
        const angle = (i / numAngles) * 2 * Math.PI;
        const x = (w * Math.cos(angle)).toFixed(1);
        const y = (w * Math.sin(angle)).toFixed(1);
        shadows.push(`${x}px ${y}px 0 ${c}`);
      }
    }
    (style as any).textShadow = shadows.join(',');
  }

  if (textStyle?.textBgOpacity && textStyle.textBgOpacity > 0) {
    const bgColor = textStyle.textBgColor || '#ffffff';
    const opacity = textStyle.textBgOpacity;
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    style.borderRadius = textStyle.textBgRadius ? `${textStyle.textBgRadius}px` : undefined;

    if (
      textStyle.textBgPaddingTop !== undefined ||
      textStyle.textBgPaddingRight !== undefined ||
      textStyle.textBgPaddingBottom !== undefined ||
      textStyle.textBgPaddingLeft !== undefined
    ) {
      style.paddingTop =
        textStyle.textBgPaddingTop !== undefined ? `${textStyle.textBgPaddingTop}px` : undefined;
      style.paddingRight =
        textStyle.textBgPaddingRight !== undefined ? `${textStyle.textBgPaddingRight}px` : undefined;
      style.paddingBottom =
        textStyle.textBgPaddingBottom !== undefined
          ? `${textStyle.textBgPaddingBottom}px`
          : undefined;
      style.paddingLeft =
        textStyle.textBgPaddingLeft !== undefined ? `${textStyle.textBgPaddingLeft}px` : undefined;
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

const normalizeHexColor = (hex?: string): string => {
  const value = String(hex || '#000000').trim().replace('#', '');
  if (value.length === 3) {
    return `${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`;
  }
  if (value.length >= 6) {
    return value.slice(0, 6);
  }
  return value.padEnd(6, '0');
};

export const hexToRgba = (hex: string, opacity: number): string => {
  const full = normalizeHexColor(hex);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
