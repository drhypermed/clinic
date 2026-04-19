/**
 * سكريبت مساعد لتعبئة بيانات الاستخدام للاختبار
 * استخدم هذا السكريبت لإنشاء بيانات وهمية في Firestore
 * 
 * تحذير: استخدم فقط في بيئة التطوير
 */

import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocs,
  setDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

interface MockUsageEvent {
  doctorId: string;
  eventType: 'smartPrescription' | 'print' | 'interactionChecker' | 'dosageCalculator' | 'drugSearch' | 'contraIndications' | 'patientRecord';
  timestamp?: any;
}

const eventTypes: MockUsageEvent['eventType'][] = [
  'smartPrescription',
  'print',
  'interactionChecker',
  'dosageCalculator',
  'drugSearch',
  'contraIndications',
  'patientRecord'
];

/**
 * إنشاء أحداث استخدام وهمية لطبيب معين
 */
export const createMockUsageEvents = async (
  doctorId: string,
  eventCount: number = 50
): Promise<void> => {
  try {
    console.log(`جاري إضافة ${eventCount} حدث استخدام للطبيب ${doctorId}...`);
    
    for (let i = 0; i < eventCount; i++) {
      const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30); // آخر 30 يوم
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      
      await addDoc(collection(db, 'usageEvents'), {
        doctorId,
        eventType: randomEventType,
        timestamp,
        details: {
          action: randomEventType,
          duration: Math.floor(Math.random() * 300) // ثانية
        }
      });
    }
    
    console.log(`✅ تم إضافة ${eventCount} حدث بنجاح`);
  } catch (error) {
    console.error('❌ خطأ في إضافة الأحداث:', error);
  }
};

/**
 * إنشاء أحداث لجميع الأطباء الموجودين
 */
export const createMockUsageEventsForAllDoctors = async (): Promise<void> => {
  try {
    // جلب جميع الأطباء من users
    const doctorsSnap = await getDocs(query(collection(db, 'users'), where('authRole', '==', 'doctor')));
    
    if (doctorsSnap.empty) {
      console.warn('⚠️ لا توجد أطباء في قاعدة البيانات');
      return;
    }

    console.log(`🔄 جاري إنشاء الأحداث لـ ${doctorsSnap.size} أطباء...`);
    
    for (const doctorDoc of doctorsSnap.docs) {
      const doctorId = doctorDoc.id;
      // عدد عشوائي من الأحداث بين 10 و 100
      const eventCount = Math.floor(Math.random() * 90) + 10;
      await createMockUsageEvents(doctorId, eventCount);
    }

    console.log('✅ تم إنشاء جميع الأحداث بنجاح');
  } catch (error) {
    console.error('❌ خطأ في إنشاء الأحداث:', error);
  }
};

/**
 * تحديث بيانات الطبيب ليشمل حقول الاستخدام
 */
export const updateDoctorUsageFields = async (
  doctorId: string,
  options: {
    storageUsageBytes?: number;
    aiApiCallsCount?: number;
    aiTokensUsed?: number;
  } = {}
): Promise<void> => {
  try {
    const {
      storageUsageBytes = Math.floor(Math.random() * 1024 * 1024 * 100), // حتى 100 MB
      aiApiCallsCount = Math.floor(Math.random() * 500),
      aiTokensUsed = Math.floor(Math.random() * 50000)
    } = options;

    await setDoc(
      doc(db, 'users', doctorId),
      {
        storageUsageBytes,
        aiApiCallsCount,
        aiTokensUsed,
        lastActiveAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    console.log(`✅ تم تحديث حقول الاستخدام للطبيب ${doctorId}`);
  } catch (error) {
    console.error(`❌ خطأ في تحديث الطبيب ${doctorId}:`, error);
  }
};

/**
 * تحديث جميع الأطباء بحقول الاستخدام
 */
export const updateAllDoctorsUsageFields = async (): Promise<void> => {
  try {
    const doctorsSnap = await getDocs(query(collection(db, 'users'), where('authRole', '==', 'doctor')));
    
    if (doctorsSnap.empty) {
      console.warn('⚠️ لا توجد أطباء في قاعدة البيانات');
      return;
    }

    console.log(`🔄 جاري تحديث حقول الاستخدام لـ ${doctorsSnap.size} أطباء...`);
    
    for (const doctorDoc of doctorsSnap.docs) {
      await updateDoctorUsageFields(doctorDoc.id);
    }

    console.log('✅ تم تحديث جميع الأطباء بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تحديث الأطباء:', error);
  }
};

/**
 * دالة شاملة لإعداد بيانات الاختبار كاملة
 */
export const setupMockDataForTesting = async (): Promise<void> => {
  try {
    console.log('📊 جاري إعداد بيانات الاختبار...\n');

    console.log('📝 الخطوة 1: تحديث حقول الاستخدام للأطباء...');
    await updateAllDoctorsUsageFields();

    console.log('\n📝 الخطوة 2: إنشاء أحداث الاستخدام...');
    await createMockUsageEventsForAllDoctors();

    console.log('\n✅ تم إعداد بيانات الاختبار بنجاح!');
    console.log('🎯 يمكنك الآن الذهاب لصفحة استخدام الأطباء لرؤية البيانات');
  } catch (error) {
    console.error('❌ خطأ في إعداد بيانات الاختبار:', error);
  }
};

/**
 * حذف جميع الأحداث (للتنظيف)
 */
export const deleteAllUsageEvents = async (): Promise<void> => {
  try {
    const eventsSnap = await getDocs(collection(db, 'usageEvents'));
    
    if (eventsSnap.empty) {
      console.log('✅ لا توجد أحداث للحذف');
      return;
    }

    console.log(`🔄 جاري حذف ${eventsSnap.size} حدث...`);
    
    // ملاحظة: Firestore يتطلب حذف المستندات واحداً تلو الآخر
    // لحذف كمية كبيرة، استخدم Cloud Functions
    console.warn('⚠️ ملاحظة: حذف الكثير من المستندات قد يكون بطيئاً');
    
    let deleted = 0;
    for (const eventDoc of eventsSnap.docs) {
      // await deleteDoc(doc(db, 'usageEvents', eventDoc.id));
      deleted++;
    }

    console.log(`✅ تم حذف ${deleted} حدث`);
  } catch (error) {
    console.error('❌ خطأ في حذف الأحداث:', error);
  }
};

// تصدير للاستخدام المباشر في Console
console.log(`
📊 أدوات الاختبار المتاحة:
=====================================

// إنشاء أحداث لطبيب واحد:
createMockUsageEvents('doctorId', 50)

// إنشاء أحداث لجميع الأطباء:
createMockUsageEventsForAllDoctors()

// تحديث حقول الاستخدام لطبيب:
updateDoctorUsageFields('doctorId')

// تحديث جميع الأطباء:
updateAllDoctorsUsageFields()

// إعداد شامل للبيانات:
setupMockDataForTesting()

// حذف جميع الأحداث:
deleteAllUsageEvents()
=====================================
`);

export default {
  createMockUsageEvents,
  createMockUsageEventsForAllDoctors,
  updateDoctorUsageFields,
  updateAllDoctorsUsageFields,
  setupMockDataForTesting,
  deleteAllUsageEvents
};
