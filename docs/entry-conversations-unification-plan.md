# خطة توحيد Collections للتواصل بين الطبيب والسكرتيرة

> **الحالة:** خطة مقترحة — تتطلب موافقة قبل التنفيذ.  
> **التاريخ:** 2026-05-11  
> **الهدف:** توحيد 4 collections في collection واحد لتقليل التكلفة والتعقيد.

---

## 1. الوضع الحالي

عمليات التواصل بين الطبيب والسكرتيرة موزّعة على **4 collections** + حقول متعددة في `bookingConfig`:

| Collection | الغرض | حجم البيانات |
|---|---|---|
| `bookingConfig/{secret}` | إعدادات + entryAlert + doctorEntryResponse + approvedIds + lastExamOpenedAt | كبير (mixed) |
| `secretaryEntryRequests/{secret}` | طلبات السكرتيرة للطبيب | صغير |
| `secretaryEntryAlertResponse/{secret}` | رد السكرتيرة على alerts الطبيب | صغير |
| `secretaryApprovedEntryIds/{secret}` | قائمة المواعيد المعتمدة | صغير-متوسط |

### مشاكل التصميم الحالي
1. **عملية واحدة = كتابات في docs متعددة:** الرد على طلب يكتب في 2-3 docs منفصلة → reads + writes + triggers مضاعفة.
2. **Dual-write للتوافق:** كل حقل له `flat` و `byBranch` نسخة → عملية واحدة تكتب نفس البيانات في مكانين.
3. **صعوبة الـquerying:** لا يمكن جلب "تاريخ كل التواصل لموعد معين" بـquery واحد.
4. **التكلفة:** 1000 طبيب × 100 تواصل/يوم × 4 docs × 2 dual-write = ~800k reads/writes يومياً (≈$0.50/يوم).

---

## 2. الوضع المستهدف

**Collection واحد:** `entryConversations/{conversationId}`

### Schema المقترح
```typescript
interface EntryConversation {
  id: string;                                  // auto-generated
  secret: string;                              // booking secret للفرع
  doctorUserId: string;                        // معرّف الطبيب
  branchId: string;                            // الفرع
  appointmentId: string;                       // الموعد
  
  direction: 'D2S' | 'S2D';                    // اتجاه الطلب
  status: 'pending' | 'approved' | 'rejected'; // حالة الطلب
  
  // البيانات المرفقة
  patientName: string;
  patientInfo?: {
    age?: string;
    gender?: 'male' | 'female';
    pregnant?: boolean;
    breastfeeding?: boolean;
    visitReason?: string;
  };
  appointmentType?: 'exam' | 'consultation';
  consultationSource?: { /* ... */ };
  
  // التاريخ
  createdAt: Timestamp;                        // server timestamp
  respondedAt?: Timestamp;
  examOpenedAt?: Timestamp;
  
  // للـquery
  isActive: boolean;                           // pending → indexed for fast lookup
}
```

### الـIndexes المطلوبة
```json
[
  { "fields": ["secret", "branchId", "isActive", "createdAt DESC"] },
  { "fields": ["doctorUserId", "isActive", "createdAt DESC"] },
  { "fields": ["appointmentId", "createdAt DESC"] }
]
```

### الـRules
```
match /entryConversations/{convId} {
  // الطبيب يقدر يقرأ ويكتب على conversations فرعه
  // السكرتيرة عبر custom token (secretary:secret:branchId) تقرأ secret + branchId الخاصين بيها
}
```

---

## 3. مكاسب التوحيد

| القياس | قبل | بعد | تحسين |
|---|---|---|---|
| Docs/operation | 2-3 | 1 | ~66% أقل writes |
| Reads للـUI | 4 subscriptions | 1 subscription | 75% أقل reads |
| تعقيد الكود | 4 ملفات + dual-write | ملف واحد | ~70% أقل سطور |
| ميزات جديدة | تعديل 4 أماكن | تعديل واحد | x4 سرعة |
| تكلفة 1k طبيب | $0.50/يوم | $0.15/يوم | 70% توفير |

---

## 4. خطة التنفيذ المرحلية

### المرحلة 1 — التأسيس (يوم واحد)
1. إنشاء `entryConversations/` collection بـschema الجديد
2. إنشاء Cloud Function `createEntryConversation` (للكتابة الآمنة)
3. إنشاء Cloud Function `respondToEntryConversation`
4. تحديث `firestore.rules` للـcollection الجديدة
5. تحديث `firestore.indexes.json`
6. **عدم تشغيل أي client على الجديد بعد** — البنية فقط جاهزة

### المرحلة 2 — Dual-write transition (يومين)
1. تحديث `entryConversations.ts` (الواجهة) لتكتب على الـcollection الجديدة **بالإضافة للقديمة**
2. إبقاء الـreads على القديمة (subscribers لسه يقرأوا من القديم)
3. كل عميل يحدّث = يكتب في الجديد ويظل يقرأ من القديم
4. **مراقبة الـlogs:** نتأكد إن كل العمليات الجديدة بتظهر في الـcollection الجديدة

### المرحلة 3 — Migration أسبوع كامل
1. كتابة Cloud Function `migrateExistingConversations` (one-time)
2. تشغيلها لنقل البيانات القديمة (آخر 30 يوم) للـcollection الجديدة
3. مراقبة الـintegrity (sample 100 conversations والتأكد من تطابق البيانات)

### المرحلة 4 — تحويل الـreads (يوم واحد)
1. تحديث `entryConversations.ts.subscribe*` لتقرأ من الـcollection الجديدة
2. مراقبة 24 ساعة — مفيش regressions
3. تعطيل الكتابة على الـcollections القديمة

### المرحلة 5 — التنظيف (يوم واحد)
1. حذف ملفات `booking-secretary/entryAlerts.ts` + `entryRequests.ts` + `subscribers`
2. تنظيف `bookingConfig` من الحقول القديمة (entryAlert, doctorEntryResponse, etc.)
3. حذف الـrules للـcollections القديمة
4. **عدم حذف الـcollections القديمة فعلياً لمدة 30 يوم** (احتياطي)
5. بعد 30 يوم → حذف فعلي

---

## 5. المخاطر والـMitigation

| المخاطر | الاحتمال | الـMitigation |
|---|---|---|
| عميل قديم يستمر يكتب على القديم بعد التحويل | عالي | dual-write يظل شغّال لمدة شهر |
| Migration script يفشل في منتصف العمل | متوسط | idempotent + resumable + dry-run mode |
| Race condition بين dual-write والـmigration | متوسط | استخدام Firestore transactions |
| اختلاف بين القديم والجديد بعد migration | منخفض | reconciliation script يقارن sample |
| الـrules الجديدة تمنع عميل قديم | منخفض | الـrules القديمة تفضل شغّالة في المرحلتين 2-3 |

---

## 6. الـRollback Plan

في حال اكتشاف مشكلة في أي مرحلة:
- **المرحلة 1-2:** rollback آمن — العمل القديم لم يتأثر.
- **المرحلة 3:** إيقاف الـmigration. القديم لسه يحتوي على البيانات.
- **المرحلة 4:** revert الـclient code لقراءة من القديم. الـ dual-write يضمن sync.
- **المرحلة 5:** بعد الحذف، الـrollback يتطلب backup restore (Firestore daily backup).

---

## 7. تقدير الجهد

| المرحلة | الوقت | المخاطر |
|---|---|---|
| 1 — التأسيس | 6-8 ساعات | منخفضة |
| 2 — Dual-write | 4-6 ساعات | منخفضة |
| 3 — Migration | يوم + مراقبة | متوسطة |
| 4 — تحويل reads | 4 ساعات + مراقبة 24h | متوسطة |
| 5 — التنظيف | 3 ساعات | منخفضة |
| **الإجمالي** | **~25 ساعة عمل + أسبوع مراقبة** | متوسطة |

---

## 8. متى يستحق هذا؟

**يستحق التنفيذ لو:**
- عدد الأطباء وصل لـ500+ (التكلفة بدأت تظهر)
- في خطط لإضافة ميزات جديدة على نظام التواصل
- في bugs متكررة في الـdual-write أو الـsubscribers

**يمكن تأجيله لو:**
- النظام شغّال والتكلفة معقولة
- الفريق صغير ومافيش وقت للـmigration المراقَبة
- في أولويات أعلى (security, features, growth)

---

## 9. القرار

**لم يتم البت بعد.** هذه خطة مكتوبة جاهزة للتنفيذ متى ما تم اتخاذ القرار.

**للموافقة:** يجب تأكيد:
1. وقت متاح للـmonitoring اليومي خلال الـmigration
2. ممكن نوقّف ميزات جديدة لأسبوع
3. الـbackup Firestore اليومي مفعّل (للـrollback لو فشل التنفيذ)
