// ─────────────────────────────────────────────────────────────────────────────
// إدارة فروع الإعلان (Hook منفصل عن الـ controller الرئيسي)
// ─────────────────────────────────────────────────────────────────────────────
// الهدف: نفصل منطق تعدد الفروع عن الملف الأساسي لصفحة الإعلان عشان:
//   1) الملف الأصلي ما يكبرش فوق الـ500 سطر.
//   2) نقدر نتعامل مع branches[] كوحدة مستقلة (add/remove/update/set active).
//   3) الـCRUD المتداخل (داخل كل فرع جدول/خدمات/صور) يبقى مجمّع في مكان واحد.
//
// الـhook ده بيدير:
//   - branches: مصفوفة الفروع + تطبيعها
//   - activeBranchId: الفرع اللي مفتوح دلوقتي في تبويبات التعديل
//   - addBranch / removeBranch / renameBranch
//   - updateBranchField: تعديل حقل نصي/رقمي داخل فرع
//   - CRUD لجداول الفرع (schedule/services/images)
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';
import type { DoctorAdBranch, DoctorClinicScheduleRow, DoctorClinicServiceRow } from '../../../types';
import {
  MAX_BRANCHES_PER_DOCTOR,
  createEmptyBranch,
  createScheduleId,
  createServiceId,
} from './utils';

// قيم الحقول القابلة للتعديل مباشرة (نصية أو سعرية)
type BranchScalarField =
  | 'name'
  | 'governorate'
  | 'city'
  | 'addressDetails'
  | 'contactPhone'
  | 'whatsapp'
  | 'examinationPrice'
  | 'discountedExaminationPrice'
  | 'consultationPrice'
  | 'discountedConsultationPrice';

interface UseDoctorAdBranchesApi {
  branches: DoctorAdBranch[];
  activeBranchId: string;
  activeBranch: DoctorAdBranch;
  setBranches: React.Dispatch<React.SetStateAction<DoctorAdBranch[]>>;
  setActiveBranchId: (id: string) => void;
  canAddBranch: boolean;
  addBranch: () => string | null;
  removeBranch: (id: string) => void;
  renameBranch: (id: string, name: string) => void;
  /** تعديل حقل سكيلار (نص أو رقم) داخل فرع معيّن. */
  updateBranchField: (branchId: string, field: BranchScalarField, value: string | number | null) => void;

  // CRUD لمواعيد الفرع
  addScheduleRow: (branchId: string, row: Omit<DoctorClinicScheduleRow, 'id'>) => void;
  removeScheduleRow: (branchId: string, rowId: string) => void;
  updateScheduleRow: (branchId: string, rowId: string, patch: Partial<DoctorClinicScheduleRow>) => void;

  // CRUD لخدمات الفرع
  addServiceRow: (branchId: string) => void;
  removeServiceRow: (branchId: string, rowId: string) => void;
  updateServiceRow: (branchId: string, rowId: string, patch: Partial<DoctorClinicServiceRow>) => void;

  // صور الفرع — نضيف URL جاهز (بعد ما يتم رفعه في الـcontroller) أو نحذف بالـindex
  appendBranchImage: (branchId: string, url: string) => void;
  removeBranchImage: (branchId: string, imageIndex: number) => string | null;
}

export const useDoctorAdBranches = (
  initialBranches: DoctorAdBranch[] = [],
  // ─ الحد الأقصى للفروع — كان hardcoded=5، دلوقتي بيتقرأ من إعدادات الأدمن
  //   حسب باقة الطبيب (مجاني/برو/برو ماكس). الـcaller بيمرّره. لو لم يُمرّر،
  //   نرجع لـMAX_BRANCHES_PER_DOCTOR كـsafety net عشان مايكسرش الكود القديم.
  maxBranches: number = MAX_BRANCHES_PER_DOCTOR,
): UseDoctorAdBranchesApi => {
  // نبدأ دايماً بفرع واحد على الأقل عشان واجهة التعديل يكون عندها محتوى تعرضه
  const [branches, setBranches] = useState<DoctorAdBranch[]>(() => {
    if (initialBranches.length > 0) return initialBranches;
    return [createEmptyBranch('الفرع الرئيسي')];
  });
  const [activeBranchId, setActiveBranchIdState] = useState<string>(
    () => (initialBranches[0]?.id) || (branches[0]?.id) || ''
  );

  // الفرع النشط: لو الـid مش موجود بالصدفة، نرجع لأول فرع
  const activeBranch = useMemo(
    () => branches.find((b) => b.id === activeBranchId) || branches[0],
    [branches, activeBranchId]
  );

  const setActiveBranchId = useCallback((id: string) => {
    setActiveBranchIdState(id);
  }, []);

  // الحد المعتمد: قيمة الباقة من الأدمن، أو الـfallback لو القيمة غير صالحة
  const effectiveMaxBranches = Math.max(
    1,
    Number.isFinite(maxBranches) ? Math.floor(maxBranches) : MAX_BRANCHES_PER_DOCTOR,
  );
  const canAddBranch = branches.length < effectiveMaxBranches;

  const addBranch = useCallback((): string | null => {
    if (!canAddBranch) return null;
    const newBranch = createEmptyBranch(`فرع ${branches.length + 1}`);
    setBranches((prev) => [...prev, newBranch]);
    setActiveBranchIdState(newBranch.id);
    return newBranch.id;
  }, [branches.length, canAddBranch]);

  const removeBranch = useCallback((id: string) => {
    setBranches((prev) => {
      // نمنع حذف آخر فرع — لازم يفضل فرع واحد على الأقل
      if (prev.length <= 1) return prev;
      const next = prev.filter((b) => b.id !== id);
      // لو الفرع المحذوف كان النشط، نحول النشاط لأول فرع متبقي
      if (id === activeBranchId) {
        setActiveBranchIdState(next[0]?.id || '');
      }
      return next;
    });
  }, [activeBranchId]);

  const renameBranch = useCallback((id: string, name: string) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)));
  }, []);

  const updateBranchField = useCallback(
    (branchId: string, field: BranchScalarField, value: string | number | null) => {
      setBranches((prev) =>
        prev.map((b) => (b.id === branchId ? { ...b, [field]: value } : b))
      );
    },
    []
  );

  // ─── مواعيد الفرع ───
  const addScheduleRow = useCallback(
    (branchId: string, row: Omit<DoctorClinicScheduleRow, 'id'>) => {
      const newRow: DoctorClinicScheduleRow = { ...row, id: createScheduleId() };
      setBranches((prev) =>
        prev.map((b) =>
          b.id === branchId ? { ...b, clinicSchedule: [...b.clinicSchedule, newRow] } : b
        )
      );
    },
    []
  );

  const removeScheduleRow = useCallback((branchId: string, rowId: string) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? { ...b, clinicSchedule: b.clinicSchedule.filter((r) => r.id !== rowId) }
          : b
      )
    );
  }, []);

  const updateScheduleRow = useCallback(
    (branchId: string, rowId: string, patch: Partial<DoctorClinicScheduleRow>) => {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === branchId
            ? {
                ...b,
                clinicSchedule: b.clinicSchedule.map((r) =>
                  r.id === rowId ? { ...r, ...patch } : r
                ),
              }
            : b
        )
      );
    },
    []
  );

  // ─── خدمات الفرع ───
  const addServiceRow = useCallback((branchId: string) => {
    const newRow: DoctorClinicServiceRow = { id: createServiceId(), name: '', price: null };
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId ? { ...b, clinicServices: [...b.clinicServices, newRow] } : b
      )
    );
  }, []);

  const removeServiceRow = useCallback((branchId: string, rowId: string) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId
          ? { ...b, clinicServices: b.clinicServices.filter((r) => r.id !== rowId) }
          : b
      )
    );
  }, []);

  const updateServiceRow = useCallback(
    (branchId: string, rowId: string, patch: Partial<DoctorClinicServiceRow>) => {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === branchId
            ? {
                ...b,
                clinicServices: b.clinicServices.map((r) =>
                  r.id === rowId ? { ...r, ...patch } : r
                ),
              }
            : b
        )
      );
    },
    []
  );

  // ─── صور الفرع ───
  const appendBranchImage = useCallback((branchId: string, url: string) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId ? { ...b, imageUrls: [...b.imageUrls, url] } : b
      )
    );
  }, []);

  // بنرجع الـurl المحذوف عشان الـcontroller يعرف يحذفه من الـStorage
  const removeBranchImage = useCallback((branchId: string, imageIndex: number): string | null => {
    let removed: string | null = null;
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id !== branchId) return b;
        if (imageIndex < 0 || imageIndex >= b.imageUrls.length) return b;
        removed = b.imageUrls[imageIndex];
        return { ...b, imageUrls: b.imageUrls.filter((_, idx) => idx !== imageIndex) };
      })
    );
    return removed;
  }, []);

  return {
    branches,
    activeBranchId,
    activeBranch,
    setBranches,
    setActiveBranchId,
    canAddBranch,
    addBranch,
    removeBranch,
    renameBranch,
    updateBranchField,
    addScheduleRow,
    removeScheduleRow,
    updateScheduleRow,
    addServiceRow,
    removeServiceRow,
    updateServiceRow,
    appendBranchImage,
    removeBranchImage,
  };
};
