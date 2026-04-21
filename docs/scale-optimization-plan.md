# خطة تحسين Firebase للمقياس الكبير ("ذكاء فيبرا")

> **الحالة:** مكتوبة، **غير منفّذة بعد**.
> **تاريخ الكتابة:** 2026-04-21
> **المؤلف:** مناقشة مع Claude في الـ pre-launch

---

## 🎯 الفكرة الكبرى

بدلاً من حساب الأرقام (إحصائيات، ملخصات مرضى) عند كل فتحة للتطبيق:
- **نحسبها مرة واحدة** لما يحصل تغيير (حفظ/حذف سجل)
- **نخزّنها جاهزة** في documents مخصصة
- **نقرأها فوراً** بقراءة واحدة بدلاً من 100+ قراءة

---

## 🚦 متى نبدأ التنفيذ؟

لا تنفذ أي مرحلة إلا لو حصل أحد التالي:

| الإشارة | المرحلة المطلوبة |
|---|---|
| الفاتورة الشهرية > $10 | المرحلة 1 |
| عدد الأطباء > 100 | المرحلة 1 |
| الفاتورة > $30 | المرحلة 2 |
| متوسط المرضى للطبيب > 500 | المرحلة 2 |
| الفاتورة > $50 | المرحلة 3 |
| بحث يتأخر أكثر من ثانية | المرحلة 3 |

---

## 🧱 المرحلة 1: ملخص الإحصائيات للطبيب

### الهدف
Cloud Function تحدّث `users/{uid}/stats/summary` كل ما يحصل تغيير في سجل.

### الكود الكامل

#### 1.1 ملف جديد: `functions/src/functions/perDoctorStatsCounter.js`

```javascript
/**
 * عدّاد إحصائيات الطبيب (per-doctor stats counter)
 *
 * يحافظ على doc `users/{uid}/stats/summary` محدّث في الوقت الحقيقي:
 *   - totalRecords, totalExams, totalConsultations
 *   - uniquePatients (عدد ملفات المرضى المختلفة)
 *   - examsToday, consultationsToday
 *   - examsThisMonth, consultationsThisMonth
 *   - lastUpdatedAt
 *
 * يتفعّل على: users/{uid}/records/{recordId} (path-scoped - ليس wildcard)
 */

const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const getDb = () => admin.firestore();

const getDayKey = (date) => {
  // YYYY-MM-DD في توقيت القاهرة
  const cairoStr = date.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  return cairoStr; // "2026-04-21"
};

const getMonthKey = (date) => {
  const cairoStr = date.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  return cairoStr.slice(0, 7); // "2026-04"
};

const isConsultation = (data) => {
  if (!data) return false;
  return data.isConsultationOnly === true;
};

const getRecordDateMs = (data) => {
  if (!data) return null;
  const dateMs = Number(data.dateMs);
  if (Number.isFinite(dateMs)) return dateMs;
  const dateField = data.date;
  if (typeof dateField === 'string') {
    const parsed = Date.parse(dateField);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (dateField && typeof dateField.toMillis === 'function') {
    return dateField.toMillis();
  }
  return null;
};

const buildDelta = (action, beforeData, afterData) => {
  const todayKey = getDayKey(new Date());
  const monthKey = getMonthKey(new Date());

  const delta = {
    totalRecords: 0,
    totalExams: 0,
    totalConsultations: 0,
    examsToday: 0,
    consultationsToday: 0,
    examsThisMonth: 0,
    consultationsThisMonth: 0,
    uniquePatientFileIds: {}, // { [fileId]: +1 | -1 }
  };

  const applyRecord = (data, sign) => {
    const cons = isConsultation(data);
    delta.totalRecords += sign;
    if (cons) delta.totalConsultations += sign;
    else delta.totalExams += sign;

    const recordMs = getRecordDateMs(data);
    if (Number.isFinite(recordMs)) {
      const recordDate = new Date(recordMs);
      const rKey = getDayKey(recordDate);
      const rMonth = getMonthKey(recordDate);
      if (rKey === todayKey) {
        if (cons) delta.consultationsToday += sign;
        else delta.examsToday += sign;
      }
      if (rMonth === monthKey) {
        if (cons) delta.consultationsThisMonth += sign;
        else delta.examsThisMonth += sign;
      }
    }

    const fileId = String(data?.patientFileId || '').trim();
    if (fileId) {
      delta.uniquePatientFileIds[fileId] = (delta.uniquePatientFileIds[fileId] || 0) + sign;
    }
  };

  if (action === 'create') applyRecord(afterData, +1);
  if (action === 'delete') applyRecord(beforeData, -1);
  if (action === 'update') {
    applyRecord(beforeData, -1);
    applyRecord(afterData, +1);
  }

  return delta;
};

const syncDoctorStatsSummary = async (event) => {
  const userId = event.params.userId;
  if (!userId) return;

  const before = event.data?.before?.data();
  const after = event.data?.after?.data();

  let action;
  if (!before && after) action = 'create';
  else if (before && !after) action = 'delete';
  else if (before && after) action = 'update';
  else return;

  const delta = buildDelta(action, before, after);

  const db = getDb();
  const summaryRef = db.doc(`users/${userId}/stats/summary`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(summaryRef);
    const current = snap.exists ? snap.data() : {};

    const updates = {
      totalRecords: FieldValue.increment(delta.totalRecords),
      totalExams: FieldValue.increment(delta.totalExams),
      totalConsultations: FieldValue.increment(delta.totalConsultations),
      examsToday: FieldValue.increment(delta.examsToday),
      consultationsToday: FieldValue.increment(delta.consultationsToday),
      examsThisMonth: FieldValue.increment(delta.examsThisMonth),
      consultationsThisMonth: FieldValue.increment(delta.consultationsThisMonth),
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };

    // تحديث ملفات المرضى الفريدة
    const patientFileCounts = { ...(current.patientFileCounts || {}) };
    Object.entries(delta.uniquePatientFileIds).forEach(([fileId, change]) => {
      const current = Number(patientFileCounts[fileId] || 0);
      const next = current + change;
      if (next <= 0) {
        delete patientFileCounts[fileId];
      } else {
        patientFileCounts[fileId] = next;
      }
    });
    updates.patientFileCounts = patientFileCounts;
    updates.uniquePatients = Object.keys(patientFileCounts).length;

    tx.set(summaryRef, updates, { merge: true });
  });
};

module.exports = { syncDoctorStatsSummary };
```

#### 1.2 التسجيل في `functions/index.js`

أضف بعد السطر اللي فيه `exports.syncAdminDashboardUserCounter`:

```javascript
// ملخص إحصائيات الطبيب — يتفعّل على كل تغيير في سجل
// path-scoped (ليس wildcard) — آمن من مشكلة الفاتورة السابقة
exports.syncDoctorStatsSummary = onDocumentWritten(
  { document: 'users/{userId}/records/{recordId}', region: REGION },
  lazy('./src/functions/perDoctorStatsCounter', 'syncDoctorStatsSummary')
);
```

#### 1.3 Cloud Function تانية: Reconciliation الدوري

لو حصل drift في الأرقام (بسبب فشل مؤقت في function)، هذه تعيد الحساب من الصفر.

ملف جديد: `functions/src/functions/perDoctorStatsReconcile.js`

```javascript
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

const getDb = () => admin.firestore();

const recomputeDoctorStats = async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new Error('Authentication required');
  }

  const db = getDb();
  const recordsSnap = await db.collection(`users/${userId}/records`).get();

  const stats = {
    totalRecords: 0,
    totalExams: 0,
    totalConsultations: 0,
    examsToday: 0,
    consultationsToday: 0,
    examsThisMonth: 0,
    consultationsThisMonth: 0,
    patientFileCounts: {},
    uniquePatients: 0,
  };

  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  const monthKey = todayKey.slice(0, 7);

  recordsSnap.docs.forEach((doc) => {
    const d = doc.data();
    const cons = d.isConsultationOnly === true;
    stats.totalRecords += 1;
    if (cons) stats.totalConsultations += 1;
    else stats.totalExams += 1;

    const dateMs = Number(d.dateMs) || Date.parse(d.date) || 0;
    if (dateMs > 0) {
      const recDate = new Date(dateMs);
      const rKey = recDate.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
      const rMonth = rKey.slice(0, 7);
      if (rKey === todayKey) {
        if (cons) stats.consultationsToday += 1;
        else stats.examsToday += 1;
      }
      if (rMonth === monthKey) {
        if (cons) stats.consultationsThisMonth += 1;
        else stats.examsThisMonth += 1;
      }
    }

    const fileId = String(d.patientFileId || '').trim();
    if (fileId) {
      stats.patientFileCounts[fileId] = (stats.patientFileCounts[fileId] || 0) + 1;
    }
  });

  stats.uniquePatients = Object.keys(stats.patientFileCounts).length;

  await db.doc(`users/${userId}/stats/summary`).set({
    ...stats,
    lastReconciledAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { ok: true, stats };
};

module.exports = { recomputeDoctorStats };
```

التسجيل في `functions/index.js`:

```javascript
exports.recomputeDoctorStats = onCall(
  BASE_CALLABLE_OPTIONS,
  lazy('./src/functions/perDoctorStatsReconcile', 'recomputeDoctorStats')
);
```

### 1.4 تعديل الـ Frontend

#### ملف `hooks/useDrHyper/useDrHyper.realtime.ts`

أضف state جديد للـ summary:

```typescript
const [doctorStatsSummary, setDoctorStatsSummary] = useState<DoctorStatsSummary | null>(null);

useEffect(() => {
  if (!user?.uid) return;
  const ref = doc(db, 'users', user.uid, 'stats', 'summary');
  let cancelled = false;

  getDocCacheFirst(ref).then((snap) => {
    if (cancelled) return;
    if (snap.exists()) setDoctorStatsSummary(snap.data() as DoctorStatsSummary);
  });

  return () => { cancelled = true; };
}, [user?.uid]);
```

أضف للـ return:

```typescript
return {
  records,
  readyPrescriptions,
  refreshRecords,
  doctorStatsSummary, // ← جديد
  searchRecordsOnServer,
  fetchRecordsByDateRange,
};
```

#### ملف `components/records/records-view/useRecordsTimeline.ts`

بدل الحساب من الذاكرة، استخدم الـ summary:

```typescript
// في أول الـ useRecordsTimeline:
const statsFromSummary = doctorStatsSummary; // mيصل كـ prop

const stats = useMemo(() => {
  if (statsFromSummary) {
    return {
      examsToday: statsFromSummary.examsToday || 0,
      consultationsToday: statsFromSummary.consultationsToday || 0,
      examsThisMonth: statsFromSummary.examsThisMonth || 0,
      consultationsThisMonth: statsFromSummary.consultationsThisMonth || 0,
      totalThisMonth: (statsFromSummary.examsThisMonth || 0) + (statsFromSummary.consultationsThisMonth || 0),
    };
  }

  // fallback: الحساب القديم من الذاكرة
  // (الكود الموجود حالياً)
}, [allTimelineEntries, todayStr, firstDayOfMonthStr, statsFromSummary]);
```

### 1.5 خطوات التنفيذ (Deploy)

```bash
# 1. كتابة الملفين الجديدين
# 2. اختبار محلي (إن أمكن) عبر firebase emulators
firebase emulators:start --only functions,firestore

# 3. Deploy الـ functions فقط
firebase deploy --only functions:syncDoctorStatsSummary,functions:recomputeDoctorStats

# 4. تشغيل reconcile مرة واحدة للـ backfill
# من Firebase Console أو عبر callable
# هذه تحسب الأرقام للمرة الأولى لكل المستخدمين الموجودين

# 5. راقب Firestore في Firebase Console
# افحص: users/{uid}/stats/summary - لازم يظهر محتوى صح

# 6. بعد يوم أو يومين، deploy الـ frontend
npm run verify
firebase deploy --only hosting
```

### 1.6 اختبارات قبل الـ Deploy

- [ ] حفظ سجل جديد → الـ summary يزيد صح
- [ ] حذف سجل → الـ summary ينقص صح
- [ ] تعديل سجل → الأرقام تفضل صحيحة
- [ ] recomputeDoctorStats يحسب صح من الصفر
- [ ] الـ frontend fallback يشتغل لو الـ summary مش موجود

### 1.7 Rollback

لو حصل مشكلة:

```bash
# الغِ الـ functions
firebase functions:delete syncDoctorStatsSummary recomputeDoctorStats --region=us-central1

# الـ frontend fallback هيشتغل تلقائياً (يحسب من الذاكرة)
```

---

## 🧱 المرحلة 2: ملخصات المرضى

### الهدف
لكل مريض، doc `users/{uid}/patientSummaries/{fileId}` مع:
- totalVisits
- lastVisitAt
- lastVisitType ('exam' | 'consultation')
- firstVisitAt

### الكود

```javascript
// functions/src/functions/patientSummariesCounter.js

const { FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const syncPatientSummary = async (event) => {
  const userId = event.params.userId;
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();

  const db = admin.firestore();

  const updateSummary = async (data, sign) => {
    const fileId = String(data?.patientFileId || '').trim();
    if (!fileId) return;

    const ref = db.doc(`users/${userId}/patientSummaries/${fileId}`);
    const dateMs = Number(data.dateMs) || Date.parse(data.date) || Date.now();
    const visitType = data.isConsultationOnly ? 'consultation' : 'exam';

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const current = snap.exists ? snap.data() : {};

      const newVisits = Number(current.totalVisits || 0) + sign;

      if (newVisits <= 0) {
        tx.delete(ref);
        return;
      }

      const isLaterVisit = !current.lastVisitAt || dateMs > current.lastVisitAt;
      const isEarlierVisit = !current.firstVisitAt || dateMs < current.firstVisitAt;

      tx.set(ref, {
        totalVisits: newVisits,
        patientName: data.patientName || current.patientName || '',
        patientFileNameKey: data.patientFileNameKey || current.patientFileNameKey || '',
        patientFileNumber: data.patientFileNumber || current.patientFileNumber || 0,
        phone: data.phone || current.phone || '',
        ...(sign > 0 && isLaterVisit ? { lastVisitAt: dateMs, lastVisitType: visitType } : {}),
        ...(sign > 0 && isEarlierVisit ? { firstVisitAt: dateMs } : {}),
        lastUpdatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });
  };

  if (!before && after) await updateSummary(after, +1);
  else if (before && !after) await updateSummary(before, -1);
  else if (before && after) {
    if (before.patientFileId !== after.patientFileId) {
      await updateSummary(before, -1);
      await updateSummary(after, +1);
    } else {
      await updateSummary(after, 0);
    }
  }
};

module.exports = { syncPatientSummary };
```

### التسجيل

```javascript
exports.syncPatientSummary = onDocumentWritten(
  { document: 'users/{userId}/records/{recordId}', region: REGION },
  lazy('./src/functions/patientSummariesCounter', 'syncPatientSummary')
);
```

### Frontend

استبدل `buildPatientFiles(records)` في `PatientFilesPage.tsx` بقراءة مباشرة من:
`users/{uid}/patientSummaries` (مع pagination).

---

## 🧱 المرحلة 3: Pagination الحقيقي

### الهدف
تحميل آخر 20 سجل فقط عند الفتح. "Load more" يضيف 20 كمان.

### المتطلبات السابقة
- ✅ المرحلة 1 (عشان الإحصائيات)
- ✅ المرحلة 2 (عشان ملفات المرضى)
- ✅ dateMs على كل السجلات (موجود بالفعل)

### الكود

```typescript
// hooks/useDrHyper/useDrHyper.realtime.ts
const PAGE_SIZE = 20;

const [loadedCursor, setLoadedCursor] = useState<number | null>(null);
const [hasMore, setHasMore] = useState(true);

const loadInitialPage = useCallback(async () => {
  if (!user?.uid) return;
  const q = query(
    collection(db, 'users', user.uid, 'records'),
    orderBy('dateMs', 'desc'),
    limit(PAGE_SIZE + 1),
  );
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, PAGE_SIZE);
  setRecords(docs.map(toRecord));
  setHasMore(snap.docs.length > PAGE_SIZE);
  if (docs.length > 0) {
    const last = docs[docs.length - 1].data();
    setLoadedCursor(Number(last.dateMs));
  }
}, [user?.uid]);

const loadMore = useCallback(async () => {
  if (!user?.uid || !loadedCursor || !hasMore) return;
  const q = query(
    collection(db, 'users', user.uid, 'records'),
    orderBy('dateMs', 'desc'),
    where('dateMs', '<', loadedCursor),
    limit(PAGE_SIZE + 1),
  );
  const snap = await getDocs(q);
  const docs = snap.docs.slice(0, PAGE_SIZE);
  setRecords((prev) => [...prev, ...docs.map(toRecord)]);
  setHasMore(snap.docs.length > PAGE_SIZE);
  if (docs.length > 0) {
    const last = docs[docs.length - 1].data();
    setLoadedCursor(Number(last.dateMs));
  }
}, [user?.uid, loadedCursor, hasMore]);
```

### UI

```tsx
{hasMore && (
  <button onClick={loadMore}>
    تحميل 20 سجل أقدم
  </button>
)}
```

---

## 🔍 المراقبة (Monitoring)

### 1. Firebase Console
- راقب `Firestore Usage` يومياً بعد الـ deploy
- لو القراءات زادت فجأة = فيه مشكلة

### 2. Budget Alert
ضيف تنبيه من Firebase Console على:
- فاتورة شهرية > $5
- فاتورة يومية > $0.50

### 3. Drift Detection
كل أسبوع، قارن:
- `summary.totalRecords` vs `records` collection count
- لو فيه فرق > 5% → شغّل `recomputeDoctorStats`

---

## ⚠️ مخاطر يجب تجنبها

1. **لا تعمل wildcard triggers** (`{collection}/{docId}` بدون مسار محدد)
   - دي اللي سببت مشكلة $20/شهر في 2026-04
2. **لا minInstances > 0** إلا لو ضروري جداً
3. **لا schedules أقل من 15 دقيقة**
4. **لا تعتمد على الـ counter 100%** - دائماً فيه fallback في الـ frontend

---

## 📊 التوفير المتوقع

### على مقياس 1000 طبيب × 1000 مريض

| المرحلة | القراءات/يوم | التكلفة/شهر | التوفير من الأساس |
|---|---|---|---|
| بدون تحسين | 5M | $90 | 0% |
| + مرحلة 1 | 5M | $85 | 6% |
| + مرحلة 2 | 4.5M | $75 | 17% |
| + مرحلة 3 | 300K | $5 | **95%** |

---

## 🎯 خلاصة

- **دلوقتي (pre-launch، 100 مريض):** لا حاجة لأي مرحلة
- **عند 100 طبيب:** ابدأ المرحلة 1
- **عند 500 طبيب:** المرحلة 2
- **عند 1000+ طبيب:** المرحلة 3

كل مرحلة مستقلة وcan be deployed separately.

---

## 🔗 ملفات ذات صلة

- [useDrHyper.realtime.ts](../hooks/useDrHyper/useDrHyper.realtime.ts) - به dateMs field (جاهز للمرحلة 3)
- [useDrHyper.saveRecord.ts](../hooks/useDrHyper/useDrHyper.saveRecord.ts) - يكتب dateMs على كل save
- [functions/index.js](../functions/index.js) - به أمثلة counter functions للمدير
- [functions/src/functions/dashboardCounterFunctions.js](../functions/src/functions/dashboardCounterFunctions.js) - نمط مشابه للـ per-doctor
