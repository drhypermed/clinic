import { describe, expect, it } from 'vitest';
import {
  clinicCutoffMinutesToTimeInput,
  clinicTimeInputToCutoffMinutes,
  getClinicDayKey,
  getMillisecondsUntilClinicDayChange,
  normalizeClinicDayCutoffMinutes,
  resolveStoredClinicDayKey,
} from '../../utils/clinicWorkday';

describe('clinic operational workday', () => {
  it('keeps after-midnight visits in the previous day until the 06:00 cutoff', () => {
    expect(getClinicDayKey('2026-07-29T05:59:59+03:00', 360)).toBe('2026-07-28');
    expect(getClinicDayKey('2026-07-29T06:00:00+03:00', 360)).toBe('2026-07-29');
    expect(getClinicDayKey('2026-07-29T23:59:59+03:00', 360)).toBe('2026-07-29');
  });

  it('handles month and year boundaries without invalid calendar arithmetic', () => {
    expect(getClinicDayKey('2026-03-01T02:00:00+02:00', 360)).toBe('2026-02-28');
    expect(getClinicDayKey('2027-01-01T01:00:00+02:00', 360)).toBe('2026-12-31');
  });

  it('supports midnight as an explicit calendar-day cutoff', () => {
    expect(getClinicDayKey('2026-07-29T00:01:00+03:00', 0)).toBe('2026-07-29');
  });

  it('never regroups stored visits after the branch setting changes', () => {
    expect(resolveStoredClinicDayKey(
      '2026-07-28',
      '2026-07-29T02:00:00+03:00',
    )).toBe('2026-07-28');

    // A legacy visit has no operational key, so its original Cairo calendar day wins.
    expect(resolveStoredClinicDayKey(
      undefined,
      '2026-07-29T02:00:00+03:00',
    )).toBe('2026-07-29');
  });

  it('normalizes persisted values and converts the time input exactly', () => {
    expect(normalizeClinicDayCutoffMinutes(-10)).toBe(0);
    expect(normalizeClinicDayCutoffMinutes(2000)).toBe(1439);
    expect(clinicTimeInputToCutoffMinutes('06:30')).toBe(390);
    expect(clinicCutoffMinutesToTimeInput(390)).toBe('06:30');
  });

  it('schedules the next rollover at the configured Cairo boundary', () => {
    const remaining = getMillisecondsUntilClinicDayChange(
      new Date('2026-07-29T05:30:00+03:00'),
      360,
    );
    expect(remaining).toBeGreaterThanOrEqual(30 * 60 * 1000);
    expect(remaining).toBeLessThan(31 * 60 * 1000);
  });
});
