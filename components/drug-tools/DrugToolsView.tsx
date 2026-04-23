/**
 * عرض أدوات الأدوية الذكية (Drug Tools View):
 * المكون الرئيسي الذي يجمع ويحمي الوصول إلى أدوات الصيدلة الإكلينيكية (التفاعلات، جرعات الكلى، الأمان في الحمل).
 * يتضمن منطق فحص "الكوتة" (Quota) ونوع الحساب (مجاني/مميز) لضمان استدامة موارد النظام.
 */
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoadingStateScreen } from '../app/LoadingStateScreen';
import { useTabSync } from '../../hooks/useTabSync';

import { useAuth } from '../../hooks/useAuth';
import { consumeDrugToolQuota, getAccountTypeControls } from '../../services/accountTypeControlsService';
import { isQuotaLimitExceededError } from '../../services/account-type-controls/quotaErrors';
import { usageTrackingService } from '../../services/usageTrackingService';
import { resolveEffectiveAccountTypeFromData } from '../../utils/accountStatusTime';
import { getTrustedNowMs, syncTrustedTime } from '../../utils/trustedTime';
import { ToolCard } from './ToolCard';
import { TOOL_TONES } from './toolTones';
import { getDocCacheFirst } from '../../services/firestore/cacheFirst';
import { getUserProfileDocRef } from '../../services/firestore/profileRoles';
const DrugInteractions = React.lazy(() =>
  import('./DrugInteractions').then((mod) => ({ default: mod.DrugInteractions }))
);
const RenalDoseAdjustment = React.lazy(() =>
  import('./RenalDoseAdjustment').then((mod) => ({ default: mod.RenalDoseAdjustment }))
);
const PregnancySafety = React.lazy(() =>
  import('./PregnancySafety').then((mod) => ({ default: mod.PregnancySafety }))
);

interface DrugToolsViewProps {
  onClose: () => void;
  onOpenMedicationEdit: () => void;
}

type DrugToolKey = 'interactions' | 'renal' | 'pregnancy';
type ViewTool = DrugToolKey | null;

export const DrugToolsView: React.FC<DrugToolsViewProps> = ({ onClose, onOpenMedicationEdit }) => {
  // الأداة النشطة (متزامنة مع URL ?tool=...)
  const [searchParams] = useSearchParams();
  const [activeTool, setActiveTool] = useState<ViewTool>(
    () => {
      const urlTool = searchParams.get('tool');
      const valid: DrugToolKey[] = ['interactions', 'renal', 'pregnancy'];
      return urlTool && valid.includes(urlTool as DrugToolKey) ? urlTool as DrugToolKey : null;
    },
  );
  // وسيط لتحويل null <-> '' للمزامنة مع الـ URL
  const toolAsString = activeTool ?? '';
  const setToolAsString = (val: string) => setActiveTool(val === '' ? null : val as DrugToolKey);
  const { setTabWithUrl: setToolWithUrl } = useTabSync<string>(
    'tool', toolAsString, setToolAsString, '',
    ['', 'interactions', 'renal', 'pregnancy'] as const,
  );
  const [accountType, setAccountType] = useState<'free' | 'premium' | 'pro_max'>('free');
  const [accountTypeResolved, setAccountTypeResolved] = useState(false);
  const [lockedNotice, setLockedNotice] = useState<{ title: string; message: string } | null>(null);
  const [accessControls, setAccessControls] = useState({
    interactionToolPremiumOnly: true,
    renalToolPremiumOnly: true,
    pregnancyToolPremiumOnly: true,
    freeInteractionToolDailyLimit: 5000,
    premiumInteractionToolDailyLimit: 5000,
    freeRenalToolDailyLimit: 5000,
    premiumRenalToolDailyLimit: 5000,
    freePregnancyToolDailyLimit: 5000,
    premiumPregnancyToolDailyLimit: 5000,
    interactionToolLockedMessage: 'هذه الأداة متاحة لحساب برو فقط.',
    renalToolLockedMessage: 'هذه الأداة متاحة لحساب برو فقط.',
    pregnancyToolLockedMessage: 'هذه الأداة متاحة لحساب برو فقط.',
    premiumTagLabel: 'Pro',
    whatsappNumber: '',
  });
  const { user } = useAuth();
  const userId = user?.uid;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const controls = await getAccountTypeControls();
        if (!mounted) return;
        setAccessControls({
          interactionToolPremiumOnly: !!controls.interactionToolPremiumOnly,
          renalToolPremiumOnly: !!controls.renalToolPremiumOnly,
          pregnancyToolPremiumOnly: !!controls.pregnancyToolPremiumOnly,
          freeInteractionToolDailyLimit: Number(controls.freeInteractionToolDailyLimit || 0),
          premiumInteractionToolDailyLimit: Number(controls.premiumInteractionToolDailyLimit || 0),
          freeRenalToolDailyLimit: Number(controls.freeRenalToolDailyLimit || 0),
          premiumRenalToolDailyLimit: Number(controls.premiumRenalToolDailyLimit || 0),
          freePregnancyToolDailyLimit: Number(controls.freePregnancyToolDailyLimit || 0),
          premiumPregnancyToolDailyLimit: Number(controls.premiumPregnancyToolDailyLimit || 0),
          interactionToolLockedMessage:
            String(controls.interactionToolLockedMessage || '').trim() || 'هذه الأداة متاحة لحساب برو فقط.',
          renalToolLockedMessage:
            String(controls.renalToolLockedMessage || '').trim() || 'هذه الأداة متاحة لحساب برو فقط.',
          pregnancyToolLockedMessage:
            String(controls.pregnancyToolLockedMessage || '').trim() || 'هذه الأداة متاحة لحساب برو فقط.',
          premiumTagLabel: String(controls.premiumTagLabel || '').trim() || 'Pro',
          whatsappNumber: String(controls.whatsappNumber || '').replace(/\D/g, ''),
        });
      } catch (error) {
        console.error('Failed to load drug tools access controls:', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setAccountType('free');
      setAccountTypeResolved(true);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        // كاش أولاً للاستجابه الفوريه — البيانات محمّله بالفعل من جلسة الدخول.
        // الأمان مضمون لأن Cloud Function (consumeDrugToolQuota) تتحقق من السيرفر عند كل استخدام فعلي.
        // قراءه واحده — كانت قبل كده 2 reads بسبب alias قديم لنفس الـdoc.
        const userSnap = await getDocCacheFirst(getUserProfileDocRef(userId));
        const data = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
        await syncTrustedTime();
        const resolvedType = resolveEffectiveAccountTypeFromData(data, getTrustedNowMs());
        if (mounted) {
          setAccountType(resolvedType);
          setAccountTypeResolved(true);
        }
      } catch (error) {
        console.error('Failed to resolve account type for drug tools:', error);
        if (mounted) {
          setAccountType('free');
          setAccountTypeResolved(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // برو وبرو ماكس الاتنين "Pro" لأغراض فتح الأدوات (اللي كانت premiumOnly)
  const isPro = accountType === 'premium' || accountType === 'pro_max';
  const toolRules = useMemo(
    () => ({
      interactions: {
        premiumOnly: accessControls.interactionToolPremiumOnly,
        message: accessControls.interactionToolLockedMessage,
        title: 'التفاعلات الدوائية',
      },
      renal: {
        premiumOnly: accessControls.renalToolPremiumOnly,
        message: accessControls.renalToolLockedMessage,
        title: 'جرعات الكلى',
      },
      pregnancy: {
        premiumOnly: accessControls.pregnancyToolPremiumOnly,
        message: accessControls.pregnancyToolLockedMessage,
        title: 'الأمان في الحمل والرضاعة',
      },
    }),
    [accessControls]
  );

  const canOpenTool = async (tool: DrugToolKey): Promise<boolean> => {
    const rule = toolRules[tool];
    if (rule.premiumOnly && !isPro) {
      setLockedNotice({
        title: rule.title,
        message: rule.message || 'هذه الأداة متاحة لحساب برو فقط.',
      });
      return false;
    }

    const feature = tool === 'interactions' ? 'interactionTool' : tool === 'renal' ? 'renalTool' : 'pregnancyTool';
    const configuredLimit =
      tool === 'interactions'
        ? isPro
          ? accessControls.premiumInteractionToolDailyLimit
          : accessControls.freeInteractionToolDailyLimit
        : tool === 'renal'
          ? isPro
            ? accessControls.premiumRenalToolDailyLimit
            : accessControls.freeRenalToolDailyLimit
          : isPro
            ? accessControls.premiumPregnancyToolDailyLimit
            : accessControls.freePregnancyToolDailyLimit;

    // حساب برو + حد يومي عالي (≥500) = فتح فوري وتتبع الكوتا في الخلفية
    // بدل ما ننتظر الـCloud Function (1-3 ثانيه) — السيرفر لسه بيتحقق عند كل استخدام فعلي
    if (isPro && configuredLimit >= 500) {
      void consumeDrugToolQuota(feature).catch(() => {});
      return true;
    }

    try {
      await consumeDrugToolQuota(feature);
      return true;
    } catch (error: unknown) {
      const isLimitError = isQuotaLimitExceededError(error);
      if (!isLimitError) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const fallbackErrorMessage = errorMessage.trim();
        console.warn('[DrugToolsView] Quota check failed; denying tool access:', {
          tool,
          isPro,
          error,
        });

        setLockedNotice({
          title: rule.title,
          message: fallbackErrorMessage || 'تعذر التحقق من الحد اليومي الآن. حاول مرة أخرى.',
        });
        return false;
      }

      // error هنا quota error من Cloud Function، بيجي معاه details و code
      const errorObj = error as { details?: Record<string, unknown>; code?: unknown };
      const details = (errorObj?.details || {}) as Record<string, unknown>;
      const code = String(errorObj?.code || '').toLowerCase();
      const limit = Number(details.limit || configuredLimit || 0);
      const rawMessage = String(details.limitReachedMessage || '').trim();
      const replaced = rawMessage.includes('{limit}') ? rawMessage.replace(/\{limit\}/g, String(limit)) : rawMessage;
      setLockedNotice({
        title: rule.title,
        message:
          replaced ||
          (code.includes('resource-exhausted')
            ? `تم استهلاك الحد اليومي لهذه الأداة (${limit}) لهذا الحساب.`
            : 'تعذر التحقق من الحد اليومي الآن. حاول مرة أخرى.'),
      });
      return false;
    }
  };

  const handleToolClick = (toolName: 'interactionChecker' | 'drugSearch' | 'contraIndications') => {
    if (userId) {
      usageTrackingService
        .trackEvent({
          doctorId: userId,
          eventType: toolName,
          metadata: {
            tool: toolName,
          },
        })
        .catch((err) => console.error('Failed to track tool event:', err));
    }
  };

  const whatsappDigits = String(accessControls.whatsappNumber || '').replace(/\D/g, '');
  const premiumWhatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '';
  const premiumOnlyLine = 'هذه الميزة للحسابات بروة فقط';

  const activeToolTitle =
    activeTool === 'interactions'
      ? 'التفاعلات الدوائية'
      : activeTool === 'renal'
        ? 'جرعات الكلى'
        : activeTool === 'pregnancy'
          ? 'الأمان في الحمل والرضاعة'
          : 'أدوات الأدوية الذكية';

  return (
    <div data-no-reveal className="px-2 py-2 sm:px-4 sm:py-3 space-y-2" dir="rtl">
      {!activeTool ? (
        <>
          {lockedNotice && (
            <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 shadow-[0_8px_20px_-8px_rgba(245,158,11,0.5)]">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-black text-white">{lockedNotice.title}</h4>
                <span className="rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-black text-white">
                  {accessControls.premiumTagLabel || 'Pro'}
                </span>
              </div>
              <p className="text-xs font-bold text-white/90">{premiumOnlyLine}</p>
              {String(lockedNotice.message || '').trim() && String(lockedNotice.message || '').trim() !== premiumOnlyLine && (
                <p className="mt-1 text-[11px] font-bold text-white/80 leading-relaxed">{lockedNotice.message}</p>
              )}
              {premiumWhatsappUrl && (
                <a
                  href={premiumWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-[11px] font-black text-white transition-colors hover:bg-white/30"
                >
                  تواصل واتساب للاشتراك
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 dh-stagger-1">
            <ToolCard
              title="التفاعلات الدوائية"
              description="فحص التداخلات بين الأدوية مع تقييم المخاطر"
              icon={<span className="text-lg">💊</span>}
              tone={TOOL_TONES.interactions}
              badgeLabel={accountTypeResolved && toolRules.interactions.premiumOnly && !isPro ? accessControls.premiumTagLabel || 'Pro' : undefined}
              onClick={async () => {
                setLockedNotice(null);
                if (await canOpenTool('interactions')) {
                  handleToolClick('interactionChecker');
                  setToolWithUrl('interactions');
                }
              }}
            />

            <ToolCard
              title="جرعات الكلى"
              description="تعديل الجرعات بناءً على وظائف الكلى"
              icon={<span className="text-lg">🧪</span>}
              tone={TOOL_TONES.renal}
              badgeLabel={accountTypeResolved && toolRules.renal.premiumOnly && !isPro ? accessControls.premiumTagLabel || 'Pro' : undefined}
              onClick={async () => {
                setLockedNotice(null);
                if (await canOpenTool('renal')) {
                  handleToolClick('drugSearch');
                  setToolWithUrl('renal');
                }
              }}
            />

            <ToolCard
              title="الأمان في الحمل والرضاعة"
              description="تصنيفات السلامة مع توجيهات عملية"
              icon={<span className="text-lg">🤰</span>}
              tone={TOOL_TONES.pregnancy}
              badgeLabel={accountTypeResolved && toolRules.pregnancy.premiumOnly && !isPro ? accessControls.premiumTagLabel || 'Pro' : undefined}
              onClick={async () => {
                setLockedNotice(null);
                if (await canOpenTool('pregnancy')) {
                  handleToolClick('contraIndications');
                  setToolWithUrl('pregnancy');
                }
              }}
            />

            <ToolCard
              title="تعديل معلومات الأدوية"
              description="إضافة وتحديث بيانات الأدوية"
              icon={<span className="text-lg">⚙️</span>}
              tone={TOOL_TONES.edit}
              onClick={onOpenMedicationEdit}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 dh-stagger-1">
            <h2 className="text-sm font-black text-slate-800 truncate">{activeToolTitle}</h2>
            <button
              onClick={() => setToolWithUrl('')}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-[11px] font-black text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              رجوع للأدوات
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 dh-stagger-2">
            <Suspense fallback={<LoadingStateScreen message="جاري تحميل الأداة" />}>
              {activeTool === 'interactions' && <DrugInteractions />}
              {activeTool === 'renal' && <RenalDoseAdjustment />}
              {activeTool === 'pregnancy' && <PregnancySafety />}
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
};
