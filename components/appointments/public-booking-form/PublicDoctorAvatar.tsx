import React from 'react';

type PublicDoctorAvatarProps = {
  imageUrl?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'h-11 w-11 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-[4.5rem] w-[4.5rem] text-xl',
};

const getInitials = (name?: string): string => {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join('');
  return initials || 'د';
};

export const PublicDoctorAvatar: React.FC<PublicDoctorAvatarProps> = ({
  imageUrl,
  name,
  size = 'md',
}) => {
  const [failed, setFailed] = React.useState(false);
  const safeImageUrl = String(imageUrl || '').trim();
  const showImage = Boolean(safeImageUrl && !failed);

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 overflow-hidden rounded-lg border-2 border-white/40 bg-gradient-to-br from-brand-100 to-sky-100 text-brand-700 shadow-lg ring-2 ring-white/60`}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={safeImageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-sky-50 font-black">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};
