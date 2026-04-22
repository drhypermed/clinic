// ─────────────────────────────────────────────────────────────────────────────
// Cloud Functions للـSEO — sitemap.xml + robots.txt ديناميكيّين حسب الدومين
// ─────────────────────────────────────────────────────────────────────────────
// الدومينين بيشتركوا في نفس الـHosting site، فلازم نفرّق بالـHost header:
//   • drhypermed.com        → sitemap فيه كل الأطباء المنشورين + robots allow all
//   • clinic.drhypermed.com → sitemap فاضي + robots Disallow all (noindex)
//
// التوفير: الرد مكاشّش على CDN لمدّه 24 ساعه (max-age=86400) — القراءه من
// Firestore بتحصل مرّه واحده كل 24 ساعه على الأكتر. عند 5000 طبيب = 5000 قراءه
// يوم = رخيص جداً (~$0.003/يوم).
// ─────────────────────────────────────────────────────────────────────────────

// الدومين الرسمي للجمهور في كل الـURLs اللي بنرجّعها (sitemap + robots) =
// www.drhypermed.com — لأنه اللي شغّال في Firebase Hosting فعلاً.
// الدومين بدون www (PATIENT_HOST) بنستخدمه بس لفحص الـHost header الجاي من الـrequest،
// عشان لو زائر دخل بأيّ من الشكلين (www أو بدون) نعرف إنه patient.
const PATIENT_HOST = 'drhypermed.com';
const PATIENT_ORIGIN = 'https://www.drhypermed.com';
const CLINIC_ORIGIN = 'https://clinic.drhypermed.com';

// قراءه الـhost الحقيقي — Firebase Hosting بيمرّره في x-forwarded-host
const getRequestHost = (req) => {
  const forwarded = req.headers['x-forwarded-host'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim().toLowerCase();
  }
  const host = req.headers.host;
  return (host || '').toLowerCase();
};

const isPatientHost = (req) => {
  const host = getRequestHost(req);
  // www.drhypermed.com أو drhypermed.com = patient
  // أي حاجه تانيه (clinic.*, staging، firebase default) = مش patient
  return host === PATIENT_HOST || host === `www.${PATIENT_HOST}`;
};

// تهريب الأحرف الخاصّه عشان XML ميبوظش
const escapeXml = (s) => String(s).replace(/[<>&'"]/g, (c) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
}[c]));

// تحويل Firestore Timestamp لـISO string (لو موجود) أو fallback للوقت الحالي
const timestampToIso = (value, fallback) => {
  try {
    if (value && typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string' && value) return new Date(value).toISOString();
  } catch {
    /* تجاهل أي خطأ في التحويل */
  }
  return fallback;
};

// الصفحات الثابته اللي عايزين جوجل يفهرسها في دومين المرضى
const STATIC_PATIENT_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/public', priority: '0.9', changefreq: 'daily' },
  { path: '/login/public', priority: '0.4', changefreq: 'monthly' },
];

/**
 * يبني sitemap.xml من أطباء Firestore المنشورين + الصفحات الثابته.
 * بيتحدّد على 5000 طبيب كـsafety (الـsitemap الواحد max 50K URLs عند جوجل).
 */
const buildPatientSitemap = async (admin) => {
  const db = admin.firestore();
  const snap = await db.collection('doctorAds')
    .where('isPublished', '==', true)
    .limit(5000)
    .get();

  const now = new Date().toISOString();
  const urls = [];

  // الصفحات الثابته
  for (const p of STATIC_PATIENT_PAGES) {
    urls.push(`  <url>
    <loc>${PATIENT_ORIGIN}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
  }

  // صفحه كل طبيب منشور (بنستخدم /dr/:slug — هنعمل الـroute في Task 5)
  for (const doc of snap.docs) {
    const data = doc.data() || {};
    const slug = typeof data.publicSlug === 'string' ? data.publicSlug.trim() : '';
    if (!slug) continue;    // تخطّى الأطباء من غير slug
    const lastmod = timestampToIso(data.updatedAt, now);
    urls.push(`  <url>
    <loc>${PATIENT_ORIGIN}/dr/${escapeXml(slug)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
};

// sitemap للدكاتره (clinic.drhypermed.com) — الصفحه التعريفيّه + دليل المستخدم.
// الصفحات دي العامّه اللي محتاجه تتفهرس عشان جوجل يديها زيارات من الدكاتره
// اللي بيدوّروا على "برنامج عياده"، "روشته إلكترونيّه"، إلخ.
const buildClinicSitemap = () => {
  const now = new Date().toISOString();
  const entries = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/user-guide', priority: '0.8', changefreq: 'monthly' },
  ];
  const urls = entries.map((p) => `  <url>
    <loc>${CLINIC_ORIGIN}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

// sitemap فاضي — fallback لأي host مش معروف
const EMPTY_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;

/**
 * Handler لـ /sitemap.xml — بيرد حسب الدومين.
 * patient host → sitemap الأطباء من Firestore
 * clinic host → sitemap صفحه التعريف + دليل المستخدم
 */
const createSitemapHandler = (admin) => async (req, res) => {
  try {
    res.set('Content-Type', 'application/xml; charset=utf-8');
    // كاش 24 ساعه على الـCDN — القراءه من Firestore بتحصل مرّه في اليوم
    res.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    const xml = isPatientHost(req)
      ? await buildPatientSitemap(admin)
      : buildClinicSitemap();

    res.status(200).send(xml);
  } catch (err) {
    console.error('[seo] sitemap error:', err);
    // في حاله فشل Firestore: نرجّع sitemap فاضي بدل 500
    // عشان Googlebot ميعتبرش الـsitemap كسّر.
    res.status(200).send(EMPTY_SITEMAP);
  }
};

// robots.txt للمرضى — بيسمح بكل حاجه + بيشاور على الـsitemap
const PATIENT_ROBOTS = `User-agent: *
Allow: /

# مسارات مؤقّته للحجز بـsecret — مش محتاجه فهرسه
Disallow: /book-public/s/
Disallow: /book/s/

Sitemap: ${PATIENT_ORIGIN}/sitemap.xml
`;

// robots.txt للدكاتره — بيسمح بالصفحه التعريفيّه ودليل المستخدم فقط.
// الصفحات الداخليّه (login، home، app، admin) ممنوعه من الفهرسه —
// ده تطبيق خاص مش محتاج يظهر في جوجل.
const CLINIC_ROBOTS = `User-agent: *
Allow: /$
Allow: /user-guide
Disallow: /login/
Disallow: /signup/
Disallow: /home
Disallow: /app/
Disallow: /admin
Disallow: /doctor/
Disallow: /book/
Disallow: /book-public/
Disallow: /p/

Sitemap: ${CLINIC_ORIGIN}/sitemap.xml
`;

/**
 * Handler لـ /robots.txt — بيرد حسب الدومين.
 */
const robotsHandler = (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  // robots.txt نادراً بيتغيّر — كاش 24 ساعه
  res.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  const body = isPatientHost(req) ? PATIENT_ROBOTS : CLINIC_ROBOTS;
  res.status(200).send(body);
};

module.exports = {
  createSitemapHandler,
  robotsHandler,
};
