import React from 'react';
import { StatCard } from '../records/recordsViewParts';

interface AppointmentsStatsProps {
  bookedInLastMonth: number;
  todayCount: number;
  upcomingCount: number;
  completedInLastMonth: number;
}

export const AppointmentsStats: React.FC<AppointmentsStatsProps> = ({
  bookedInLastMonth,
  todayCount,
  upcomingCount,
  completedInLastMonth,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    <StatCard label="مواعيد اليوم" value={todayCount} tone="blue" />
    <StatCard label="مواعيد قادمة" value={upcomingCount} tone="amber" />
    <StatCard label="حجوزات آخر شهر" value={bookedInLastMonth} tone="indigo" />
    <StatCard label="منفذة آخر شهر" value={completedInLastMonth} tone="emerald" />
  </div>
);
