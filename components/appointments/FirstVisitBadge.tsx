import React from 'react';

type Props = { isFirstVisit?: boolean };

export const FirstVisitBadge: React.FC<Props> = ({ isFirstVisit }) => {
  if (isFirstVisit === true) {
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">أول زيارة</span>
    );
  }
  if (isFirstVisit === false) {
    return (
      <span className="rounded-full border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-800">زار سابقًا</span>
    );
  }
  return null;
};
