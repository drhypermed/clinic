/**
 * الملف: usePrescriptionSettingsForm.ts
 * الوصد: هذا "الخُطّاف" (Hook) هو العقل المدبر لصفحة إعدادات الروشتة. 
 * يقوم بإدارة الحالة المحلية (Local State) لجميع عناصر الروشتة (علوية، سفلية، جانبية، وسطى)، 
 * ويتعامل مع مزامنة البيانات مع قاعدة البيانات، وعمليات إعادة الضبط (Reset)، 
 * بالإضافة إلى منطق التحكم في النصوص الغنية وتطبيق التنسيقات (Presets).
 */

import { useState, useEffect, useRef } from 'react';
import {
    PrescriptionSettings,
    PrescriptionHeaderSettings,
    PrescriptionFooterSettings,
    PrescriptionMiddleSettings,
    PaperSizeSettings,
    VitalSignConfig,
    VitalsSectionSettings,
    TextStyle,
    CustomBox
} from '../../types';
import { getDefaultSettings } from '../../services/prescriptionSettingsService';

interface UsePrescriptionSettingsFormOptions {
    settings: PrescriptionSettings;
    onSave: (settings: PrescriptionSettings) => Promise<void>;
}

const normalizeSettingsForForm = (value: PrescriptionSettings): PrescriptionSettings => ({
    ...value,
    customBoxes: Array.isArray(value.customBoxes) ? value.customBoxes : []
});

export function usePrescriptionSettingsForm({ settings, onSave }: UsePrescriptionSettingsFormOptions) {
    // --- الحالة المحلية (Local State) ---
    const [localSettings, setLocalSettings] = useState<PrescriptionSettings>(normalizeSettingsForForm(settings)); // الإعدادات الجاري تعديلها حالياً
    const [saving, setSaving] = useState(false); // حالة الحفظ (تحميل)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null); // التنبيهات (تم الحفظ، خطأ، إلخ)
    const [openSection, setOpenSection] = useState<string>(''); // القسم المفتوح حالياً في الأكورديون (Accordion)
    
    // حالات التحكم في الصور المراد قصها (Cropping)
    const [logoToCrop, setLogoToCrop] = useState<string | null>(null);
    const [headerBgToCrop, setHeaderBgToCrop] = useState<string | null>(null);
    const [footerBgToCrop, setFooterBgToCrop] = useState<string | null>(null);
    const [footerLogoToCrop, setFooterLogoToCrop] = useState<string | null>(null);
    const [middleBgToCrop, setMiddleBgToCrop] = useState<string | null>(null);

    const editorRefs = useRef<Record<string, HTMLDivElement | null>>({}); // مراجع لمحررات النصوص الغنية
    const defaultSettings = getDefaultSettings(); // الإعدادات الافتراضية للنظام

    // حماية التعديلات غير المحفوظة:
    // نحفظ snapshot للإعدادات اللي اتمت مزامنتها آخر مرة (سواء من السيرفر أو بعد حفظ ناجح).
    // بنقارنها بالـ localSettings الحالية لنحدد لو المستخدم عنده تعديلات غير محفوظة.
    const lastSyncedSettingsRef = useRef<PrescriptionSettings>(normalizeSettingsForForm(settings));

    // تحديث الحالة المحلية عند تغيير الإعدادات الخارجية (مثلاً عند تبديل الفرع).
    // لو المستخدم عنده تعديلات غير محفوظة، بنسأله أولاً قبل ما نمسحها.
    useEffect(() => {
        const lastSynced = lastSyncedSettingsRef.current;
        const userHasEdits = JSON.stringify(localSettings) !== JSON.stringify(lastSynced);

        if (userHasEdits) {
            const confirmed = window.confirm(
                'عندك تعديلات في إعدادات الروشتة لم يتم حفظها.\n\n' +
                'لو عايز تكمل تحميل الإعدادات الجديدة (من الفرع التاني مثلاً) اضغط "موافق".\n\n' +
                'لو عايز ترجع وتحفظ تعديلاتك الأول اضغط "إلغاء".'
            );
            if (!confirmed) {
                // احتفظ بالتعديلات المحلية، لا تُطبق الإعدادات الجديدة
                return;
            }
        }

        // طبّق الإعدادات الجديدة
        const normalized = normalizeSettingsForForm(settings);
        setLocalSettings(normalized);
        lastSyncedSettingsRef.current = normalized;
    }, [settings]);

    // تحذير المتصفح عند إغلاق الصفحة أو عمل refresh مع وجود تعديلات غير محفوظة
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const lastSynced = lastSyncedSettingsRef.current;
            const userHasEdits = JSON.stringify(localSettings) !== JSON.stringify(lastSynced);
            if (userHasEdits) {
                e.preventDefault();
                e.returnValue = ''; // المتصفح هيعرض تحذير افتراضي
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [localSettings]);

    /** إظهار تنبيه مؤقت للمستخدم */
    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    /** دالة حفظ الإعدادات في قاعدة البيانات */
    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(localSettings);
            // بعد الحفظ الناجح، علّم الـ localSettings كـ "آخر نسخة متزامنة"
            // عشان الـ dirty check يرجع false ومفيش تحذير كاذب بعد كده
            lastSyncedSettingsRef.current = localSettings;
            showNotification('success', 'تم حفظ الإعدادات بنجاح ✓');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'حدث خطأ غير معروف أثناء الحفظ';
            showNotification('error', `فشل الحفظ: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    /** 
     * استعادة الإعدادات الافتراضية
     * تسمح هذه الدالة بالرجوع للحالة الأصلية للنظام، إما لتبويب محدد أو للروشتة كاملة
     */
    const handleReset = async (tabId?: 'header' | 'footer' | 'vitals' | 'middle' | 'print') => {
        const defaults = getDefaultSettings();
        
        if (tabId) {
            // إعادة القسم المحدد فقط إلى حالته الأصلية
            switch (tabId) {
                case 'header':
                    setLocalSettings(prev => ({ ...prev, header: defaults.header }));
                    showNotification('success', 'تم إعادة تصميم الهيدر للافتراضي');
                    break;
                case 'footer':
                    setLocalSettings(prev => ({ ...prev, footer: defaults.footer }));
                    showNotification('success', 'تم إعادة تصميم الفوتر للافتراضي');
                    break;
                case 'vitals':
                    setLocalSettings(prev => ({ 
                        ...prev, 
                        vitals: defaults.vitals,
                        vitalsSection: defaults.vitalsSection,
                        customBoxes: Array.isArray(defaults.customBoxes) ? defaults.customBoxes : []
                    }));
                    showNotification('success', 'تم إعادة القياسات والعلامات الحيوية للافتراضي');
                    break;
                case 'middle':
                    setLocalSettings(prev => ({ ...prev, middle: defaults.middle }));
                    showNotification('success', 'تم إعادة تصميم الوسط للافتراضي');
                    break;
                case 'print':
                    setLocalSettings(prev => ({
                        ...prev,
                        paperSize: {
                            size: 'A5',
                            marginTop: 0,
                            marginRight: 0,
                            marginBottom: 0,
                            marginLeft: 0,
                        },
                        typography: {
                            medNamePx: 13, medInstPx: 12, notesPx: 12, notePx: 15,
                            clinicalInfoPx: 8.5, rxSymbolPx: 20,
                            rowMinHeightPx: 18, drugRowPaddingPx: 2,
                            drugBorderWidthPx: 1, drugBorderColor: '#f1f5f9',
                            sectionTitleColor: '#7f1d1d',
                        }
                    }));
                    showNotification('success', 'تم إعادة إعدادات الطباعة للافتراضي');
                    break;
            }
        } else {
            // إعادة كل الإعدادات وحفظها فوراً
            const normalizedDefaults = normalizeSettingsForForm(defaults);
            setLocalSettings(normalizedDefaults);
            try {
                setSaving(true);
                await onSave(normalizedDefaults);
                showNotification('success', 'تم إعادة كل الإعدادات للافتراضي وحفظها');
            } catch {
                showNotification('error', 'فشل حفظ الإعدادات الافتراضية');
            } finally {
                setSaving(false);
            }
        }
    };

    const updateHeader = (updates: Partial<PrescriptionHeaderSettings>) => {
        setLocalSettings(prev => ({ ...prev, header: { ...prev.header, ...updates } }));
    };

    const updateFooter = (updates: Partial<PrescriptionFooterSettings>) => {
        setLocalSettings(prev => ({ ...prev, footer: { ...prev.footer, ...updates } }));
    };

    const updateMiddle = (updates: Partial<PrescriptionMiddleSettings>) => {
        setLocalSettings(prev => ({
            ...prev,
            middle: { ...(prev.middle || {}), ...updates }
        }));
    };

    const updatePaperSize = (updates: Partial<PaperSizeSettings>) => {
        setLocalSettings(prev => ({
            ...prev,
            paperSize: {
                size: 'A5',
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0,
                ...(prev.paperSize || {}),
                ...updates,
            }
        }));
    };

    const updateTypography = (updates: Partial<NonNullable<PrescriptionSettings['typography']>>) => {
        setLocalSettings(prev => ({
            ...prev,
            typography: {
                medNamePx: 13,
                medInstPx: 12,
                notesPx: 12,
                notePx: 15,
                clinicalInfoPx: 8.5,
                rxSymbolPx: 20,
                rowMinHeightPx: 18,
                drugRowPaddingPx: 2,
                drugBorderWidthPx: 1,
                drugBorderColor: '#f1f5f9',
                sectionTitleColor: '#7f1d1d',
                ...(prev.typography || {}),
                ...updates,
            }
        }));
    };

    const updateVital = (key: string, updates: Partial<VitalSignConfig>) => {
        setLocalSettings(prev => ({
            ...prev,
            vitals: prev.vitals.map(v => (v.key === key ? { ...v, ...updates } : v))
        }));
    };

    const moveVital = (key: string, direction: 'up' | 'down') => {
        setLocalSettings(prev => {
            const sorted = [...prev.vitals].sort((a, b) => a.order - b.order);
            const idx = sorted.findIndex(v => v.key === key);
            if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sorted.length - 1)) return prev;
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            const newOrder = sorted[swapIdx].order;
            sorted[swapIdx].order = sorted[idx].order;
            sorted[idx].order = newOrder;
            return { ...prev, vitals: sorted };
        });
    };

    const updateVitalsSection = (updates: Partial<VitalsSectionSettings>) => {
        setLocalSettings(prev => ({
            ...prev,
            vitalsSection: { ...(prev.vitalsSection || {}), ...updates }
        }));
    };

    const addCustomBox = () => {
        setLocalSettings(prev => {
            const existingBoxes = prev.customBoxes || [];
            const maxOrder = existingBoxes.length > 0
                ? Math.max(...existingBoxes.map(b => b.order))
                : -1;
            const newBox: CustomBox = {
                id: `custom-${Date.now()}`,
                label: 'مربع جديد',
                value: '',
                enabled: true,
                order: maxOrder + 1
            };
            return {
                ...prev,
                customBoxes: [...existingBoxes, newBox]
            };
        });
    };

    const updateCustomBox = (id: string, updates: Partial<CustomBox>) => {
        setLocalSettings(prev => ({
            ...prev,
            customBoxes: (prev.customBoxes || []).map(box =>
                box.id === id ? { ...box, ...updates } : box
            )
        }));
    };

    const deleteCustomBox = (id: string) => {
        setLocalSettings(prev => ({
            ...prev,
            customBoxes: (prev.customBoxes || []).filter(box => box.id !== id)
        }));
    };

    const moveCustomBox = (id: string, direction: 'up' | 'down') => {
        setLocalSettings(prev => {
            const boxes = [...(prev.customBoxes || [])].sort((a, b) => a.order - b.order);
            const idx = boxes.findIndex(b => b.id === id);
            if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === boxes.length - 1)) return prev;
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            const newOrder = boxes[swapIdx].order;
            boxes[swapIdx].order = boxes[idx].order;
            boxes[idx].order = newOrder;
            return { ...prev, customBoxes: boxes };
        });
    };



    type StyleUpdater = (s: TextStyle) => void;

    /**
     * معالجة تغيير الأنماط (Style Change)
     * تقوم بتحديث الإعدادات (للمعاينة) وتطبيق التنسيق على النص المظلل في المحرر إن وجد.
     */
    const handleStyleChange = (
        newStyle: TextStyle,
        key: string,
        currentBaseStyle: TextStyle | undefined,
        settingUpdater: StyleUpdater
    ) => {
        // تحديث الإعدادات لتعكس التغييرات في المعاينة اللحظية
        settingUpdater(newStyle);

        // تطبيق التنسيق على النص المظلل داخل محرر النصوص الغنية (Rich Text Editor)
        const editor = editorRefs.current[key];
        const sel = window.getSelection();
        if (editor && sel?.rangeCount && !sel.isCollapsed && sel.anchorNode && editor.contains(sel.anchorNode)) {
            if (newStyle.fontWeight !== currentBaseStyle?.fontWeight) document.execCommand('bold');
            if (newStyle.fontStyle !== currentBaseStyle?.fontStyle) document.execCommand('italic');
            if (newStyle.color !== currentBaseStyle?.color) document.execCommand('foreColor', false, newStyle.color ?? '');
            if (newStyle.fontFamily !== currentBaseStyle?.fontFamily) document.execCommand('fontName', false, newStyle.fontFamily ?? '');
            if (newStyle.fontSize !== currentBaseStyle?.fontSize) {
                const px = newStyle.fontSize?.replace('px', '');
                if (px) {
                    // استخدام حيلة لتغيير حجم الخط بدقة بكسل
                    document.execCommand('fontSize', false, '7');
                    const fonts = editor.getElementsByTagName('font');
                    Array.from(fonts).forEach(font => {
                        if (font.getAttribute('size') === '7') {
                            font.removeAttribute('size');
                            font.style.fontSize = `${px}px`;
                        }
                    });
                }
            }
        }
    };

    /** تطبيق تنسيق جاهز (Preset) على النص */
    const handlePreset = (styleString: string, key: string) => {
        const editor = editorRefs.current[key];
        const sel = window.getSelection();
        if (!editor) return;
        const inside = sel?.anchorNode && editor.contains(sel.anchorNode);
        const hasRange = !!inside && !sel?.isCollapsed;
        if (hasRange && sel) {
            // تطبيق على الجزء المظلل فقط
            const text = sel.toString();
            document.execCommand('insertHTML', false, `<span style="${styleString}">${text}</span>`);
        } else {
            // تطبيق على كل النص إذا لم يكن هناك تظليل
            sel?.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(editor);
            sel?.addRange(range);
            const text = editor.innerText;
            document.execCommand('insertHTML', false, `<span style="${styleString}">${text}</span>`);
            sel?.removeAllRanges();
        }
    };

    return {
        localSettings,
        setLocalSettings,
        saving,
        notification,
        showNotification,
        handleSave,
        handleReset,
        updateHeader,
        updateFooter,
        updateVital,
        moveVital,
        handleStyleChange,
        handlePreset,
        openSection,
        setOpenSection,
        logoToCrop,
        setLogoToCrop,
        headerBgToCrop,
        setHeaderBgToCrop,
        footerBgToCrop,
        setFooterBgToCrop,
        footerLogoToCrop,
        setFooterLogoToCrop,
        middleBgToCrop,
        setMiddleBgToCrop,
        updateMiddle,
        updatePaperSize,
        updateTypography,
        updateVitalsSection,
        addCustomBox,
        updateCustomBox,
        deleteCustomBox,
        moveCustomBox,

        editorRefs,
        defaultSettings
    };
}

