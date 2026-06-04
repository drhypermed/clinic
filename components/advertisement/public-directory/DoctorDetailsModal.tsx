import React from 'react';
import { createPortal } from 'react-dom';
import type { DoctorAdProfile, DoctorClinicScheduleRow } from '../../../types';
import { DoctorPublicProfileView } from './DoctorPublicProfileView';

interface DoctorDetailsModalProps {
  selectedDoctor: DoctorAdProfile | null;
  selectedDoctorFilledSchedule: DoctorClinicScheduleRow[];
  selectedDoctorRatingStats: { count: number; average: number };
  onClose: () => void;
  onPreviewAvatar: (url: string) => void;
  onPreviewGalleryImage: (url: string) => void;
  onOpenDoctorReviews: (doctor: DoctorAdProfile) => void;
}

export const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  selectedDoctor,
  onClose,
  onPreviewAvatar,
  onPreviewGalleryImage,
  onOpenDoctorReviews,
}) => {
  if (!selectedDoctor) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm md:p-5"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-lg border border-white/60 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <DoctorPublicProfileView
          doctor={selectedDoctor}
          mode="preview"
          headerLabel="الملف الكامل"
          showBookingAction={false}
          showBranchContactActions
          onClose={onClose}
          onAvatarClick={onPreviewAvatar}
          onImageClick={onPreviewGalleryImage}
          onOpenReviews={onOpenDoctorReviews}
        />
      </div>
    </div>,
    document.body
  );
};
