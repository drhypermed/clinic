/**
 * SpecialtyPacksPanel — لوحه تحكم الأدمن في حزم التخصصات
 *
 * لكل باكدج مفتاح تبديل بسيط (تفعيل/تعطيل):
 *   - مفعّل → كل طبيب تخصصه يطابق هياخد الباكدج تلقائياً.
 *   - معطّل → الباكدج هيختفي عن كل الأطباء (kill switch مركزي).
 *
 * بعد الحفظ بنبطل الكاش المحلي عشان الجلسات الموجوده تقرا الجديد فوراً.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    FaBoxesStacked, FaFloppyDisk, FaCircleCheck,
    FaCircleXmark, FaTriangleExclamation,
} from 'react-icons/fa6';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { LoadingText } from '../../ui/LoadingText';
import {
    ALL_PACK_IDS, DEFAULT_SPECIALTY_PACKS,
    getSpecialtyPacks, PACK_DESCRIPTIONS, PACK_DISPLAY_NAMES,
    PACK_SPECIALTIES, updateSpecialtyPacks,
    type SpecialtyPackId, type SpecialtyPacksConfig,
} from '../../../services/specialty-packs';

// ─ نص الخطأ المفهوم — للأدمن مش للطبيب ─
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return String(err || 'خطأ غير معروف');
};

export const SpecialtyPacksPanel: React.FC = () => {
    const { user } = useAuth();
    const canManage = useIsAdmin(user);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<SpecialtyPacksConfig>(DEFAULT_SPECIALTY_PACKS);
    const [isDirty, setIsDirty] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const [loadError, setLoadError] = useState('');
    const didLoadRef = useRef(false);

    // ─ التحميل الأولي للإعدادات ─
    useEffect(() => {
        let mounted = true;
        const run = async () => {
            if (!canManage) {
                if (mounted) setLoading(false);
                return;
            }
            setLoading(true);
            setLoadError('');
            try {
                const data = await getSpecialtyPacks();
                if (!mounted) return;
                setConfig(data);
                didLoadRef.current = true;
                setIsDirty(false);
            } catch (err) {
                if (!mounted) return;
                const msg = getErrorMessage(err);
                setLoadError(msg);
                setMessage(`فشل تحميل إعدادات الحزم: ${msg}`);
                setMessageType('error');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        run();
        return () => {
            mounted = false;
        };
    }, [canManage]);

    // ─ تحذير عند الخروج بتعديلات غير محفوظه ─
    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    // ─ تبديل حاله باكدج واحد ─
    const togglePack = useCallback((packId: SpecialtyPackId) => {
        setConfig((prev) => ({
            packs: {
                ...prev.packs,
                [packId]: { enabled: !prev.packs[packId]?.enabled },
            },
        }));
        setIsDirty(true);
    }, []);

    // ─ الحفظ ─
    const handleSave = useCallback(async () => {
        if (!canManage) {
            setMessage('غير مصرح لك بتعديل حزم التخصصات.');
            setMessageType('error');
            return;
        }
        if (loadError || !didLoadRef.current) {
            setMessage('لا يمكن الحفظ قبل تحميل الإعدادات الحاليه بنجاح.');
            setMessageType('error');
            return;
        }
        setSaving(true);
        setMessage('');
        setMessageType(null);
        try {
            const saved = await updateSpecialtyPacks(config);
            setConfig(saved);
            setIsDirty(false);
            setMessage('تم حفظ إعدادات حزم التخصصات بنجاح.');
            setMessageType('success');
            setTimeout(() => {
                setMessage('');
                setMessageType(null);
            }, 4000);
        } catch (err) {
            setMessage(`فشل الحفظ: ${getErrorMessage(err)}`);
            setMessageType('error');
        } finally {
            setSaving(false);
        }
    }, [canManage, loadError, config]);

    if (loading) {
        return <LoadingStateScreen message="جاري تحميل حزم التخصصات" />;
    }

    if (!canManage) {
        return (
            <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-bold text-danger-700">
                غير مصرح لك بالوصول إلى حزم التخصصات.
            </div>
        );
    }

    const saveDisabled = saving || !!loadError || !didLoadRef.current || !isDirty;

    return (
        <div className="space-y-4 sm:space-y-5 pb-24">
            {/* ─ ترويسه الصفحه ─ */}
            <div className="flex items-center gap-2 min-w-0">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-1.5 sm:p-2 shrink-0 shadow-sm">
                    <FaBoxesStacked className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight">
                        حزم التخصصات
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                        كل حزمه بتتفعّل تلقائياً للأطباء اللي تخصصهم مطابق.
                        المفتاح هنا قفل/فتح مركزي لكل الأطباء دول.
                    </p>
                </div>
            </div>

            {/* ─ بانر فشل التحميل ─ */}
            {loadError && (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-danger-200 bg-danger-50 p-4">
                    <FaTriangleExclamation className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-danger-800">فشل تحميل الإعدادات</p>
                        <p className="mt-1 text-[11px] font-bold text-danger-600/80">{loadError}</p>
                        <p className="mt-2 text-[11px] font-bold text-danger-700">
                            الحفظ معطل لحمايه الإعدادات. حدث الصفحه بعد رجوع الاتصال.
                        </p>
                    </div>
                </div>
            )}

            {/* ─ شاره التعديلات غير المحفوظه ─ */}
            {isDirty && !loadError && (
                <div className="flex items-center gap-2 rounded-xl border-2 border-warning-200 bg-warning-50 px-3 py-2">
                    <FaTriangleExclamation className="w-3.5 h-3.5 text-warning-600 shrink-0" />
                    <p className="text-[11px] font-black text-warning-700">
                        عندك تعديلات لسه مش محفوظه — اضغط "حفظ" قبل ما تخرج.
                    </p>
                </div>
            )}

            {/* ─ كروت الحزم ─ */}
            <fieldset disabled={!!loadError} className="space-y-3 disabled:opacity-60">
                {ALL_PACK_IDS.map((packId) => {
                    const entry = config.packs[packId];
                    const enabled = Boolean(entry?.enabled);
                    const specialties = PACK_SPECIALTIES[packId];

                    return (
                        <div
                            key={packId}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4 min-w-0"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm sm:text-base font-black text-slate-800 mb-1">
                                        {PACK_DISPLAY_NAMES[packId]}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        {PACK_DESCRIPTIONS[packId]}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={enabled}
                                        onChange={() => togglePack(packId)}
                                    />
                                    <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-brand-500 peer-checked:to-brand-600 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
                                </label>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mb-1.5">
                                    التخصصات اللي ها تاخد الحزمه:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {specialties.map((s) => (
                                        <span
                                            key={s}
                                            className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-brand-700"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </fieldset>

            {/* ─ شريط الحفظ السفلي ─ */}
            <div className="sticky bottom-2 z-20 mt-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.15)] px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3 min-w-0">
                {message ? (
                    <div
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold min-w-0 max-w-full ${
                            messageType === 'success'
                                ? 'border-success-200 bg-success-50 text-success-700'
                                : 'border-danger-200 bg-danger-50 text-danger-700'
                        }`}
                    >
                        {messageType === 'success' ? (
                            <FaCircleCheck className="w-3 h-3 shrink-0" />
                        ) : (
                            <FaCircleXmark className="w-3 h-3 shrink-0" />
                        )}
                        <span className="min-w-0 break-words">{message}</span>
                    </div>
                ) : isDirty ? (
                    <p className="text-[11px] font-black text-warning-600">تعديلات غير محفوظه</p>
                ) : (
                    <p className="text-[11px] font-bold text-slate-400">كل التعديلات محفوظه</p>
                )}

                <button
                    onClick={handleSave}
                    disabled={saveDisabled}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-success-600 to-brand-600 px-4 sm:px-5 py-2.5 text-[13px] sm:text-sm font-black text-white shadow-sm transition hover:from-success-700 hover:to-brand-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-success-600 disabled:hover:to-brand-600 shrink-0"
                >
                    {saving ? (
                        <LoadingText>جاري الحفظ</LoadingText>
                    ) : (
                        <>
                            <FaFloppyDisk className="w-3.5 h-3.5 shrink-0" />
                            حفظ
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
