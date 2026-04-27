// ─────────────────────────────────────────────────────────────────────────────
// صفحه دليل المستخدم (User Guide Page)
// ─────────────────────────────────────────────────────────────────────────────
// صفحه docs-style بتعرض كل ميزات التطبيق للدكتور بترتيب منطقي.
// بتتعرض على `clinic.drhypermed.com/user-guide` (دومين العياده فقط — مش للمرضى).
//
// التصميم:
//   ┌─ Mobile: sidebar بيفتح من tap على زر ─┐
//   │                                        │
//   ├──────────── Header + زر الرجوع ────────┤
//   │                                        │
//   ├─ sidebar ─┬──── Content area ──────────┤
//   │ Category1 │  عنوان الموضوع              │
//   │  Topic 1  │  وصف مختصر                  │
//   │  Topic 2  │  ──────────────             │
//   │ Category2 │  خطوات مرقّمه                │
//   │  Topic 3  │  نصيحه محترف                │
//   │           │  خطأ شايع                   │
//   └───────────┴────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHideBootSplash } from '../../../hooks/useHideBootSplash';
import {
  LuBookOpen,         // شعار الدليل
  LuArrowRight,       // زر الرجوع (RTL = سهم لليمين)
  LuArrowLeft,        // فتح القائمه الجانبيه على الموبايل (سهم لليسار بدل الثلاث شرط)
  LuX,                // إغلاق القائمه الجانبيه
  LuLightbulb,        // نصيحه
  LuTriangleAlert,    // تحذير / خطأ شايع
  LuCircleCheck,      // Step check
  LuClock,            // وقت القراءه
  LuList,             // فهرس المحتويات
} from 'react-icons/lu';
import { USER_GUIDE_CATEGORIES, USER_GUIDE_ALL_TOPICS } from './userGuideData';
import type { GuideTopic, GuideSection } from './userGuideData';
// 🆕 جدول مقارنة حي بين الباقات — يقرأ القيم من إعدادات الأدمن لحظياً
import { TierComparisonTable } from './TierComparisonTable';
// 🆕 جدول أسعار الباقات الحي — يقرأ الأسعار من Firestore
import { TierPricingTable } from './TierPricingTable';

// ═════════════════════════════════════════════════════════════════════════════
// الـsidebar اللي بيعرض الـcategories والـtopics
// ═════════════════════════════════════════════════════════════════════════════
const GuideSidebar: React.FC<{
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}> = ({ selectedTopicId, onSelectTopic, onClose, isMobile }) => (
  <aside className={`${isMobile ? 'p-4' : 'p-5'} h-full overflow-y-auto`} dir="rtl">
    {isMobile && (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-slate-800">محتويات الدليل</h2>
        <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
          <LuX className="w-4 h-4 text-slate-700" />
        </button>
      </div>
    )}
    {USER_GUIDE_CATEGORIES.map((cat) => (
      <div key={cat.id} className="mb-5">
        {/* عنوان الـcategory */}
        <div className="mb-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{cat.title}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{cat.description}</p>
        </div>
        {/* المواضيع داخل الـcategory */}
        <ul className="space-y-0.5">
          {cat.topics.map((topic) => {
            const isActive = topic.id === selectedTopicId;
            return (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => onSelectTopic(topic.id)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {topic.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </aside>
);

// ═════════════════════════════════════════════════════════════════════════════
// ترجمه بسيطه للـmarkdown inline: **bold** + سطور جديده (\n\n → فقرات، \n → <br/>)
// ═════════════════════════════════════════════════════════════════════════════
const renderMarkdownBody = (text: string): React.ReactNode => {
  // قسّم النص لفقرات بالـ\n\n
  const paragraphs = text.split(/\n\n/);
  return paragraphs.map((para, pi) => (
    <React.Fragment key={pi}>
      {pi > 0 && <br />}
      {renderInlineLine(para)}
    </React.Fragment>
  ));
};

// يرندر سطر مفرد مع دعم **bold** و\n (سطر جديد)
const renderInlineLine = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  return lines.map((line, li) => (
    <React.Fragment key={li}>
      {li > 0 && <br />}
      {renderInlineMarkdown(line)}
    </React.Fragment>
  ));
};

const renderInlineMarkdown = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

// ═════════════════════════════════════════════════════════════════════════════
// عرض قسم واحد من الموضوع (خطوات / نصيحه / تحذير / نص عادي)
// كل قسم له anchor ID عشان الفهرس يقدر يـscroll له.
// ═════════════════════════════════════════════════════════════════════════════
const SectionRenderer: React.FC<{ section: GuideSection; index: number; anchorId: string }> = ({ section, index, anchorId }) => {
  // 🆕 قسم خاص: جدول مقارنة الباقات الحي
  if (section.tierComparison) {
    return (
      <div id={anchorId} className="my-5 scroll-mt-20">
        {section.heading && (
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
            <span className="inline-block w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-black ml-2 text-center leading-7">{index + 1}</span>
            {section.heading}
          </h3>
        )}
        {section.body && (
          <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed mb-3 pr-9">
            {renderMarkdownBody(section.body)}
          </p>
        )}
        <TierComparisonTable />
      </div>
    );
  }
  // 🆕 قسم خاص: جدول أسعار الباقات الحي
  if (section.tierPricing) {
    return (
      <div id={anchorId} className="my-5 scroll-mt-20">
        {section.heading && (
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
            <span className="inline-block w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-black ml-2 text-center leading-7">{index + 1}</span>
            {section.heading}
          </h3>
        )}
        {section.body && (
          <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed mb-3 pr-9">
            {renderMarkdownBody(section.body)}
          </p>
        )}
        <TierPricingTable />
      </div>
    );
  }
  // قسم نصيحه محترف (Pro Tip) — خلفيّه صفرا
  if (section.tip) {
    return (
      <div id={anchorId} className="my-4 flex gap-3 p-4 rounded-xl bg-warning-50 border border-warning-200 scroll-mt-20">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-warning-500 text-white flex items-center justify-center">
          <LuLightbulb className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-black text-warning-900 mb-1">{section.heading || 'نصيحه محترف'}</div>
          <p className="text-sm text-warning-900 font-semibold leading-relaxed">{renderInlineLine(section.tip)}</p>
        </div>
      </div>
    );
  }
  // قسم خطأ شايع (Warning) — خلفيّه حمرا
  if (section.warning) {
    return (
      <div id={anchorId} className="my-4 flex gap-3 p-4 rounded-xl bg-danger-50 border border-danger-200 scroll-mt-20">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-danger-500 text-white flex items-center justify-center">
          <LuTriangleAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-black text-danger-900 mb-1">{section.heading || 'خطأ شايع'}</div>
          <p className="text-sm text-danger-900 font-semibold leading-relaxed">{renderInlineLine(section.warning)}</p>
        </div>
      </div>
    );
  }
  // قسم عادي — عنوان + نص و/أو خطوات
  return (
    <div id={anchorId} className="my-5 scroll-mt-20">
      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
        <span className="inline-block w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-black ml-2 text-center leading-7">{index + 1}</span>
        {section.heading}
      </h3>
      {section.body && (
        <p className="text-sm sm:text-base text-slate-700 font-semibold leading-relaxed mb-3 pr-9">
          {renderMarkdownBody(section.body)}
        </p>
      )}
      {section.steps && (
        <ol className="space-y-2 pr-9">
          {section.steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <LuCircleCheck className="w-4 h-4 shrink-0 mt-1 text-success-600" />
              <span className="text-sm text-slate-700 font-semibold leading-relaxed">
                {renderMarkdownBody(step)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// فهرس المحتويات (Table of Contents) — بيظهر أعلى كل موضوع
// بيعرض كل الأقسام اللي فيها heading (مش الـtips والـwarnings الصغيّره)
// لمّا المستخدم يضغط، بيـscroll للقسم مباشره.
// ═════════════════════════════════════════════════════════════════════════════
const TopicTableOfContents: React.FC<{ sections: GuideSection[]; topicId: string }> = ({ sections, topicId }) => {
  // نعرض بس الأقسام اللي ليها heading (الـtips والـwarnings بيظهروا لوحدهم)
  const tocItems = sections
    .map((s, i) => ({ section: s, idx: i }))
    .filter(({ section }) => section.heading && !section.tip && !section.warning);

  // مفيش داعي للفهرس لو الأقسام أقل من 3
  if (tocItems.length < 3) return null;

  const handleJump = (idx: number) => {
    const el = document.getElementById(`${topicId}-section-${idx}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="mb-6 p-4 rounded-xl bg-brand-50/60 border border-brand-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
          <LuList className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-black text-slate-900">الفهرس — اللي هتلاقيه في الموضوع</h4>
      </div>
      <ol className="space-y-1 pr-9">
        {tocItems.map(({ section, idx }, displayIdx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => handleJump(idx)}
              className="text-xs sm:text-sm text-brand-700 hover:text-brand-900 font-semibold hover:underline text-right"
            >
              {displayIdx + 1}. {section.heading}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// الـComponent الرئيسي — بيجمّع الـsidebar والـcontent
// ═════════════════════════════════════════════════════════════════════════════
export const UserGuidePage: React.FC = () => {
  useHideBootSplash('user-guide-mounted');
  const navigate = useNavigate();
  const location = useLocation();

  // الموضوع الحالي — افتراضياً أول موضوع (تسجيل الدخول)
  const [selectedTopicId, setSelectedTopicId] = useState<string>(USER_GUIDE_ALL_TOPICS[0]?.id || '');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ─ زر الرجوع الذكي:
  //   لو المستخدم جاي من صفحة تانية داخل التطبيق (location.key مش 'default')
  //   → نرجّعه للسابقة عبر history.
  //   لو فتح اللينك مباشرة (مثلاً نسخه ولصقه أو إشارة مرجعية)
  //   → نوديه للصفحة الرئيسية كـfallback آمن.
  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const currentTopic = useMemo<GuideTopic | undefined>(
    () => USER_GUIDE_ALL_TOPICS.find((t) => t.id === selectedTopicId),
    [selectedTopicId]
  );

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setMobileSidebarOpen(false);
    // scroll لأعلى الصفحه عند تغيير الموضوع عشان المستخدم يبدأ من فوق
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {/* ═════════════ Header ═════════════ */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* زر الرجوع — يرجع للصفحه السابقة لو فيه history، وإلا الصفحه الرئيسيّه */}
            <button
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              title="رجوع للصفحه السابقة"
            >
              <LuArrowRight className="w-4 h-4 text-slate-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-600 text-white flex items-center justify-center shadow-sm">
                <LuBookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 leading-tight">دليل المستخدم</h1>
                <p className="text-[10px] text-slate-500 font-semibold">كل اللي محتاجه تعرفه عن Dr Hyper</p>
              </div>
            </div>
          </div>
          {/* زر فتح القائمه على الموبايل — سهم لليسار بدل الثلاث شرط */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
            title="عرض المحتويات"
          >
            <LuArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </header>

      {/* ═════════════ Mobile sidebar overlay ═════════════ */}
      {mobileSidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-30"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="md:hidden fixed top-0 right-0 h-full w-[280px] bg-white z-40 shadow-2xl overflow-y-auto">
            <GuideSidebar
              selectedTopicId={selectedTopicId}
              onSelectTopic={handleSelectTopic}
              onClose={() => setMobileSidebarOpen(false)}
              isMobile
            />
          </div>
        </>
      )}

      {/* ═════════════ Main layout (sidebar + content) ═════════════ */}
      <div className="max-w-7xl mx-auto flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-white border-l border-slate-200">
          <GuideSidebar selectedTopicId={selectedTopicId} onSelectTopic={handleSelectTopic} />
        </div>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-10 max-w-3xl">
          {currentTopic ? (
            <article>
              {/* عنوان الموضوع + وقت القراءه */}
              <div className="mb-5">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight">
                  {currentTopic.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed mb-3">
                  {currentTopic.summary}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <LuClock className="w-3.5 h-3.5" />
                  قراءه في {currentTopic.readMinutes} دقايق
                </div>
              </div>

              {/* الخط الفاصل */}
              <div className="h-px bg-slate-200 mb-5" />

              {/* فهرس المحتويات (بيظهر فقط لو الموضوع فيه 3+ أقسام) */}
              <TopicTableOfContents sections={currentTopic.sections} topicId={currentTopic.id} />

              {/* أقسام الموضوع — كل قسم له ID عشان الفهرس يقدر يـscroll له */}
              {currentTopic.sections.map((section, i) => (
                <SectionRenderer
                  key={i}
                  section={section}
                  index={i}
                  anchorId={`${currentTopic.id}-section-${i}`}
                />
              ))}

              {/* Next topic navigation */}
              <div className="mt-10 pt-6 border-t border-slate-200">
                <NextTopicButton
                  currentTopicId={selectedTopicId}
                  onSelectTopic={handleSelectTopic}
                />
              </div>
            </article>
          ) : (
            <p className="text-slate-500">اختار موضوع من القائمه.</p>
          )}
        </main>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// زر "الموضوع اللي بعده" — بيسهّل التنقّل السلس بين المواضيع بالترتيب
// ═════════════════════════════════════════════════════════════════════════════
const NextTopicButton: React.FC<{
  currentTopicId: string;
  onSelectTopic: (id: string) => void;
}> = ({ currentTopicId, onSelectTopic }) => {
  const currentIdx = USER_GUIDE_ALL_TOPICS.findIndex((t) => t.id === currentTopicId);
  const next = currentIdx >= 0 && currentIdx < USER_GUIDE_ALL_TOPICS.length - 1
    ? USER_GUIDE_ALL_TOPICS[currentIdx + 1]
    : null;

  if (!next) {
    return (
      <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-center">
        <p className="text-sm font-black text-success-900">🎉 كملت الدليل بالكامل!</p>
        <p className="text-xs text-success-700 mt-1 font-semibold">جاهز تستخدم Dr Hyper باحترافيه.</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectTopic(next.id)}
      className="w-full flex items-center justify-between gap-3 p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all shadow-sm hover:shadow-md text-right"
    >
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">الموضوع اللي بعده</div>
        <div className="text-sm font-black text-slate-900">{next.title}</div>
      </div>
      <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center">
        <LuArrowRight className="w-4 h-4 rotate-180" />
      </div>
    </button>
  );
};
