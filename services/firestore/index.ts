/**
 * مجمّع خدمات Firestore (Firestore Services Aggregator)
 * هذا الملف هو نقطة الوصول المركزية لكافة خدمات قاعدة البيانات في التطبيق.
 * يجمع الوظائف من الملفات الفرعية (المرضى، المواعيد، الإحصائيات، إلخ) 
 * ويصدرها ككائن واحد 'firestoreService' لسهولة الاستخدام في المكونات.
 */

import { patientsService } from './patients';
import { appointmentsService } from './appointments';
import { statsService } from './stats';
import { fcmService } from './fcm';
import { bookingSecretaryService } from './bookingSecretary';
import { bookingPublicService } from './bookingPublic';
import { userProfileService } from './userProfile';
import { doctorAdsService } from './doctorAds';
import { branchesService } from './branches';
import { dismissedAppointmentNotificationsService } from './dismissedAppointmentNotifications';

export const firestoreService = {
    ...patientsService,
    ...appointmentsService,
    ...statsService,
    ...fcmService,
    ...bookingSecretaryService,
    ...bookingPublicService,
    ...userProfileService,
    ...doctorAdsService,
    ...branchesService,
    ...dismissedAppointmentNotificationsService,
};
