// ─────────────────────────────────────────────────────────────────────────────
// إعدادات تصميم الروشتة (Prescription Design Settings)
// ─────────────────────────────────────────────────────────────────────────────
// الملف ده فيه كل الأنواع المتعلقة بتنسيق شكل الروشتة المطبوعة:
//   - TextStyle: قاعدة موحدة لتنسيق أي نص (لون، خط، ظل، حدود ...)
//   - PrescriptionHeaderSettings: إعدادات هيدر الروشتة (معلومات الطبيب)
//   - PrescriptionFooterSettings: إعدادات فوتر الروشتة (معلومات العيادة)
//   - SystemRequest*: إعدادات السطر الترويجي في الفوتر (سوشيال ميديا/تواصل)
//   - PrescriptionMiddleSettings: منتصف الروشتة (خلفية + خطوط)
//   - VitalSignConfig, CustomBox, VitalsSectionSettings: إعدادات قسم العلامات الحيوية
//   - PaperSizeSettings: مقاس الورقة والهوامش وضبط الطباعة
//   - PrescriptionTypographySettings: أحجام وألوان النصوص داخل الروشتة
//   - PrescriptionSettings: الـ entity الرئيسي اللي بيجمع كل اللي فوق
// ─────────────────────────────────────────────────────────────────────────────

/**
 * قاعدة تنسيق نص مشتركة تُستخدم في أي عنصر نصي في الروشتة (اسم الطبيب، الشعار، الفوتر ...).
 * فايدة وجود Type موحد: لو عايز تضيف خاصية جديدة (مثلاً ظل للنص) هتضيفها في مكان واحد.
 */
export interface TextStyle {
  // التنسيق الأساسي
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';

  // التموضع (للتحكم الدقيق في مكان النص)
  xOffset?: number; // إزاحة أفقية بالـ px
  yOffset?: number; // إزاحة رأسية بالـ px

  // التخطيط (Outline/Stroke) حول النص
  textStrokeWidth?: number;    // سُمك الحد (0-5 px)
  textStrokeColor?: string;    // لون الحد (hex)

  // خلفية النص
  textBgColor?: string;        // لون الخلفية (hex)
  textBgOpacity?: number;      // شفافية الخلفية (0-1)
  textBgRadius?: number;       // تدوير الزوايا (0-20 px)
  textBgPadding?: number;      // حشوة موحدة (للتوافق مع الإصدارات القديمة)
  textBgPaddingTop?: number;   // حشوة علوية
  textBgPaddingRight?: number; // حشوة يمنى
  textBgPaddingBottom?: number;// حشوة سفلية
  textBgPaddingLeft?: number;  // حشوة يسرى
  textBgBorderWidth?: number;  // سُمك الحدود (0-10 px)
  textBgBorderColor?: string;  // لون الحدود (hex)

  // التباعد (Spacing)
  lineHeight?: number;         // مضاعف سطر (0.8-3)
  letterSpacing?: number;      // تباعد الحروف بالـ px (-2 إلى 10)
}

/**
 * إعدادات هيدر الروشتة — أعلى الورقة فيها بيانات الطبيب والشعار.
 * نسخ HTML (*Html) بتستخدم عشان نحتفظ بالتنسيق الغني (bold, italic ...) اللي عمله الطبيب
 * في الـ editor، بدل ما نخزن النص فقط.
 */
export interface PrescriptionHeaderSettings {
  doctorName: string;
  doctorNameHtml?: string;
  doctorNameEn?: string;
  degrees: string[];
  degreesHtml?: string;
  degreesHtmlLines?: string[]; // HTML لكل سطر مستقل
  specialties: string[];
  specialtiesHtml?: string;
  specialtiesHtmlLines?: string[]; // HTML لكل سطر مستقل

  // الشعار
  logoBase64?: string;
  logoWidth?: number; // px
  logoPosX?: number;  // % — الموضع الأفقي للشعار
  logoPosY?: number;  // % — الموضع الرأسي للشعار
  logoOpacity?: number; // 0-1

  // ألوان وتيمات الهيدر
  headerTheme?: 'classic' | 'modern-blue' | 'medical-green' | 'pink' | 'dark' | 'custom';
  backgroundColor?: string;
  backgroundColorOpacity?: number; // 0-1
  borderColor?: string;
  headerBackgroundImage?: string; // صورة خلفية مخصصة (Base64)
  headerBackgroundOpacity?: number; // 0-1
  headerBgScale?: number; // حجم الصورة كنسبة مئوية (10-200)
  headerBgPosX?: number; // الموضع الأفقي (0-100)
  headerBgPosY?: number; // الموضع الرأسي (0-100)

  // الحد السفلي للهيدر
  showBottomBorder?: boolean;
  bottomBorderColor?: string;
  bottomBorderOpacity?: number; // 0-1

  // شريط المعلومات (الاسم / العمر / التاريخ) تحت الهيدر مباشرة
  nameLabel?: string;
  ageLabel?: string;
  dateLabel?: string;
  nameLabelStyle?: TextStyle;
  ageLabelStyle?: TextStyle;
  dateLabelStyle?: TextStyle;
  infoBarBackgroundColor?: string;
  infoBarBackgroundOpacity?: number; // 0-1
  infoBarLabelColor?: string;
  infoBarValueColor?: string;
  showInfoBarBottomBorder?: boolean;
  infoBarBorderColor?: string;
  infoBarBorderOpacity?: number; // 0-1
  infoBarBorderWidth?: number; // px
  showInfoBarDividers?: boolean;
  infoBarDividerColor?: string;
  infoBarDividerWidth?: number; // px
  infoBarDividerOpacity?: number; // 0-1

  // الفواصل الرأسية داخل شريط المعلومات (كل فاصل له إعداداته المستقلة)
  showInfoBarDivider1?: boolean;
  infoBarDivider1Color?: string;
  infoBarDivider1Width?: number;
  infoBarDivider1Opacity?: number;
  infoBarDivider1OffsetX?: number;
  infoBarDivider1OffsetY?: number;
  showInfoBarDivider2?: boolean;
  infoBarDivider2Color?: string;
  infoBarDivider2Width?: number;
  infoBarDivider2Opacity?: number;
  infoBarDivider2OffsetX?: number;
  infoBarDivider2OffsetY?: number;

  // تنسيق النصوص
  doctorNameStyle?: TextStyle;
  degreesStyle?: TextStyle;
  degreesLineStyles?: TextStyle[]; // تنسيق مختلف لكل سطر من الدرجات
  specialtiesStyle?: TextStyle;
  specialtiesLineStyles?: TextStyle[]; // تنسيق مختلف لكل سطر من التخصصات
}

/** نوع أيقونة التواصل في سطر الفوتر (اختيار محدود بدل ما ندخل أي نص) */
export type SystemRequestContactIcon =
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'telegram'
  | 'phone'
  | 'link'
  | 'custom';

/** بيانات وسيلة تواصل واحدة في سطر الفوتر (مثلاً: واتساب العيادة) */
export interface SystemRequestContact {
  id: string;
  enabled: boolean;
  label: string;
  value?: string;
  url: string;
  icon: SystemRequestContactIcon;
  color?: string;
  showIcon?: boolean;
}

/** تنسيق نص سطر الفوتر الترويجي */
export interface SystemRequestLineStyle {
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  textColor: string;
}

/**
 * إعدادات السطر الترويجي في الفوتر.
 * الحقول showWhatsApp / showFacebook وما شابهها موجودة للتوافق مع نسخة قديمة قبل
 * ما نوحّد كل الوسائل في مصفوفة contacts. استخدامها كـ fallback عند الحاجة.
 */
export interface SystemRequestLineSettings {
  showLine: boolean;
  showIcons: boolean;
  message: string;
  lineStyle: SystemRequestLineStyle;
  contacts: SystemRequestContact[];

  // حقول توافق قديمة — المصفوفة contacts هي المصدر الرئيسي
  showWhatsApp?: boolean;
  whatsappNumber?: string;
  whatsappUrl?: string;
  showFacebook?: boolean;
  facebookLabel?: string;
  facebookUrl?: string;
}

/**
 * إعدادات فوتر الروشتة — أسفل الورقة فيها بيانات العيادة والتواصل.
 * زي الهيدر، النسخ *Html بتحتفظ بالتنسيق الغني.
 */
export interface PrescriptionFooterSettings {
  address: string;
  addressHtml?: string;
  workingHours: string;
  workingHoursHtml?: string;
  consultationPeriod: string;
  consultationPeriodHtml?: string;

  // التليفون
  phoneNumber: string;
  phoneNumberHtml?: string;
  phoneLabel?: string; // نص "للحجز والاستفسار (اتصال)"
  phoneLabelHtml?: string;
  showPhoneIcon?: boolean;

  // الواتساب
  whatsappNumber: string;
  whatsappNumberHtml?: string;
  whatsappLabel?: string;
  whatsappLabelHtml?: string;
  showWhatsappIcon?: boolean;

  // السوشيال ميديا
  socialMediaHandle: string;
  socialMediaHtml?: string;
  showSocialMedia: boolean;
  socialMediaLabel?: string; // نص قبل الأيقونات (مثل "لمتابعة الفيديوهات الطبية الخاصة بنا :")
  socialMediaLabelHtml?: string;
  socialMediaLabelStyle?: TextStyle;

  // إعدادات تصميم الفوتر (شبيهة بالهيدر)
  footerBackgroundImage?: string;
  footerBgOpacity?: number;
  footerBgScale?: number; // 10-200
  footerBgPosX?: number; // 0-100
  footerBgPosY?: number; // 0-100
  backgroundColor?: string;
  backgroundColorOpacity?: number;
  showTopBorder?: boolean;
  topBorderColor?: string;
  topBorderOpacity?: number;

  // شعار الفوتر
  logoBase64?: string;
  logoWidth?: number;
  logoPosX?: number;
  logoPosY?: number;
  logoOpacity?: number;

  // تنسيق النصوص
  addressStyle?: TextStyle;
  workingHoursStyle?: TextStyle;
  consultationPeriodStyle?: TextStyle;
  phoneLabelStyle?: TextStyle; // تنسيق تسمية التليفون
  phoneStyle?: TextStyle;      // تنسيق رقم التليفون
  whatsappLabelStyle?: TextStyle;
  whatsappStyle?: TextStyle;
  socialStyle?: TextStyle;

  // أنماط الأيقونات (منفصلة عن تنسيق النصوص عشان نتحكم في حجم ولون الأيقونة لوحدها)
  phoneIconStyle?: {
    color?: string;
    size?: number;
    xOffset?: number;
    yOffset?: number;
  };
  whatsappIconStyle?: {
    color?: string;
    size?: number;
    xOffset?: number;
    yOffset?: number;
  };

  // إعدادات أيقونات السوشيال ميديا
  showFacebookIcon?: boolean;
  showInstagramIcon?: boolean;
  showYouTubeIcon?: boolean;
  showTikTokIcon?: boolean;
  facebookIconStyle?: { color?: string; size?: number; xOffset?: number; yOffset?: number };
  instagramIconStyle?: { color?: string; size?: number; xOffset?: number; yOffset?: number };
  youtubeIconStyle?: { color?: string; size?: number; xOffset?: number; yOffset?: number };
  tiktokIconStyle?: { color?: string; size?: number; xOffset?: number; yOffset?: number };
}

/**
 * إعدادات منتصف الروشتة — الخلفية والخطوط الخاصة بالمحتوى الرئيسي (الأدوية والتعليمات).
 */
export interface PrescriptionMiddleSettings {
  middleBackgroundImage?: string; // خلفية بصورة (Base64)
  middleBgOpacity?: number; // 0-1
  middleBgScale?: number;   // 10-200
  middleBgPosX?: number;    // 0-100
  middleBgPosY?: number;    // 0-100
  middleBgColor?: string;   // لون خلفية (hex)
  middleBgColorOpacity?: number; // 0-1
  arabicFont?: string;   // الخط العربي
  englishFont?: string;  // الخط الإنجليزي
  arabicStyle?: TextStyle;  // تنسيق العربي الكامل
  englishStyle?: TextStyle; // تنسيق الإنجليزي الكامل
}

/** إعداد علامة حيوية واحدة في قسم Vitals (إظهار/إخفاء، ترتيب، وحدة) */
export interface VitalSignConfig {
  key: string;
  label: string;
  labelAr: string;
  unit: string;
  enabled: boolean;
  order: number;
}

/**
 * مربع مخصص يضيفه الطبيب بجانب العلامات الحيوية
 * (مثل "ملاحظات الممرضة" أو "تشخيص مبدئي" أو أي حقل إضافي).
 */
export interface CustomBox {
  id: string;
  label: string;
  value?: string;
  enabled: boolean;
  order: number;
}

/** إعدادات قسم Vitals & Measurements (الشكل، الألوان، تنسيق القيم) */
export interface VitalsSectionSettings {
  title?: string; // اسم القسم (افتراضي: "Vitals & measurements")
  titleStyle?: TextStyle;
  titleUnderlineColor?: string;
  titleUnderlineWidth?: number;
  titleUnderlineOpacity?: number;
  backgroundColor?: string;
  backgroundColorOpacity?: number;
  borderColor?: string;
  borderOpacity?: number;
  itemBackgroundColor?: string;      // لون خلفية كل علامة حيوية
  itemBackgroundColorOpacity?: number;
  itemBorderColor?: string;
  itemBorderColorOpacity?: number;
  labelStyle?: TextStyle; // تنسيق تسمية العنصر (مثلاً "Weight")
  valueStyle?: TextStyle; // تنسيق الرقم
  unitStyle?: TextStyle;  // تنسيق الوحدة (مثلاً "kg")
  itemsOffsetX?: number; // إزاحة أفقية لكل العناصر
  itemsOffsetY?: number; // إزاحة رأسية لكل العناصر
  width?: number; // عرض العناصر كنسبة % من عرض القسم (افتراضي: 100)
}

/**
 * إعدادات مقاس ورقة الروشتة والهوامش والطباعة.
 * printScale/printOffsetX/printOffsetY مهمين جداً عشان حل مشكلة قص الأطراف
 * اللي بتحصل مع الطابعات المختلفة — ده ضبط دقيق لكل طبيب حسب طابعته.
 */
export interface PaperSizeSettings {
  size: 'A5' | 'A4' | 'custom';
  customWidth?: number;   // mm — يُستخدم فقط عند size === 'custom'
  customHeight?: number;  // mm — يُستخدم فقط عند size === 'custom'
  marginTop?: number;     // mm — هامش داخلي (padding) — لا يغير حجم الورقة
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;

  // ضبط الطباعة الدقيق (لحل مشكلة قص الأطراف بالطابعات المختلفة)
  printScale?: number;    // نسبة تصغير المحتوى عند الطباعة (0.5–1.0، افتراضي: 1.0)
  printOffsetX?: number;  // إزاحة أفقية بالـ mm (سالب=يسار، موجب=يمين)
  printOffsetY?: number;  // إزاحة رأسية بالـ mm (سالب=أعلى، موجب=أسفل)
}

/**
 * إعدادات أحجام الخطوط والمسافات والألوان داخل منتصف الروشتة فقط.
 * ملاحظة: إعدادات الهيدر/الفوتر/الجانبي موجودة في تاباتها الخاصة.
 */
export interface PrescriptionTypographySettings {
  // ── أحجام الخطوط (px) ──
  medNamePx?: number;        // اسم الدواء (افتراضي 13)
  medInstPx?: number;        // جرعة الدواء (افتراضي 12)
  notesPx?: number;          // الفحوصات والتعليمات الهامة (افتراضي 12)
  notePx?: number;           // الملاحظات الحرة بين الأدوية (افتراضي 15)
  clinicalInfoPx?: number;   // معلومات الكشف الإكلينيكية (افتراضي 8.5)
  rxSymbolPx?: number;       // رمز "Rx" (افتراضي 20)

  // ── الألوان لكل عنصر نص ──
  medNameColor?: string;
  medInstColor?: string;
  notesColor?: string;
  noteColor?: string;
  clinicalInfoColor?: string;
  rxSymbolColor?: string;

  // ── نوع الخط لكل عنصر نص ──
  medNameFontFamily?: string;
  medInstFontFamily?: string;
  notesFontFamily?: string;
  noteFontFamily?: string;
  clinicalInfoFontFamily?: string;
  rxSymbolFontFamily?: string;

  // ── مسافات (px) ──
  rowMinHeightPx?: number;       // المسافة بين أسطر الفحوصات/التعليمات (افتراضي 18)
  drugRowPaddingPx?: number;     // المسافة الرأسية حول كل صف دواء (افتراضي 2)

  // ── حدود الأدوية (الخط الفاصل بين كل دواء) ──
  drugBorderWidthPx?: number;    // سُمك الخط (افتراضي 1، 0=بدون)
  drugBorderColor?: string;      // لون الخط (افتراضي #f1f5f9)

  // ── مربع معلومات الكشف الإكلينيكية ──
  clinicalBoxBgColor?: string;       // خلفية المربع (افتراضي slate-50/50)
  clinicalBoxBorderColor?: string;   // حدود المربع (افتراضي slate-100)
  clinicalBoxBorderWidthPx?: number; // سُمك الحدود (افتراضي 1، 0=بدون)

  // ── عناوين الأقسام ("فحوصات مطلوبة :" و "تعليمات هامة :") ──
  sectionTitlePx?: number;       // حجم العناوين (افتراضي = نفس notesPx)
  sectionTitleColor?: string;    // لون العناوين (افتراضي #7f1d1d)
  sectionTitleFontFamily?: string; // خط العناوين
}

/**
 * الـ entity الرئيسي اللي بيجمع كل إعدادات الروشتة.
 * ده اللي بيتخزن في Firestore تحت حساب كل طبيب.
 * updatedAt بنستخدمه في مقارنة الإعدادات المحلية والسحابية وحل التعارض.
 */
export interface PrescriptionSettings {
  paperSize?: PaperSizeSettings;              // مقاس الورقة والهوامش
  typography?: PrescriptionTypographySettings; // أحجام الخطوط والمسافات
  header: PrescriptionHeaderSettings;
  footer: PrescriptionFooterSettings;
  middle?: PrescriptionMiddleSettings;
  vitals: VitalSignConfig[];
  vitalsSection?: VitalsSectionSettings;
  customBoxes?: CustomBox[];    // المربعات المخصصة
  updatedAt: number;            // Timestamp للمقارنة والمزامنة
}
