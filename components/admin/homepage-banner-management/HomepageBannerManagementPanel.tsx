/**
 * لوحة إدارة بنرات الصفحة الرئيسية (Homepage Banner Management Panel)
 * تتيح للمسؤولين إضافة وتعديل وحذف البنرات الإعلانية والتعريفية المعروضة للمستخدمين.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { CropAreaPixels, HomeBannerData, HomepageBannerManagementPanelProps } from './types';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../../services/firebaseConfig';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import { getRectCroppedImg } from '../../../utils/rectCropImage';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { useTrustedNow } from '../../../hooks/useTrustedNow';
import { LoadingText } from '../../ui/LoadingText';
import { BannerControls } from './BannerControls';
import {
  BANNER_WIDTH, createDefaultItem, DEFAULT_BANNER_HEIGHT, DEFAULT_ROTATION_SECONDS, getDefaultFormData, getDefaultExpiryDateTimeLocal, MAX_IMAGE_SIZE,
} from './constants';
import { CropModal } from './CropModal';
import { BannerPreviewEditor } from './BannerPreviewEditor';
import {
  getSafeErrorMessage, isDataUrl, sanitizeBannerItems, sanitizeSettingsDocId, sanitizeTargetUrl, sanitizeText,
} from './securityUtils';
import { BannerItem } from '../../../types';
import { filterActiveBannerItems, toStoredBannerExpiryValue } from '../../../utils/homepageBannerTime';

export const HomepageBannerManagementPanel: React.FC<HomepageBannerManagementPanelProps> = ({
  adminEmail,
  settingsDocId = 'homepageBanner',
  panelTitle = '🖼️ إدارة بانر الصفحة الرئيسية',
  panelDescription = 'العرض ثابت 1600، إدخال الطول والوقت بالأرقام، وإعدادات مستقلة لكل صورة.',
}) => {
  const { user } = useAuth();
  const { nowMs } = useTrustedNow();
  const effectiveEmail = (user?.email || adminEmail || '').trim().toLowerCase();
  const isAdminUser = useIsAdmin(user);

  const safeSettingsDocId = useMemo(() => sanitizeSettingsDocId(settingsDocId), [settingsDocId]);
  const settingsDocPath = useMemo(() => (safeSettingsDocId ? (['settings', safeSettingsDocId] as const) : null), [safeSettingsDocId]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [newImageUrl, setNewImageUrl] = useState('');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const [pendingCropImage, setPendingCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropAreaPixels | null>(null);

  const [form, setForm] = useState<HomeBannerData>(getDefaultFormData);

  const safeHeight = Math.max(120, Number(form.bannerHeight) || DEFAULT_BANNER_HEIGHT);
  const safeRotationSeconds = Math.max(1, Number(form.rotationSeconds) || DEFAULT_ROTATION_SECONDS);
  const bannerAspect = useMemo(() => BANNER_WIDTH / safeHeight, [safeHeight]);
  const hasExplicitOffset = (value: unknown) => {
    const raw = typeof value === 'string' ? value.trim() : '';
    return /(?:[zZ]|[+\-]\d{2}:\d{2})$/.test(raw);
  };

  const activeItem = form.items[activePreviewIndex] || null;

  useEffect(() => {
    const loadBanner = async () => {
      if (!settingsDocPath) {
        setStatusMessage('❌ معرف إعدادات البانر غير صالح.');
        setLoading(false);
        return;
      }

      if (!isAdminUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const bannerDoc = await getDocCacheFirst(doc(db, ...settingsDocPath));
        if (!bannerDoc.exists()) {
          setLoading(false);
          return;
        }

        const data = bannerDoc.data() as Partial<HomeBannerData> & {
          imageUrl?: string;
          imageUrls?: string[];
          items?: Partial<BannerItem>[];
        };

        const normalizedItems =
          Array.isArray(data.items) && data.items.length > 0
            ? sanitizeBannerItems(data.items).filter((item) => !!item.imageUrl)
            : (Array.isArray(data.imageUrls) ? data.imageUrls : data.imageUrl ? [data.imageUrl] : [])
              .filter(Boolean)
              .map((url, idx) => ({
                imageUrl: sanitizeText(url, 2000),
                title: idx === 0 ? sanitizeText(data.title || 'إعلان مميز', 120) || 'إعلان مميز' : 'إعلان مميز',
                subtitle: idx === 0 ? sanitizeText(data.subtitle || '', 240) : '',
                ctaText: idx === 0 ? sanitizeText(data.ctaText || 'اعرف المزيد', 80) || 'اعرف المزيد' : 'اعرف المزيد',
                targetUrl: idx === 0 ? sanitizeTargetUrl(data.targetUrl || '') : '',
                isActive: true,
                expiresAt: getDefaultExpiryDateTimeLocal(),
              }));

        const cleanedItems = filterActiveBannerItems(normalizedItems, nowMs);
        const hasLegacyLocalExpiry = Array.isArray(data.items) && data.items.some((item) => {
          const raw = typeof item?.expiresAt === 'string' ? item.expiresAt.trim() : '';
          return Boolean(raw) && !hasExplicitOffset(raw);
        });

        // 🐛 BUG FIX: الكود السابق كان يكتب `items: cleanedItems` (بعد فلترة المنتهية) إلى
        // Firestore عند كل فتح للوحة، مما يمحو البانرات نهائياً بعد انتهاء صلاحيتها حتى
        // لو لم يضغط الأدمن "حفظ". الآن نكتب فقط لتحويل صيغة expiresAt القديمة،
        // ونحفظ جميع العناصر (بما فيها المنتهية) لاحتفاظ الأدمن بسجل قابل لإعادة التفعيل.
        const shouldPersistNormalizedData =
          hasLegacyLocalExpiry ||
          !Array.isArray(data.items);

        if (shouldPersistNormalizedData) {
          // نكتب ALL normalizedItems (حتى المنتهية) — مع تطبيع صيغة expiresAt فقط.
          const storedNormalizedItems = normalizedItems.map((item) => ({
            ...item,
            expiresAt: toStoredBannerExpiryValue(item.expiresAt) || item.expiresAt,
          }));
          // imageUrls/imageUrl تبقى مشتقة من العناصر النشطة لتوافق العملاء القدامى.
          const activeStoredItems = filterActiveBannerItems(storedNormalizedItems, nowMs);

          await setDoc(
            doc(db, ...settingsDocPath),
            {
              ...data,
              items: storedNormalizedItems,
              imageUrls: activeStoredItems.map((item) => item.imageUrl),
              imageUrl: activeStoredItems[0]?.imageUrl || '',
              title: activeStoredItems[0]?.title || data.title || 'إعلان مميز',
              subtitle: activeStoredItems[0]?.subtitle || data.subtitle || '',
              ctaText: activeStoredItems[0]?.ctaText || data.ctaText || 'اعرف المزيد',
              targetUrl: activeStoredItems[0]?.targetUrl || data.targetUrl || '',
              updatedAt: new Date().toISOString(),
              updatedBy: sanitizeText(effectiveEmail, 120),
            },
            { merge: true }
          );
        }

        // الفورم يعرض كل العناصر (نشطة + منتهية) — الأدمن يرى كل شيء ويقرر.
        setForm((prev) => ({
          ...prev,
          items: normalizedItems,
          imageUrls: cleanedItems.map((item) => item.imageUrl),
          imageUrl: cleanedItems[0]?.imageUrl || '',
          title: sanitizeText(data.title || prev.title, 120) || prev.title,
          subtitle: sanitizeText(data.subtitle || '', 240),
          ctaText: sanitizeText(data.ctaText || prev.ctaText, 80) || prev.ctaText,
          targetUrl: sanitizeTargetUrl(data.targetUrl || ''),
          isActive: data.isActive ?? true,
          bannerHeight: Math.max(120, Number(data.bannerHeight || prev.bannerHeight || DEFAULT_BANNER_HEIGHT)),
          rotationSeconds: Math.max(1, Number(data.rotationSeconds || prev.rotationSeconds || DEFAULT_ROTATION_SECONDS)),
        }));

        setActivePreviewIndex(0);
      } catch (error) {
        console.error('Error loading homepage banner:', error);
        setStatusMessage(`❌ ${getSafeErrorMessage(error, 'تعذر تحميل بيانات البانر الحالية.')}`);
      } finally {
        setLoading(false);
      }
    };

    void loadBanner();
  }, [effectiveEmail, isAdminUser, settingsDocPath]);

  const updateField = <K extends keyof HomeBannerData>(key: K, value: HomeBannerData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateActiveItem = (patch: Partial<BannerItem>) => {
    setForm((prev) => {
      if (!prev.items[activePreviewIndex]) return prev;
      const nextItems = [...prev.items];
      nextItems[activePreviewIndex] = { ...nextItems[activePreviewIndex], ...patch };
      return {
        ...prev,
        items: nextItems,
        imageUrls: nextItems.map((item) => item.imageUrl),
        imageUrl: nextItems[0]?.imageUrl || '',
      };
    });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage('❌ يرجى اختيار ملف صورة فقط.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setStatusMessage('❌ حجم الصورة يجب ألا يتجاوز 50 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = String(reader.result || '');
      if (!imageDataUrl) {
        setStatusMessage('❌ تعذر تحميل الصورة المختارة.');
        return;
      }

      setPendingCropImage(imageDataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setStatusMessage('');
    };

    reader.onerror = () => setStatusMessage('❌ تعذر قراءة ملف الصورة.');
    reader.readAsDataURL(file);
  };

  const onCropComplete = React.useCallback(
    (_croppedArea: CropAreaPixels, croppedPixels: CropAreaPixels) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const cancelCrop = () => {
    setPendingCropImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const appendItem = (imageUrl: string) => {
    setForm((prev) => {
      const nextItems = [...prev.items, createDefaultItem(imageUrl)];
      return {
        ...prev,
        items: nextItems,
        imageUrls: nextItems.map((item) => item.imageUrl),
        imageUrl: nextItems[0]?.imageUrl || '',
      };
    });
    setActivePreviewIndex(form.items.length);
  };

  const applyCrop = async () => {
    if (!pendingCropImage) return;

    try {
      const cropped = croppedAreaPixels
        ? await getRectCroppedImg(pendingCropImage, croppedAreaPixels, BANNER_WIDTH)
        : pendingCropImage;

      appendItem(cropped);
      setStatusMessage('✅ تم إضافة الصورة بعد التعديل.');
      cancelCrop();
    } catch (error) {
      setStatusMessage(`❌ ${getSafeErrorMessage(error, 'فشل تعديل الصورة.')}`);
    }
  };

  const addImageUrl = () => {
    const value = newImageUrl.trim();
    if (!value) return;

    if (!/^https?:\/\//i.test(value)) {
      setStatusMessage('❌ يرجى إدخال رابط صحيح يبدأ بـ http أو https.');
      return;
    }

    appendItem(value);
    setNewImageUrl('');
    setStatusMessage('✅ تم إضافة الصورة.');
  };

  const removeImage = async (index: number) => {
    if (!settingsDocPath || !isAdminUser) return;

    const previousForm = form;
    const nextItems = previousForm.items.filter((_, idx) => idx !== index);
    const sanitizedNextItems = sanitizeBannerItems(nextItems);
    const safeIndex =
      sanitizedNextItems.length === 0 ? 0 : Math.min(activePreviewIndex, sanitizedNextItems.length - 1);

    const nextForm: HomeBannerData = {
      ...previousForm,
      items: sanitizedNextItems,
      imageUrls: sanitizedNextItems.map((item) => item.imageUrl),
      imageUrl: sanitizedNextItems[0]?.imageUrl || '',
      title: sanitizedNextItems[0]?.title || 'إعلان مميز',
      subtitle: sanitizedNextItems[0]?.subtitle || '',
      ctaText: sanitizedNextItems[0]?.ctaText || 'اعرف المزيد',
      targetUrl: sanitizeTargetUrl(sanitizedNextItems[0]?.targetUrl || ''),
      updatedAt: new Date().toISOString(),
      updatedBy: sanitizeText(effectiveEmail, 120),
    };

    setForm(nextForm);
    setActivePreviewIndex(safeIndex);

    const hasPendingLocalImages = nextItems.some((item) => isDataUrl(item.imageUrl));
    if (hasPendingLocalImages) {
      setStatusMessage('⚠️ تم حذف الصورة من الواجهة. لديك صور جديدة غير محفوظة، اضغط حفظ لتحديث Firestore.');
      return;
    }

    try {
      await setDoc(doc(db, ...settingsDocPath), nextForm, { merge: true });
      setStatusMessage('✅ تم حذف الصورة وتحديث Firestore مباشرة.');
    } catch (error) {
      setForm(previousForm);
      setActivePreviewIndex(Math.min(index, Math.max(0, previousForm.items.length - 1)));
      setStatusMessage(`❌ ${getSafeErrorMessage(error, 'فشل حذف الصورة من Firestore.')}`);
    }
  };

  const uploadBannerImages = async (items: BannerItem[]): Promise<BannerItem[]> => {
    const uploaded: BannerItem[] = [];

    for (const item of items) {
      if (!isDataUrl(item.imageUrl)) {
        uploaded.push(item);
        continue;
      }

      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      const storageRef = ref(
        storage,
        `homepage-banners/banner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`
      );
      const uploadResult = await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      uploaded.push({ ...item, imageUrl: downloadUrl });
    }

    return uploaded;
  };

  const handleSave = async () => {
    if (!isAdminUser || !settingsDocPath) {
      setStatusMessage('❌ غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    const normalizedItems = sanitizeBannerItems(form.items);
    if (normalizedItems.length === 0) {
      setStatusMessage('❌ أضف صورة واحدة على الأقل للبانر.');
      return;
    }

    setSaving(true);
    setUploading(true);
    setStatusMessage('');

    try {
      const uploadedItems = await uploadBannerImages(normalizedItems);
      const storedItems = uploadedItems.map((item) => ({
        ...item,
        expiresAt: toStoredBannerExpiryValue(item.expiresAt) || item.expiresAt,
      }));
      const payload: HomeBannerData = {
        ...form,
        items: storedItems,
        imageUrls: storedItems.map((item) => item.imageUrl),
        imageUrl: storedItems[0]?.imageUrl || '',
        title: storedItems[0]?.title || 'إعلان مميز',
        subtitle: storedItems[0]?.subtitle || '',
        ctaText: storedItems[0]?.ctaText || 'اعرف المزيد',
        targetUrl: sanitizeTargetUrl(storedItems[0]?.targetUrl || ''),
        isActive: form.isActive,
        bannerHeight: safeHeight,
        rotationSeconds: safeRotationSeconds,
        updatedAt: new Date().toISOString(),
        updatedBy: sanitizeText(effectiveEmail, 120),
      };

      await setDoc(doc(db, ...settingsDocPath), payload, { merge: true });
      setForm((prev) => ({
        ...prev,
        items: sanitizeBannerItems(storedItems),
        imageUrls: storedItems.map((item) => item.imageUrl),
        imageUrl: storedItems[0]?.imageUrl || '',
        title: storedItems[0]?.title || 'إعلان مميز',
        subtitle: storedItems[0]?.subtitle || '',
        ctaText: storedItems[0]?.ctaText || 'اعرف المزيد',
        targetUrl: sanitizeTargetUrl(storedItems[0]?.targetUrl || ''),
        isActive: form.isActive,
        bannerHeight: safeHeight,
        rotationSeconds: safeRotationSeconds,
        updatedAt: payload.updatedAt,
        updatedBy: payload.updatedBy,
      }));
      setActivePreviewIndex(0);
      setStatusMessage('✅ تم حفظ البانر بنجاح.');
    } catch (error) {
      // لوج تفصيلي يساعدنا نشوف نوع الخطأ الفعلي (Storage/Firestore/Network)
      console.error('[BannerSave] failed', { settingsDocId: safeSettingsDocId, error });
      setStatusMessage(`❌ ${getSafeErrorMessage(error, 'فشل حفظ البانر.')}`);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (!safeSettingsDocId) {
    return (
      <section className="bg-slate-700 rounded-2xl shadow-xl p-6 border border-red-500/40 text-red-200">
        معرف إعدادات البانر غير صالح.
      </section>
    );
  }

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل إعدادات البانر" />;
  }

  if (!isAdminUser) {
    return (
      <section className="bg-slate-700 rounded-2xl shadow-xl p-6 border border-red-500/40 text-red-200">
        غير مصرح لك بإدارة بانر الصفحة الرئيسية.
      </section>
    );
  }

  return (
    <section className="bg-slate-700 rounded-2xl shadow-xl p-8 border-t-4 border-fuchsia-500 space-y-6">
      <div className="dh-stagger-1">
        <h3 className="text-2xl font-black text-white mb-2">{panelTitle}</h3>
        <p className="text-slate-300 text-sm">{panelDescription}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dh-stagger-2">
        <BannerControls
          bannerHeight={form.bannerHeight}
          rotationSeconds={form.rotationSeconds}
          isActive={form.isActive}
          newImageUrl={newImageUrl}
          saving={saving}
          uploading={uploading}
          statusMessage={statusMessage}
          onChangeBannerHeight={(value) => updateField('bannerHeight', value)}
          onChangeRotationSeconds={(value) => updateField('rotationSeconds', value)}
          onChangeNewImageUrl={setNewImageUrl}
          onAddImageUrl={addImageUrl}
          onSelectImage={handleImageSelect}
          onChangeIsActive={(value) => updateField('isActive', value)}
          onSave={handleSave}
        />

        <BannerPreviewEditor
          items={form.items}
          imageUrls={form.imageUrls}
          imageUrl={form.imageUrl}
          safeHeight={safeHeight}
          safeRotationSeconds={safeRotationSeconds}
          activePreviewIndex={activePreviewIndex}
          activeItem={activeItem}
          onSelectPreviewIndex={setActivePreviewIndex}
          onRemoveImage={(index) => {
            void removeImage(index);
          }}
          onUpdateActiveItem={updateActiveItem}
        />
      </div>

      <CropModal
        open={Boolean(pendingCropImage)}
        image={pendingCropImage}
        crop={crop}
        zoom={zoom}
        aspect={bannerAspect}
        bannerWidth={BANNER_WIDTH}
        bannerHeight={safeHeight}
        onClose={cancelCrop}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        onApply={() => {
          void applyCrop();
        }}
      />
    </section>
  );
};
