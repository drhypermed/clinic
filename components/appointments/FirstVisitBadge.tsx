import React from 'react';

type Props = { isFirstVisit?: boolean };

export const FirstVisitBadge: React.FC<Props> = ({ isFirstVisit }) => {
  if (isFirstVisit === true) {
    return (
      <span className="rounded-full border border-success-200 bg-success-100 px-2 py-0.5 text-[10px] font-black text-success-800">أول زيارة</span>
    );
  }
  if (isFirstVisit === false) {
    return (
      <span className="rounded-full border border-brand-200 bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-800">زار سابقًا</span>
    );
  }
  return null;
};
