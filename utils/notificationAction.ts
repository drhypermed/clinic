/** 
 * نظام تحليل ردود الأفعال (Notification Action Resolver):
 * يقوم هذا النظام بتحليل الكلمات والرموز المارة من الإشعارات (Push Notifications) 
 * لتحديد ما إذا كان المستخدم قد ضغط على "موافقة" أو "رفض".
 * يدعم اللغتين العربية والإنجليزية، والعديد من الصيغ المختلفة للقيم (True/False, 1/0, Yes/No).
 */
type NotificationActionStatus = 'approved' | 'rejected';


/** القيم التي تعني "موافقة" أو "سماح بالدخول" */
const APPROVED_VALUES = new Set([
  'approved',
  'approve',
  'dh_status_approved',
  'doctor_yes',
  'secretary_enter',
  'yes',
  'enter',
  '1',
  'true',
  'نعم',
  'دخول'
]);

/** القيم التي تعني "رفض" أو "طلب انتظار" */
const REJECTED_VALUES = new Set([
  'rejected',
  'reject',
  'dh_status_rejected',
  'doctor_no',
  'secretary_wait',
  'no',
  'wait',
  '0',
  'false',
  'لا',
  'انتظار'
]);

/** تطبيع النص للمقارنة (تقليل المسافات وتوحيد حالة الحروف) */
const normalizeActionValue = (value?: string | null): string =>
  String(value || '').trim().toLowerCase();

/** 
 * وظيفة استنتاج حالة الإجراء (resolveNotificationActionStatus):
 * تفحص الحقول المختلفة القادمة من الإشعار (Status or Button name) 
 * وترجع إما 'approved' أو 'rejected' أو null في حال عدم الفهم.
 */
export const resolveNotificationActionStatus = ({
  status,
  button,
}: {
  status?: string | null;
  button?: string | null;
}): NotificationActionStatus | null => {
  const normalizedStatus = normalizeActionValue(status);
  if (APPROVED_VALUES.has(normalizedStatus)) return 'approved';
  if (REJECTED_VALUES.has(normalizedStatus)) return 'rejected';

  const normalizedButton = normalizeActionValue(button);
  if (APPROVED_VALUES.has(normalizedButton)) return 'approved';
  if (REJECTED_VALUES.has(normalizedButton)) return 'rejected';

  return null;
};
