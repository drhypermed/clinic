/**
 * قسم فروع الطبيب في الإعلان — يعرض تبويبات لكل فرع + زر "إضافة فرع"،
 * وفي كل تبويب يعرض BranchEditorCard لتحرير بيانات الفرع.
 *
 * المصدر الحقيقي للفروع في useDoctorAdvertisementController (عبر useDoctorAdBranches).
 * القسم ده مجرد UI واجهة — كل الـCRUD بيمر على الـprops.
 */
import React from 'react';
import type { DoctorAdBranch, DoctorClinicScheduleRow, DoctorClinicServiceRow } from '../../../types';
import { BranchEditorCard } from './BranchEditorCard';

interface DoctorAdBranchesSectionProps {
  branches: DoctorAdBranch[];
  activeBranchId: string;
  canAddBranch: boolean;

  onSetActiveBranchId: (id: string) => void;
  onAddBranch: () => string | null;
  onRemoveBranch: (id: string) => void;
  onRenameBranch: (id: string, name: string) => void;

  onUpdateBranchField: (
    branchId: string,
    field: 'governorate' | 'city' | 'addressDetails' | 'contactPhone' | 'whatsapp'
         | 'examinationPrice' | 'discountedExaminationPrice'
         | 'consultationPrice' | 'discountedConsultationPrice',
    value: string | number | null
  ) => void;

  // CRUD الخدمات داخل فرع
  onAddServiceRow: (branchId: string) => void;
  onUpdateServiceRow: (branchId: string, rowId: string, patch: Partial<DoctorClinicServiceRow>) => void;
  onRemoveServiceRow: (branchId: string, rowId: string) => void;

  // CRUD المواعيد داخل فرع
  onAddScheduleRow: (branchId: string, row: Omit<DoctorClinicScheduleRow, 'id'>) => void;
  onUpdateScheduleRow: (branchId: string, rowId: string, patch: Partial<DoctorClinicScheduleRow>) => void;
  onRemoveScheduleRow: (branchId: string, rowId: string) => void;

  // صور الفرع
  deletingImageIndex: number | null;
  onAddImageFromFile: (file: File) => Promise<void>;
  onRemoveBranchImage: (branchId: string, index: number) => Promise<void>;

  onInlineError: (message: string) => void;
}

export const DoctorAdBranchesSection: React.FC<DoctorAdBranchesSectionProps> = ({
  branches,
  activeBranchId,
  canAddBranch,
  onSetActiveBranchId,
  onAddBranch,
  onRemoveBranch,
  onRenameBranch,
  onUpdateBranchField,
  onAddServiceRow,
  onUpdateServiceRow,
  onRemoveServiceRow,
  onAddScheduleRow,
  onUpdateScheduleRow,
  onRemoveScheduleRow,
  deletingImageIndex,
  onAddImageFromFile,
  onRemoveBranchImage,
  onInlineError,
}) => {
  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const handleRemoveActiveBranch = () => {
    if (!activeBranch) return;
    if (branches.length <= 1) {
      onInlineError('لا يمكن حذف آخر فرع — يجب أن يكون لديك فرع واحد على الأقل.');
      return;
    }
    if (window.confirm(`هل تريد حذف "${activeBranch.name || 'الفرع'}"؟ هذا الإجراء لا يمكن التراجع عنه قبل الحفظ.`)) {
      onRemoveBranch(activeBranch.id);
    }
  };

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-black text-slate-700">فروع العيادة</h3>
        <p className="text-[11px] font-bold text-slate-500">{branches.length} من 5 فروع</p>
      </div>

      {/* شريط التبويبات: كل تبويب = فرع، وبعدهم زر "+ إضافة فرع" */}
      <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-100 pb-2">
        {branches.map((branch, idx) => {
          const isActive = branch.id === activeBranchId;
          const displayName = branch.name?.trim() || `فرع ${idx + 1}`;
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onSetActiveBranchId(branch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {displayName}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onAddBranch()}
          disabled={!canAddBranch}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          إضافة فرع
        </button>
        {branches.length > 1 && (
          <button
            type="button"
            onClick={handleRemoveActiveBranch}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a2 2 0 012-2h4a2 2 0 012 2v3" />
            </svg>
            حذف الفرع الحالي
          </button>
        )}
      </div>

      {/* تحرير الفرع النشط */}
      {activeBranch && (
        <BranchEditorCard
          branch={activeBranch}
          onRename={(name) => onRenameBranch(activeBranch.id, name)}
          onUpdateField={(field, value) => onUpdateBranchField(activeBranch.id, field, value)}
          onAddServiceRow={() => onAddServiceRow(activeBranch.id)}
          onUpdateServiceRow={(rowId, patch) => onUpdateServiceRow(activeBranch.id, rowId, patch)}
          onRemoveServiceRow={(rowId) => onRemoveServiceRow(activeBranch.id, rowId)}
          onAddScheduleRow={(row) => onAddScheduleRow(activeBranch.id, row)}
          onUpdateScheduleRow={(rowId, patch) => onUpdateScheduleRow(activeBranch.id, rowId, patch)}
          onRemoveScheduleRow={(rowId) => onRemoveScheduleRow(activeBranch.id, rowId)}
          deletingImageIndex={deletingImageIndex}
          onAddImageFromFile={onAddImageFromFile}
          onRemoveImage={(index) => onRemoveBranchImage(activeBranch.id, index)}
          onInlineError={onInlineError}
        />
      )}
    </section>
  );
};
