import React from 'react';
import type { SecretaryVitalsInput, SecretaryVitalsVisibility } from '../../types';
import { toSecretaryVitalsEntries } from '../../utils/secretaryVitals';

type SecretaryVitalsPillsProps = {
  vitals?: SecretaryVitalsInput;
  visibility?: SecretaryVitalsVisibility;
  title?: string;
  className?: string;
  compact?: boolean;
  separator?: string;
};

export const SecretaryVitalsPills: React.FC<SecretaryVitalsPillsProps> = ({
  vitals,
  visibility,
  title = 'القياسات والعلامات الحيوية',
  className = '',
  compact = false,
}) => {
  const entries = toSecretaryVitalsEntries(vitals, { visibility });
  if (entries.length === 0) return null;

  return (
    <div className={`${className}`.trim()}>
      {title && (
        <p className={`font-black text-warning-800 mb-1.5 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{title}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {entries.map((entry) => (
          <span
            key={entry.key}
            className={`inline-flex items-center gap-1 rounded-full border border-warning-200 bg-warning-50 font-bold text-warning-800 ${
              compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
            }`}
          >
            <span className="font-black">{entry.shortLabel || entry.label}</span>
            <span className="text-warning-600">{entry.value}{entry.unit ? ` ${entry.unit}` : ''}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
