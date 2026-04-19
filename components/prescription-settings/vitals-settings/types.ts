/**
 * الملف: types.ts (Vitals)
 * الوصف: يحدد القواعد والتركيبات (Interfaces) الخاصة ببيانات العلامات الحيوية. 
 * هذا الملف يضمن توافق المكونات المختلفة داخل قسم Vitals 
 * ويسهل عملية تتبع الخصائص (Props) الممررة لكل جزء.
 */

import type { CustomBox, VitalSignConfig, VitalsSectionSettings } from '../../../types';

export interface VitalsSettingsTabProps {
  vitals: VitalSignConfig[];
  updateVital: (key: string, updates: Partial<VitalSignConfig>) => void;
  moveVital: (key: string, direction: 'up' | 'down') => void;
  vitalsSection?: VitalsSectionSettings;
  updateVitalsSection?: (updates: Partial<VitalsSectionSettings>) => void;
  customBoxes?: CustomBox[];
  addCustomBox?: () => void;
  updateCustomBox?: (id: string, updates: Partial<CustomBox>) => void;
  deleteCustomBox?: (id: string) => void;
  moveCustomBox?: (id: string, direction: 'up' | 'down') => void;
}

export interface VitalsListSectionProps {
  vitals: VitalSignConfig[];
  updateVital: (key: string, updates: Partial<VitalSignConfig>) => void;
  moveVital: (key: string, direction: 'up' | 'down') => void;
}

export interface CustomBoxesSectionProps {
  showCustomBoxes: boolean;
  onToggle: () => void;
  customBoxes: CustomBox[];
  addCustomBox?: () => void;
  updateCustomBox?: (id: string, updates: Partial<CustomBox>) => void;
  deleteCustomBox?: (id: string) => void;
  moveCustomBox?: (id: string, direction: 'up' | 'down') => void;
}

export interface VitalsSectionStylePanelProps {
  showStyleSection: boolean;
  onToggle: () => void;
  section: VitalsSectionSettings;
  updateSection: (updates: Partial<VitalsSectionSettings>) => void;
}

export interface VitalsSectionControlsProps {
  section: VitalsSectionSettings;
  updateSection: (updates: Partial<VitalsSectionSettings>) => void;
}

