/**
 * عرض أدوات الأدوية الذكية (Drug Tools View):
 * بقى فيه أداة واحدة بس: جرعات الكلى — مع اختصار لتعديل معلومات الأدوية.
 *
 * ملاحظة (2026-04): فحص التداخلات الدوائية وفحص الحمل/الرضاعة اتنقلوا لشاشة
 * "كشف جديد" (تحت الروشتة مباشرة) كأزرار ذهبية بريميوم مع كاش per-user.
 * الملفات القديمة (DrugInteractions.tsx + PregnancySafety.tsx) اتحذفت.
 * access controls الخاصة بيهم في Firestore فضلت للتوافق الخلفي لكن مش مستخدمة.
 */
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoadingStateScreen } from '../app/LoadingStateScreen';
import { useTabSync } from '../../hooks/useTabSync';

import { useAuth } from '../../hooks/useAuth';
import { consumeDrugToolQuota, getAccountTypeControls } from '../../services/accountTypeControlsService';
import {
  getQuotaVerificationFailureMessage,
  isQuotaLimitExceededError,
  retryOnTransientError,
} from '../../services/account-type-controls/quotaErrors';
import { usageTrackingService } from '../../services/usageTrackingService';
import { resolveEffectiveAccountTypeFromData } from '../../utils/accountStatusTime';
import { getTrustedNowMs, syncTrustedTime } from '../../utils/trustedTime';
import { ToolCard } from './ToolCard';
import { TOOL_TONES } from './toolTones';
import { getDocCacheFirst } from '../../services/firestore/cacheFirst';
import { getUserProfileDocRef } from '../../services/firestore/profileRoles';

// أداة الكلى بس — الأدوات التانية (التداخلات، الحمل) انتقلوا لشاشة الكشف
const RenalDoseAdjustment = React.lazy(() =>
  import('./RenalDoseAdjustment').then((mod) => ({ default: mod.RenalDoseAdjustment }))
);

interface DrugToolsViewProps {
  onClose: () => void;
  onOpenMedicationEdit: () => void;
}

// بعد حذف التداخلات والحمل، لم يتبقَ إلا أداة واحدة مدعومة بكوتا
type DrugToolKey = 'renal';
type ViewTool = DrugToolKey | null;

export const DrugToolsView: React.FC<DrugToolsViewProps> = ({ onClose, onOpenMedicationEdit }) => {
  // الأداة النشطة (متزامنة مع URL ?tool=...)
  const [searchParams] = useSearchParams();
  const [activeTool, setActiveTool] = useState<ViewTool>(
    () => {
      // ?tool=renal بس — أي قيمة تانية بتترجم null (عشان تعاني الروابط القديمة)
      const urlTool = searchParams.get('tool');
      return urlTool === 'renal' ? 'renal' : null;
    },
  );
  // وسيط لتحويل null <-> '' للمزامنة مع الـ URL
  const toolAsString = activeTool ?? '';
  const setToolAsString = (val: string) => setActiveTool(val === 'renal' ? 'renal' : null);
  const { setTabWithUrl: setToolWithUrl } = useTabSync<string>(
    'tool', toolAsString, setToolAsString, '',
    ['', 'renal'] as const,
  );
  const [accountType, setAccountType] = useState<'free' | 'premium' | 'pro_max'>('free');
  const [accountTypeResolved, setAccountTypeResolved] = useState(false);
  const [lockedNotice, setLockedNotice] = useState<{ title: string; message: string } | null>(null);
  const [accessControls, setAccessControls] = useState({
    // المنطق الموحّد: الحد اليومي للمجاني هو الحاكم — لو = 0 يعني الأداه مقفولة عليه.
    // مفيش toggle منفصل لـ premiumOnly، الأدمن بيحط رقم لكل باقة وبس.
    freeRenalToolDailyLimit: 5000,
    premiumRenalToolDailyLimit: 5000,
    proMaxRenalToolDailyLimit: 5000,
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
          freeRenalToolDailyLimit: Number(controls.freeRenalToolDailyLimit || 0),
          premiumRenalToolDailyLimit: Number(controls.premiumRenalToolDailyLimit || 0),
          proMaxRenalToolDailyLimit: Number(controls.proMaxRenalToolDailyLimit || controls.premiumRenalToolDailyLimit || 0),
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

  // برو وبرو ماكس الاتنين "Pro" لأغراض الحدود (الـ Cloud Function بيستخدم نفس التصنيف)
  const isPro = accountType === 'premium' || accountType === 'pro_max';
  // الأداه "مقفولة على المجاني" لو الأدمن خلى الحد اليومي للمجاني = 0.
  // ده الحاكم الوحيد دلوقتي — مفيش toggle منفصل.
  const isLockedForFree = accessControls.freeRenalToolDailyLimit === 0;
  const toolRules = useMemo(
    () => ({
      renal: {
        title: 'جرعات الكلى',
      },
    }),
    []
  );

  const canOpenTool = async (tool: DrugToolKey): Promise<boolean> => {
    const rule = toolRules[tool];

    const feature = 'renalTool';
    const configuredLimit = accountType === 'pro_max'
      ? accessControls.proMaxRenalToolDailyLimit
      : isPro
      ? accessControls.premiumRenalToolDailyLimit
      : accessControls.freeRenalToolDailyLimit;

    // حساب برو + حد يومي عالي (≥500) = فتح فوري وتتبع الكوتا في الخلفية
    // بدل ما ننتظر الـCloud Function (1-3 ثانيه) — السيرفر لسه بيتحقق عند كل استخدام فعلي
    try {
      // retry تلقائي على أخطاء النت العابرة (3 محاولات بـbackoff)
      await retryOnTransientError(() => consumeDrugToolQuota(feature));
      return true;
    } catch (error: unknown) {
      const isLimitError = isQuotaLimitExceededError(error);
      if (!isLimitError) {
        setLockedNotice({
          title: rule.title,
          message: getQuotaVerificationFailureMessage('تعذر التحقق من الحد اليومي لهذه الأداة الآن. حاول مرة أخرى.'),
        });
        console.warn('[DrugToolsView] Quota check failed; blocking tool access:', { tool, error });
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

  // تتبع استخدام أداة البحث (أداة الكلى بتُحسب على drugSearch في usageTrackingService)
  const trackRenalOpen = () => {
    if (!userId) return;
    usageTrackingService
      .trackEvent({
        doctorId: userId,
        eventType: 'drugSearch',
        metadata: { tool: 'renal' },
      })
      .catch((err) => console.error('Failed to track tool event:', err));
  };

  const whatsappDigits = String(accessControls.whatsappNumber || '').replace(/\D/g, '');
  const premiumWhatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '';
  const premiumOnlyLine = 'هذه الميزة للحسابات بروة فقط';

  const activeToolTitle = activeTool === 'renal' ? 'جرعات الكلى' : 'أدوات الأدوية الذكية';

  return (
    <div data-no-reveal className="px-2 py-2 sm:px-4 sm:py-3 space-y-2" dir="rtl">
      {!activeTool ? (
        <>
          {lockedNotice && (
            <div className="rounded-2xl bg-gradient-to-br from-warning-500 to-warning-600 p-3 shadow-[0_8px_20px_-8px_rgba(245,158,11,0.5)]">
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
              title="جرعات الكلى"
              description="تعديل الجرعات بناءً على وظائف الكلى"
              icon={<span className="text-lg">🧪</span>}
              tone={TOOL_TONES.renal}
              // اللون يعكس قرار الأدمن من خلال الحد اليومي للمجاني:
              //   - الأدمن خلى الحد للمجاني = 0 → الأداه مقفولة عليه → ذهبي بريميوم
              //     (متطابق مع أزرار التداخلات/الحمل في كشف جديد).
              //   - الأدمن حط حد > 0 → الأداه متاحة للجميع → أخضر عادي.
              // accountTypeResolved لازم يكون true عشان نتجنب وميض اللون قبل ما القيم
              // الفعلية تتحمّل من Firestore (الـ default الـ initial = 5000 = أخضر).
              premiumGold={accountTypeResolved && isLockedForFree}
              badgeLabel={accountTypeResolved && isLockedForFree && !isPro ? accessControls.premiumTagLabel || 'Pro' : undefined}
              onClick={async () => {
                setLockedNotice(null);
                if (await canOpenTool('renal')) {
                  trackRenalOpen();
                  setToolWithUrl('renal');
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
              className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-br from-brand-600 to-brand-600 text-[11px] font-black text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              رجوع للأدوات
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 dh-stagger-2">
            <Suspense fallback={<LoadingStateScreen message="جاري تحميل الأداة" />}>
              {activeTool === 'renal' && <RenalDoseAdjustment />}
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
};
