/**
 * مكون تفعيل الإشعارات (NotificationTogglePrompt):
 * يعرض بطاقة في منتصف الشاشة لتفعيل الإشعارات إذا كانت معطلة في التطبيق.
 * البطاقة تظهر مع كل refresh حتى لو ضغط المستخدم "ليس الآن" (مثل زر التثبيت).
 */

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

const NOTIFICATION_PERMISSION_SNAPSHOT_KEY = 'dh_notification_permission_snapshot';
type MessagingModule = typeof import('../services/messagingService');

export const NotificationTogglePrompt: React.FC = () => {
  const { user } = useAuth();
  const [showNotificationCard, setShowNotificationCard] = useState(false);
  const [iosWarningMode, setIosWarningMode] = useState(false);
  const [dismissedInSession, setDismissedInSession] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lastPermissionRef = useRef<NotificationPermission | null>(null);
  const messagingModuleRef = useRef<MessagingModule | null>(null);

  const getMessagingModule = async (): Promise<MessagingModule> => {
    if (messagingModuleRef.current) return messagingModuleRef.current;
    const module = await import('../services/messagingService');
    messagingModuleRef.current = module;
    return module;
  };

  // التحقق من دعم الإشعارات والإذن الحالي
  const checkNotificationStatus = async () => {
    // التحقق من دعم الإشعارات من قبل المتصفح
    let pushSupport: ReturnType<MessagingModule['getPushSupportInfo']>;
    try {
      const messagingModule = await getMessagingModule();
      pushSupport = messagingModule.getPushSupportInfo();
    } catch {
      setShowNotificationCard(false);
      return;
    }
    const isIosPendingPwa = pushSupport.reason === 'ios-install-required';
    setIosWarningMode(isIosPendingPwa);
    
    if (!pushSupport.supported && !isIosPendingPwa) {
      setShowNotificationCard(false);
      return;
    }

    // التحقق من حالة الإذن الحالي
    const currentPermission = Notification.permission;
    
    // إذا تغيرت الإذن من "granted" إلى شيء آخر، أعد عرض البطاقة وامسح علم الإغلاق
    const storedPermission = localStorage.getItem(NOTIFICATION_PERMISSION_SNAPSHOT_KEY) as NotificationPermission | null;
    if (storedPermission === 'granted' && currentPermission !== 'granted') {
      // الإشعارات تم تعطيلها! امسح علم الإغلاق وأعرض البطاقة مرة أخرى
      setDismissedInSession(false);
      setShowNotificationCard(true);
      localStorage.setItem(NOTIFICATION_PERMISSION_SNAPSHOT_KEY, currentPermission);
      return;
    }

    // إذا أغلق المستخدم البطاقة في هذه الجلسة، لا تعرضها مجدداً حتى refresh
    if (dismissedInSession) {
      setShowNotificationCard(false);
      return;
    }

    // حفظ الحالة الحالية
    if (currentPermission) {
      localStorage.setItem(NOTIFICATION_PERMISSION_SNAPSHOT_KEY, currentPermission);
    }

    // إظهار البطاقة فقط إذا:
    // 1. كانت الإشعارات بحالة "default" (لم يجب المستخدم بعد)
    // 2. أو كانت بحالة "denied" (تم رفضها)

    if (currentPermission === 'granted') {
      setShowNotificationCard(false);
    } else {
      // إظهار البطاقة إذا كانت الإشعارات معطلة
      setShowNotificationCard(true);
    }

    // إذا كنا في حالة الآيفون الذي يتطلب التثبيت، أظهر البطاقة دائماً (إلا إذا تم إغلاقها)
    if (isIosPendingPwa && !dismissedInSession) {
      setShowNotificationCard(true);
    }

    lastPermissionRef.current = currentPermission;
  };

  // الاستماع لتغييرات حالة الإشعارات
  useEffect(() => {
    void checkNotificationStatus();

    // إنشء Interval للتحقق من التغييرات بشكل دوري (كل 5 ثوانٍ)
    // هذا ضروري لأن المتصفح قد يتغير فيه الإذن خارج التطبيق
    const interval = setInterval(() => {
      void checkNotificationStatus();
    }, 5000);

    // الاستماع لحدث تغيير الرؤية (عندما يعود المستخدم للتطبيق)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void checkNotificationStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dismissedInSession]);

  const handleEnableNotifications = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const userId = user.uid;
      const userRole = (user as any).authRole || 'doctor';
      const messagingModule = await getMessagingModule();

      // استدعاء الدالة المناسبة حسب دور المستخدم
      const success =
        userRole === 'secretary'
          ? await messagingModule.requestPermissionAndSaveTokenForSecretary(userId)
          : userRole === 'public'
            ? await messagingModule.requestPermissionAndSaveTokenForPublic(userId)
            : await messagingModule.requestPermissionAndSaveToken(userId);

      if (success) {
        // تم تفعيل الإشعارات بنجاح
        setShowNotificationCard(false);
        setDismissedInSession(false);
        localStorage.setItem(NOTIFICATION_PERMISSION_SNAPSHOT_KEY, Notification.permission);
      } else {
        // الطلب لم يكتمل بنجاح - قد يكون المستخدم قد رفض الإشعارات
        void checkNotificationStatus();
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      void checkNotificationStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    // حفظ أن المستخدم أغلق البطاقة في هذه الجلسة
    // البطاقة لن تظهر مرة أخرى إلا عند Refresh
    setDismissedInSession(true);
    setShowNotificationCard(false);
  };

  if (!showNotificationCard || !user) return null;

  return (
    <div
      className="no-print fixed inset-0 flex items-center justify-center z-[9998] bg-black/20 backdrop-blur-sm"
      style={{ direction: 'rtl' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-300 p-6 max-w-sm w-11/12">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-2 ${iosWarningMode ? 'text-red-600' : 'text-blue-700'}`}>
              {iosWarningMode ? 'تنبيه لمستخدمي iPhone ⚠️' : 'فعّل الإشعارات'}
            </h3>
            <p className={`text-sm mb-4 ${iosWarningMode ? 'text-gray-800 font-bold leading-relaxed' : 'text-gray-600'}`}>
              {iosWarningMode 
                ? 'أبل تمنع الإشعارات هنا. لتفعيلها، يرجى فتح الرابط من متصفح Safari، ثم اضغط على زر المشاركة واختر (Add to Home Screen - إضافة للشاشة الرئيسية). بعد إضافته، ثبته على الشاشة ثم افتح التطبيق لتتمكن من التفعيل المجاني.' 
                : 'تلقَّ إشعارات فورية بالحجوزات والتحديثات المهمة والتنبيهات المخصصة.'}
            </p>

            <div className="flex gap-3 justify-end">
              {!iosWarningMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    disabled={isLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    ليس الآن
                  </button>
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'جاري' : 'تفعيل'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  حسناً، فهمت
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



