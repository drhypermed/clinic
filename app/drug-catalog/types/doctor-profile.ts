// ─────────────────────────────────────────────────────────────────────────────
// أنواع ملف الطبيب العام ومراجعات الجمهور (Doctor Public Profile)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - DoctorClinicScheduleRow: سطر من مواعيد العمل
//   - DoctorClinicServiceRow: سطر من الخدمات والأسعار
//   - DoctorAdProfile: ملف الطبيب الكامل للعرض في الدليل العام
//   - PublicUserBooking: حجز من جمهور مسجل (غير حجوزات السكرتارية)
//   - DoctorPublicReview: مراجعة عامة من مريض بعد الكشف
// ─────────────────────────────────────────────────────────────────────────────

/** صف واحد في جدول مواعيد عمل الطبيب (مثلاً: الأحد من 10ص إلى 2م) */
export interface DoctorClinicScheduleRow {
  id: string;
  day: string;
  from: string;
  to: string;
  notes?: string;
}

/** صف واحد في جدول الخدمات والأسعار في ملف الطبيب (مثلاً: كشف عام 300ج) */
export interface DoctorClinicServiceRow {
  id: string;
  name: string;
  price: number | null;
  discountedPrice?: number | null;
}

/**
 * فرع واحد من فروع الطبيب داخل إعلانه العام.
 * كل فرع ليه عنوانه ومواعيده وأسعاره وخدماته وصوره المستقلة،
 * عشان الطبيب اللي عنده أكتر من عيادة يقدر يعرض كل فرع بتفاصيله
 * من غير ما يخسر الفروع التانية.
 */
export interface DoctorAdBranch {
  id: string;
  /** اسم الفرع اللي الطبيب بيسميه (مثلاً: "فرع المعادي") — يظهر للجمهور. */
  name: string;

  // العنوان
  governorate: string;
  city: string;
  addressDetails: string;

  // التواصل (كل فرع ممكن يكون له رقمه المستقل)
  contactPhone: string;
  whatsapp: string;

  // المواعيد والخدمات والأسعار
  clinicSchedule: DoctorClinicScheduleRow[];
  clinicServices: DoctorClinicServiceRow[];
  examinationPrice: number | null;
  discountedExaminationPrice: number | null;
  consultationPrice: number | null;
  discountedConsultationPrice: number | null;

  // صور الفرع
  imageUrls: string[];
}

/**
 * وسيلة تواصل إضافية في ملف الطبيب (فيسبوك، تويتر، إنستا ...).
 * النوع داخلي فقط (مش مُصدَّر) لأنه جزء تفصيلي من DoctorAdProfile.
 */
interface DoctorSocialLink {
  id: string;
  platform: string;
  url: string;
}

/**
 * ملف الطبيب العام (الإعلاني) — ده اللي بيظهر في دليل الأطباء للجمهور.
 * الحقول الاختيارية متفاوتة: بعضها للاشتراك المميز فقط، وبعضها إحصائيات داخلية.
 */
export interface DoctorAdProfile {
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  academicDegree?: string;
  subSpecialties?: string;
  featuredServicesSummary?: string;
  workplace?: string;
  extraInfo?: string;
  profileImage?: string;
  clinicName?: string;
  bio: string;

  // ─── فروع الطبيب (الهيكل الجديد) ───
  // كل فرع بعنوانه ومواعيده وأسعاره وصوره مستقلة.
  // الإعلان الحديث يكتب هنا. الحقول القديمة تحت هي لـbackwards-compat
  // مع الإعلانات اللي اتحفظت قبل ما ندعم تعدد الفروع.
  branches?: DoctorAdBranch[];

  // ─── الحقول القديمة (Legacy — للتوافق مع بيانات قبل تعدد الفروع) ───
  // عند التحميل: لو الإعلان ما فيهوش branches، بنعمل فرع افتراضي
  // من الحقول دي. عند الحفظ الجديد: بنكتب الحقول دي من أول فرع
  // عشان أي كود قديم ما بيقراش branches لسه يلاقي قيم صالحة.
  governorate: string;
  city: string;
  addressDetails: string;

  clinicSchedule: DoctorClinicScheduleRow[];
  clinicServices: DoctorClinicServiceRow[];
  examinationPrice: number | null;
  discountedExaminationPrice?: number | null;
  consultationPrice: number | null;
  discountedConsultationPrice?: number | null;
  services: string[];
  imageUrls: string[];

  // التواصل — contactPhone/whatsapp بقوا per-branch كمان، دول legacy.
  contactPhone?: string;
  whatsapp?: string;
  socialLinks?: DoctorSocialLink[];
  socialMediaPlatform?: string; // حقول توافق قديم — استخدم socialLinks في الكود الجديد
  socialMediaUrl?: string;

  // سنوات الخبرة والتقييمات
  yearsExperience: number | null;
  ratingAverage?: number;
  ratingCount?: number;
  ratingTotal?: number;

  // حالة النشر
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;

  // ─── نوع الحساب والاشتراك ───
  // free = مجاني | premium = برو (بيظهر "برو" في الـ UI) | pro_max = برو ماكس
  accountType?: 'free' | 'premium' | 'pro_max';
  premiumStartDate?: string;
  premiumExpiryDate?: string;
  premiumNotificationSent?: boolean; // هل اتبعت له إشعار تجديد

  // ─── استهلاك الموارد (للإحصائيات والحدود) ───
  storageUsageBytes?: number; // استهلاك التخزين
  aiApiCallsCount?: number;   // عدد استدعاءات الذكاء الاصطناعي
  aiTokensUsed?: number;      // عدد الـ tokens المستخدمة
  lastStorageUpdateAt?: string;

  // ─── روابط عامة وحالة النشاط ───
  publicSlug?: string;   // معرف آمن للروابط العامة (بديل عن UID لأسباب أمنية)
  lastActiveAt?: string;
  isActive?: boolean;
}

/**
 * حجز من مستخدم عام (مسجل في فورم الجمهور) — غير حجوزات السكرتارية.
 * بيظهر في صفحة "حجوزاتي" للمريض، وبنستخدمه في تجميع المراجعات بعد الكشف.
 */
export interface PublicUserBooking {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  dateTime: string;
  createdAt: string;
  patientName: string;
  phone: string;
  visitReason?: string;
  appointmentType?: 'exam' | 'consultation';

  // ربط بالاستشارة بعد كشف سابق (لو Applicable)
  consultationSourceAppointmentId?: string;
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;

  // الحالة والمراجعة
  status?: 'pending' | 'completed';
  completedAt?: string;
  rating?: number;
  reviewComment?: string;
  reviewedAt?: string;
}

/**
 * مراجعة عامة يضيفها المريض بعد الكشف — ده اللي بيظهر في ملف الطبيب العام
 * ويساعد في التقييمات (ratingAverage في DoctorAdProfile).
 */
export interface DoctorPublicReview {
  id: string;
  doctorId: string;
  bookingId: string;
  publicUserId: string;
  rating: number;
  reviewComment?: string;
  reviewedAt: string;
  patientName?: string;
}
