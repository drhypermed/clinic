// ─────────────────────────────────────────────────────────────────────────────
// JsonLdTag — مكوّن بيحط <script type="application/ld+json"> في <head>
// ─────────────────────────────────────────────────────────────────────────────
// جوجل بيقرا الـJSON-LD عشان يفهم محتوى الصفحه (دكتور، تقييمات، أسعار).
// بنحطّه في الـhead مش الـbody عشان يبقى Valid HTML ومكشوف فوراً للـBot.
//
// كل مكوّن بيحط tag بـid فريد (مفاتيحه الـid prop) عشان:
//   - لو الـcomponent اتعدّل → بنحدّث نفس الـtag (مش بنضيف واحد جديد)
//   - لو الـcomponent اتشال → بنشيل الـtag من الـDOM
//
// الـid مهم عشان ميحصلش duplication لو في أكتر من مكوّن في نفس الصفحه.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

interface JsonLdTagProps {
  /** معرّف فريد للـscript (مثلاً "doctor-schema" أو "directory-itemlist"). */
  id: string;
  /** الـJSON اللي هيتحوّل نص ويتحط جوّه الـscript. */
  json: Record<string, unknown> | null;
}

export const JsonLdTag: React.FC<JsonLdTagProps> = ({ id, json }) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // ID ثابت عشان نعدّل على نفس الـtag بدل إنشاء واحد جديد كل render
    const tagId = `jsonld-${id}`;
    let script = document.getElementById(tagId) as HTMLScriptElement | null;

    // لو الـjson = null → نشيل الـtag لو موجود
    if (!json) {
      if (script) script.remove();
      return;
    }

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = tagId;
      document.head.appendChild(script);
    }

    // JSON.stringify بدون spaces عشان الحجم أصغر
    script.textContent = JSON.stringify(json);

    // عند الـunmount نشيل الـtag — عشان ميبقاش متعلّق على صفحات تانيه
    return () => {
      const existing = document.getElementById(tagId);
      if (existing) existing.remove();
    };
  }, [id, json]);

  // المكوّن مبيرندرش حاجه مرئيّه — كل شغله في الـhead
  return null;
};
