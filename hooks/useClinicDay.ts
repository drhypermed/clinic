import { useEffect, useState } from 'react';
import { financialDataService } from '../services/financial-data';
import {
  DEFAULT_CLINIC_DAY_CUTOFF_MINUTES,
  getClinicDayKey,
  getMillisecondsUntilClinicDayChange,
  normalizeClinicDayCutoffMinutes,
} from '../utils/clinicWorkday';

export const useClinicDayCutoff = (userId?: string, branchId?: string): number => {
  const [cutoffMinutes, setCutoffMinutes] = useState(DEFAULT_CLINIC_DAY_CUTOFF_MINUTES);

  useEffect(() => {
    if (!userId) {
      setCutoffMinutes(DEFAULT_CLINIC_DAY_CUTOFF_MINUTES);
      return;
    }
    return financialDataService.subscribeToPrices(
      userId,
      (prices) => setCutoffMinutes(
        normalizeClinicDayCutoffMinutes(prices.clinicDayCutoffMinutes),
      ),
      undefined,
      branchId,
    );
  }, [userId, branchId]);

  return cutoffMinutes;
};

export const useCurrentClinicDayKey = (cutoffMinutes: number): string => {
  const normalizedCutoff = normalizeClinicDayCutoffMinutes(cutoffMinutes);
  const [dayKey, setDayKey] = useState(
    () => getClinicDayKey(new Date(), normalizedCutoff),
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      const now = new Date();
      setDayKey(getClinicDayKey(now, normalizedCutoff));
      timer = setTimeout(
        refresh,
        getMillisecondsUntilClinicDayChange(now, normalizedCutoff),
      );
    };
    refresh();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [normalizedCutoff]);

  return dayKey;
};
