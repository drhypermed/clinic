/**
 * تعريفات الأنواع للفوتر (Footer Types Definitions)
 * يحدد الواجهات البرمجية (Interfaces) وخصائص المكونات (Props) المستخدمة في إعدادات تذييل الروشتة.
 */

import type { RefObject } from 'react';
import type { PrescriptionFooterSettings, TextStyle } from '../../../types';

export interface FooterSettingsTabProps {
  footer: PrescriptionFooterSettings;
  updateFooter: (u: Partial<PrescriptionFooterSettings>) => void;
  openSection: string;
  setOpenSection: (s: string) => void;
  showNotification: (type: 'success' | 'error', msg: string) => void;
  handleStyleChange: (style: TextStyle, key: string, base: TextStyle | undefined, upd: (s: TextStyle) => void) => void;
  handlePreset: (style: string, key: string) => void;
  editorRefs: RefObject<Record<string, HTMLDivElement | null>>;
  setFooterBgToCrop: (v: string | null) => void;
  setFooterLogoToCrop: (v: string | null) => void;
}

export interface FooterSectionSharedProps {
  footer: PrescriptionFooterSettings;
  updateFooter: (u: Partial<PrescriptionFooterSettings>) => void;
  openSection: string;
  toggle: (id: string) => void;
  showNotification: (type: 'success' | 'error', msg: string) => void;
  handleStyleChange: (style: TextStyle, key: string, base: TextStyle | undefined, upd: (s: TextStyle) => void) => void;
  handlePreset: (style: string, key: string) => void;
  editorRefs: RefObject<Record<string, HTMLDivElement | null>>;
}

export interface FooterBackgroundSectionProps extends FooterSectionSharedProps {
  setFooterBgToCrop: (v: string | null) => void;
}

export interface FooterLogoSectionProps extends FooterSectionSharedProps {
  setFooterLogoToCrop: (v: string | null) => void;
}

