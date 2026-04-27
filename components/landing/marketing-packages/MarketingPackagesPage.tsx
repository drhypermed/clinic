// ─────────────────────────────────────────────────────────────────────────────
// صفحة باقات الدعاية والتسويق (Marketing Packages Page)
// ─────────────────────────────────────────────────────────────────────────────
// تعتمد نفس تنسيق دليل المستخدم: sidebar + content area.
// الفرق:
//   - مفيش أسعار في كل الباقات (عرض الميزات بس).
//   - في آخر كل صفحة كارت "للتواصل" بزر واتساب يفتح المحادثة بالرسالة الجاهزة.
//   - ألوان moderate brand بدل brand قوي (دي صفحة تسويق، مش دليل تقني).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LuMegaphone,        // شعار الباقات (ميغافون = إعلان/تسويق)
  LuArrowRight,       // زر الرجوع (RTL = سهم لليمين)
  LuArrowLeft,        // فتح القائمة الجانبية على الموبايل
  LuX,                // إغلاق القائمة الجانبية
  LuLightbulb,        // نصيحة / عرض سنوي
  LuCircleCheck,      // علامة الميزات المتضمنة
  LuList,             // فهرس
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import { useHideBootSplash } from '../../../hooks/useHideBootSplash';
import {
  MARKETING_PACKAGE_CATEGORIES,
  MARKETING_PACKAGE_ALL_TOPICS,
  MARKETING_WHATSAPP_URL,
} from './marketingPackagesData';
import type { PackageTopic, PackageSection } from './marketingPackagesData';

// ═════════════════════════════════════════════════════════════════════════════
// الـsidebar — قائمة الفئات والباقات
// ═════════════════════════════════════════════════════════════════════════════
const PackagesSidebar: React.FC<{
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}> = ({ selectedTopicId, onSelectTopic, onClose, isMobile }) => (
  <aside className={`${isMobile ? 'p-4' : 'p-5'} h-full overflow-y-auto`} dir="rtl">
    {isMobile && (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-slate-800">قائمة الباقات</h2>
        <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
          <LuX className="w-4 h-4 text-slate-700" />
        </button>
      </div>
    )}
    {MARKETING_PACKAGE_CATEGORIES.map((cat) => (
      <div key={cat.id} className="mb-5">
        <div className="mb-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{cat.title}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{cat.description}</p>
        </div>
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
// ترجمة بسيطة للـmarkdown inline (نفس اللي في UserGuidePage — bold + سطور جديدة)
// ═════════════════════════════════════════════════════════════════════════════
const renderMarkdownBody = (text: string): React.ReactNode => {
  const paragraphs = text.split(/\n\n/);
  return paragraphs.map((para, pi) => (
    <React.Fragment key={pi}>
      {pi > 0 && <br />}
      {renderInlineLine(para)}
    </React.Fragment>
  ));
};

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
// عرض قسم واحد من الباقة
// ═════════════════════════════════════════════════════════════════════════════
const SectionRenderer: React.FC<{ section: PackageSection; index: number; anchorId: string }> = ({ section, index, anchorId }) => {
  // قسم نصيحة / عرض سنوي — خلفية صفراء
  if (section.tip) {
    return (
      <div id={anchorId} className="my-4 flex gap-3 p-4 rounded-xl bg-warning-50 border border-warning-200 scroll-mt-20">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-warning-500 text-white flex items-center justify-center">
          <LuLightbulb className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-black text-warning-900 mb-1">{section.heading || 'عرض'}</div>
          <p className="text-sm text-warning-900 font-semibold leading-relaxed">{renderInlineLine(section.tip)}</p>
        </div>
      </div>
    );
  }
  // قسم عادي — عنوان + نص + خطوات
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
// فهرس المحتويات (يظهر فقط لو 3+ أقسام)
// ═════════════════════════════════════════════════════════════════════════════
const TopicTableOfContents: React.FC<{ sections: PackageSection[]; topicId: string }> = ({ sections, topicId }) => {
  const tocItems = sections
    .map((s, i) => ({ section: s, idx: i }))
    .filter(({ section }) => section.heading && !section.tip);

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
        <h4 className="text-sm font-black text-slate-900">الفهرس</h4>
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
// كارت التواصل — يظهر في آخر كل باقة (زر واتساب يفتح محادثة جاهزة)
// ═════════════════════════════════════════════════════════════════════════════
const ContactCard: React.FC = () => (
  <div className="mt-8 p-5 rounded-2xl bg-gradient-to-l from-success-50 to-white border border-success-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-success-500 text-white flex items-center justify-center shadow-sm">
        <FaWhatsapp className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-base font-black text-slate-900">للتواصل والاستفسار</h4>
        <p className="text-xs text-slate-600 font-semibold">اضغط الزر تحت لفتح محادثة واتساب جاهزة.</p>
      </div>
    </div>
    {/* الزر بيفتح المحادثة على واتساب مباشرةً — الرقم نفسه مش معروض للمستخدم،
        بنخفيه عشان مايتاخدش من خارج التطبيق ويتستخدم في رسائل غير مرغوبة. */}
    <a
      href={MARKETING_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-success-500 hover:bg-success-600 text-white font-black text-sm sm:text-base transition-colors shadow-sm"
    >
      <FaWhatsapp className="w-5 h-5" />
      <span>تواصل واتساب</span>
    </a>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// زر الانتقال للباقة اللي بعدها
// ═════════════════════════════════════════════════════════════════════════════
const NextTopicButton: React.FC<{
  currentTopicId: string;
  onSelectTopic: (id: string) => void;
}> = ({ currentTopicId, onSelectTopic }) => {
  const currentIdx = MARKETING_PACKAGE_ALL_TOPICS.findIndex((t) => t.id === currentTopicId);
  const next = currentIdx >= 0 && currentIdx < MARKETING_PACKAGE_ALL_TOPICS.length - 1
    ? MARKETING_PACKAGE_ALL_TOPICS[currentIdx + 1]
    : null;

  if (!next) return null;

  return (
    <button
      type="button"
      onClick={() => onSelectTopic(next.id)}
      className="w-full flex items-center justify-between gap-3 p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-300 transition-all shadow-sm hover:shadow-md text-right"
    >
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">الباقة اللي بعدها</div>
        <div className="text-sm font-black text-slate-900">{next.title}</div>
      </div>
      <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center">
        <LuArrowRight className="w-4 h-4 rotate-180" />
      </div>
    </button>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// المكون الرئيسي
// ═════════════════════════════════════════════════════════════════════════════
export const MarketingPackagesPage: React.FC = () => {
  useHideBootSplash('marketing-packages-mounted');
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedTopicId, setSelectedTopicId] = useState<string>(MARKETING_PACKAGE_ALL_TOPICS[0]?.id || '');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const currentTopic = useMemo<PackageTopic | undefined>(
    () => MARKETING_PACKAGE_ALL_TOPICS.find((t) => t.id === selectedTopicId),
    [selectedTopicId]
  );

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // زر رجوع ذكي (نفس فكرة UserGuidePage — يرجع للسابقة لو فيه history)
  const handleBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {/* ═════════════ Header ═════════════ */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              title="رجوع للصفحة السابقة"
            >
              <LuArrowRight className="w-4 h-4 text-slate-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-600 text-white flex items-center justify-center shadow-sm">
                <LuMegaphone className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 leading-tight">باقات الدعاية</h1>
                <p className="text-[10px] text-slate-500 font-semibold">خدمات التسويق والميديا للعيادة</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
            title="عرض القائمة"
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
            <PackagesSidebar
              selectedTopicId={selectedTopicId}
              onSelectTopic={handleSelectTopic}
              onClose={() => setMobileSidebarOpen(false)}
              isMobile
            />
          </div>
        </>
      )}

      {/* ═════════════ Main layout ═════════════ */}
      <div className="max-w-7xl mx-auto flex">
        <div className="hidden md:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-white border-l border-slate-200">
          <PackagesSidebar selectedTopicId={selectedTopicId} onSelectTopic={handleSelectTopic} />
        </div>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-10 max-w-3xl">
          {currentTopic ? (
            <article>
              <div className="mb-5">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight">
                  {currentTopic.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 font-semibold leading-relaxed mb-3">
                  {currentTopic.summary}
                </p>
                {/* بادج السعر تحت اسم الباقة — لو price مش معرّف يظهر "اطلب عرض" */}
                {currentTopic.id !== 'note' && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5">
                    <span className="text-[11px] font-black text-brand-600 uppercase tracking-wider">
                      السعر
                    </span>
                    <span className="text-base sm:text-lg font-black text-brand-800 font-numeric">
                      {currentTopic.price || 'اطلب عرض خاص'}
                    </span>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-200 mb-5" />

              <TopicTableOfContents sections={currentTopic.sections} topicId={currentTopic.id} />

              {currentTopic.sections.map((section, i) => (
                <SectionRenderer
                  key={i}
                  section={section}
                  index={i}
                  anchorId={`${currentTopic.id}-section-${i}`}
                />
              ))}

              {/* كارت التواصل — في آخر كل باقة */}
              <ContactCard />

              {/* زر الباقة التالية */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <NextTopicButton
                  currentTopicId={selectedTopicId}
                  onSelectTopic={handleSelectTopic}
                />
              </div>
            </article>
          ) : (
            <p className="text-slate-500">اختار باقة من القائمة.</p>
          )}
        </main>
      </div>
    </div>
  );
};
