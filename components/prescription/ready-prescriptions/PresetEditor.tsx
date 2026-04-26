/**
 * PresetEditor — محرر الروشتة الجاهزة (إضافة/تعديل)
 *
 * يُغلّف JSX الخاص بواجهة تعديل القالب:
 *   - حقل اسم القالب.
 *   - محرر عناصر الروشتة (أدوية + ملاحظات) مع dropdown بحث الأدوية.
 *   - محرر التعليمات الهامة (إضافة/حذف سطور نصية).
 *   - محرر الفحوصات المطلوبة.
 *   - أزرار حفظ/إلغاء.
 *
 * مستخرج من `ReadyPrescriptionsModal.tsx` لتقليل حجمه. يعتمد على state
 * contentDraft + setters قادمة من المكون الرئيسي.
 */

import React from 'react';
import type { PrescriptionItem, ReadyPrescription, Medication } from '../../../types';
import { Button } from '../../ui/Button';
import { MedicationSearchDropdown } from '../../common/MedicationSearchDropdown';

interface PresetEditorProps {
    contentDraft: ReadyPrescription;
    isCreatingNew: boolean;
    savingContent: boolean;
    medSearchTerms: Record<string, string>;
    activeMedicationSearchId: string | null;
    searchMedications: (term: string, favorites?: string[]) => Medication[];
    setContentDraft: React.Dispatch<React.SetStateAction<ReadyPrescription | null>>;
    setMedSearchTerms: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setActiveMedicationSearchId: (id: string | null) => void;
    onClose: () => void;
    onSave: () => void | Promise<void>;
    updateDraftRxItem: (index: number, updater: (item: PrescriptionItem) => PrescriptionItem) => void;
    insertNoteAfterLastMedication: () => void;
    handleSelectMedicationForDraft: (index: number, med: Medication) => void;
}

const getPresetEditorTitle = (creatingNew: boolean): string =>
    creatingNew ? 'إضافة روشتة جديدة' : 'تعديل الروشتة الجاهزة';

const getDraftItemKey = (item: PrescriptionItem, index: number) => item.id || `idx-${index}`;

export const PresetEditor: React.FC<PresetEditorProps> = ({
    contentDraft,
    isCreatingNew,
    savingContent,
    medSearchTerms,
    activeMedicationSearchId,
    searchMedications,
    setContentDraft,
    setMedSearchTerms,
    setActiveMedicationSearchId,
    onClose,
    onSave,
    updateDraftRxItem,
    insertNoteAfterLastMedication,
    handleSelectMedicationForDraft,
}) => {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/40 to-white p-4 sm:p-5">
            <div className="space-y-4">
                {/* Header — أزرق متدرج صلب */}
                <div className="rounded-[1.75rem] border border-blue-700 bg-gradient-to-l from-blue-700 via-blue-600 to-blue-500 p-4 text-white shadow-[0_8px_22px_-6px_rgba(37,99,235,0.5)]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h4 className="text-base font-black text-white sm:text-lg">{getPresetEditorTitle(isCreatingNew)}</h4>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            size="sm"
                            className="border-white/30 bg-white/20 text-xs text-white shadow-none hover:bg-white/30 hover:text-white sm:text-sm"
                        >
                            رجوع
                        </Button>
                    </div>
                </div>

                {/* كرت اسم الروشتة */}
                <div className="relative overflow-hidden bg-white border border-blue-200 rounded-2xl p-3 sm:p-4 shadow-sm">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-l from-blue-700 to-blue-500"></div>
                    <label className="block text-xs font-black text-slate-700 mb-1">اسم الروشتة (التشخيص)</label>
                    <input
                        value={contentDraft.name}
                        onChange={(e) => setContentDraft(prev => prev ? ({ ...prev, name: e.target.value }) : prev)}
                        className="w-full p-3 border border-blue-200 rounded-2xl text-sm font-black bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                    />
                </div>

                {/* قسم تعديل الأدوية داخل القالب */}
                <div className="relative overflow-hidden space-y-2 bg-white border border-blue-200 rounded-2xl p-3 sm:p-4">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-l from-blue-700 to-blue-500"></div>
                    <h5 className="text-sm font-black text-blue-900">عناصر الروشتة (أدوية + ملاحظات)</h5>
                    {contentDraft.rxItems.map((item, index) => (
                        <div key={`${item.id || 'item'}-${index}`} className="border border-blue-200 rounded-2xl p-3 bg-white shadow-sm space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-black text-slate-700">{item.type === 'medication' ? 'دواء' : 'ملاحظة'} #{index + 1}</span>
                                <Button
                                    onClick={() => setContentDraft(prev => prev ? ({ ...prev, rxItems: prev.rxItems.filter((_, i) => i !== index) }) : prev)}
                                    variant="danger"
                                    size="sm"
                                    className="px-2 py-1 text-[11px] rounded-lg"
                                >
                                    حذف
                                </Button>
                            </div>
                            {item.type === 'medication' && (
                                <div
                                    className="relative"
                                    onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setActiveMedicationSearchId(null); }}
                                >
                                    <input
                                        value={medSearchTerms[getDraftItemKey(item, index)] ?? (item.medication?.name || '')}
                                        onFocus={() => setActiveMedicationSearchId(getDraftItemKey(item, index))}
                                        onChange={(e) => {
                                            const typed = e.target.value;
                                            setMedSearchTerms(prev => ({ ...prev, [getDraftItemKey(item, index)]: typed }));
                                            setActiveMedicationSearchId(getDraftItemKey(item, index));
                                            updateDraftRxItem(index, current => ({ ...current, medication: current.medication ? { ...current.medication, name: typed } : ({ id: `custom-${Date.now()}-${index}`, name: typed } as any) }));
                                        }}
                                        placeholder="اكتب الدواء بالإنجليزي"
                                        dir="ltr"
                                        className="w-full p-3.5 pl-10 pr-4 bg-white border border-blue-200 rounded-2xl font-bold text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm transition-all placeholder-slate-400 text-left"
                                    />
                                    <svg className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    {activeMedicationSearchId === getDraftItemKey(item, index) && (medSearchTerms[getDraftItemKey(item, index)] || '').trim().length > 0 && (
                                        <div onMouseDown={(e) => e.preventDefault()}>
                                            <MedicationSearchDropdown
                                                medications={searchMedications(medSearchTerms[getDraftItemKey(item, index)] || '', []).slice(0, 8)}
                                                onSelect={(med) => handleSelectMedicationForDraft(index, med)}
                                                searchTerm={medSearchTerms[getDraftItemKey(item, index)] || ''}
                                                variant="simple"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            <textarea
                                value={item.instructions || ''}
                                onChange={(e) => updateDraftRxItem(index, current => ({ ...current, instructions: e.target.value }))}
                                placeholder={item.type === 'note' ? 'نص الملاحظة' : 'الجرعة + التعليمات'}
                                rows={2}
                                className="w-full p-2.5 border border-blue-200 rounded-xl text-sm font-cairo text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button
                            onClick={() => setContentDraft(prev => prev ? ({ ...prev, rxItems: [...prev.rxItems, { id: `manual-med-${Date.now()}`, type: 'medication', instructions: '', } as PrescriptionItem] }) : prev)}
                            variant="primary"
                            size="sm"
                            className="text-xs"
                        >
                            إضافة دواء
                        </Button>
                        <Button
                            onClick={insertNoteAfterLastMedication}
                            variant="primary"
                            size="sm"
                            className="w-full text-xs"
                        >
                            إضافة ملاحظة (منتصف الروشتة)
                        </Button>
                    </div>
                </div>

                {/* قسم التعليمات العامة في القالب */}
                <div className="relative overflow-hidden space-y-2 bg-white border border-blue-200 rounded-2xl p-3 sm:p-4">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-l from-blue-700 to-blue-500"></div>
                    <h5 className="text-sm font-black text-blue-900">التعليمات الهامة</h5>
                    {contentDraft.generalAdvice.map((advice, index) => (
                        <div key={`advice-${index}`} className="flex items-center gap-2">
                            <input
                                value={advice}
                                onChange={(e) => setContentDraft(prev => { if (!prev) return prev; const next = [...prev.generalAdvice]; next[index] = e.target.value; return { ...prev, generalAdvice: next }; })}
                                className="flex-1 p-2.5 border border-blue-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <Button
                                onClick={() => setContentDraft(prev => prev ? ({ ...prev, generalAdvice: prev.generalAdvice.filter((_, i) => i !== index) }) : prev)}
                                variant="danger"
                                size="sm"
                                className="px-2 py-1 text-[11px] rounded-lg"
                            >
                                حذف
                            </Button>
                        </div>
                    ))}
                    <Button
                        onClick={() => setContentDraft(prev => prev ? ({ ...prev, generalAdvice: [...prev.generalAdvice, ''] }) : prev)}
                        variant="primary"
                        size="sm"
                        className="text-xs"
                    >
                        إضافة تعليمات
                    </Button>
                </div>

                {/* قسم الفحوصات في القالب */}
                <div className="relative overflow-hidden space-y-2 bg-white border border-blue-200 rounded-2xl p-3 sm:p-4">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-l from-blue-700 to-blue-500"></div>
                    <h5 className="text-sm font-black text-blue-900">الفحوصات المطلوبة</h5>
                    {contentDraft.labInvestigations.map((lab, index) => (
                        <div key={`lab-${index}`} className="flex items-center gap-2">
                            <input
                                value={lab}
                                onChange={(e) => setContentDraft(prev => { if (!prev) return prev; const next = [...prev.labInvestigations]; next[index] = e.target.value; return { ...prev, labInvestigations: next }; })}
                                className="flex-1 p-2.5 border border-blue-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <Button
                                onClick={() => setContentDraft(prev => prev ? ({ ...prev, labInvestigations: prev.labInvestigations.filter((_, i) => i !== index) }) : prev)}
                                variant="danger"
                                size="sm"
                                className="px-2 py-1 text-[11px] rounded-lg"
                            >
                                حذف
                            </Button>
                        </div>
                    ))}
                    <Button
                        onClick={() => setContentDraft(prev => prev ? ({ ...prev, labInvestigations: [...prev.labInvestigations, ''] }) : prev)}
                        variant="primary"
                        size="sm"
                        className="text-xs"
                    >
                        إضافة فحص
                    </Button>
                </div>

                {/* أزرار الـfooter — حفظ أخضر CTA (primary=green) + إلغاء أحمر */}
                <div className="mt-2 flex items-center justify-end gap-2 border-t border-blue-100 pt-4">
                    <Button onClick={onClose} disabled={savingContent} variant="danger" size="sm" className="text-sm">إلغاء</Button>
                    <Button onClick={onSave} disabled={savingContent} variant="primary" size="sm" className="text-sm">
                        {savingContent ? 'جاري الحفظ' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
