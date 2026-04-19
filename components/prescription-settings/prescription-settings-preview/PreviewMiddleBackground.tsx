/**
 * PreviewMiddleBackground:
 * طبقة صورة خلفية القسم الأوسط — مكرّرة في vitals/middle/print.
 * فُصِلت في مكوّن واحد لتجنّب تكرار نفس الـ JSX 3 مرات.
 */
import React from 'react';
import type { PrescriptionSettings } from '../../../types';

interface Props {
  middle: PrescriptionSettings['middle'];
}

export const PreviewMiddleBackground: React.FC<Props> = ({ middle }) => {
  if (!middle?.middleBackgroundImage) return null;
  return (
    <div
      style={{
        position: 'absolute',
        width: `${middle.middleBgScale ?? 100}%`,
        height: `${middle.middleBgScale ?? 100}%`,
        left: `${middle.middleBgPosX ?? 50}%`,
        top: `${middle.middleBgPosY ?? 50}%`,
        transform: 'translate(-50%, -50%)',
        backgroundImage: `url(${middle.middleBackgroundImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: middle.middleBgOpacity ?? 1,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
