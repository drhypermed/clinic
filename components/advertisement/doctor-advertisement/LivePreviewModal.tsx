import React from 'react';
import { createPortal } from 'react-dom';
import type { DoctorAdProfile, DoctorClinicScheduleRow } from '../../../types';
import { DoctorPublicProfileView } from '../public-directory/DoctorPublicProfileView';

interface LivePreviewModalProps {
  showPreview: boolean;
  onClose: () => void;
  profileImage?: string;
  previewData: DoctorAdProfile;
  imageUrls: string[];
  normalizeScheduleRows?: (rows: DoctorClinicScheduleRow[] | undefined | null) => DoctorClinicScheduleRow[];
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  showPreview,
  onClose,
  profileImage,
  previewData,
}) => {
  if (!showPreview) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm md:p-5"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-lg border border-white/60 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <DoctorPublicProfileView
          doctor={previewData}
          mode="preview"
          profileImage={profileImage}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
};
