/**
 * تعريفات الأنواع للهيدر (Header Types Definitions)
 * يحدد الواجهات البرمجية (Interfaces) وخصائص المكونات (Props) المستخدمة في إعدادات رأس الروشتة.
 */

import type { RefObject } from 'react';
import type { PrescriptionHeaderSettings, TextStyle } from '../../../types';

export interface HeaderSettingsTabProps {
  header: PrescriptionHeaderSettings;
  defaultHeader: PrescriptionHeaderSettings;
  updateHeader: (u: Partial<PrescriptionHeaderSettings>) => void;
  openSection: string;
  setOpenSection: (s: string) => void;
  showNotification: (type: 'success' | 'error', msg: string) => void;
  handleStyleChange: (style: TextStyle, key: string, base: TextStyle | undefined, upd: (s: TextStyle) => void) => void;
  handlePreset: (style: string, key: string) => void;
  editorRefs: RefObject<Record<string, HTMLDivElement | null>>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  setLogoToCrop: (v: string | null) => void;
  setHeaderBgToCrop: (v: string | null) => void;
}

export interface HeaderSectionSharedProps {
  header: PrescriptionHeaderSettings;
  defaultHeader: PrescriptionHeaderSettings;
  updateHeader: (u: Partial<PrescriptionHeaderSettings>) => void;
  openSection: string;
  toggle: (id: string) => void;
  showNotification: (type: 'success' | 'error', msg: string) => void;
  handleStyleChange: (style: TextStyle, key: string, base: TextStyle | undefined, upd: (s: TextStyle) => void) => void;
  handlePreset: (style: string, key: string) => void;
  editorRefs: RefObject<Record<string, HTMLDivElement | null>>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  setLogoToCrop: (v: string | null) => void;
  setHeaderBgToCrop: (v: string | null) => void;
}

export interface HeaderPatientInfoSectionProps extends HeaderSectionSharedProps {
  defaultInfoLabelStyle: TextStyle;
  applyInfoLabelPreset: (
    field: 'nameLabelStyle' | 'ageLabelStyle' | 'dateLabelStyle',
    base: TextStyle,
    presetStyle: string
  ) => void;
}

