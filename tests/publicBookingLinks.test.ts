import { describe, expect, it } from 'vitest';
import {
  appendBranchToPublicBookingUrl,
  buildPublicBookingUrl,
  getPublicBookingOrigin,
  resolvePublicBookingBranchForLink,
} from '../utils/publicBookingLinks';
import {
  getPublicSlotBranchIds,
  reconcilePublicBranchesWithSlots,
} from '../utils/publicBookingBranchResolution';

describe('public booking links', () => {
  it('keeps localhost origins for local testing', () => {
    expect(
      buildPublicBookingUrl('abc123', {
        origin: 'http://localhost:5173',
        hostname: 'localhost',
      }),
    ).toBe('http://localhost:5173/p/abc123');
  });

  it('uses the stable public production domain when copied from clinic domain', () => {
    expect(
      buildPublicBookingUrl('abc123', {
        origin: 'https://clinic.drhypermed.com',
        hostname: 'clinic.drhypermed.com',
      }),
    ).toBe('https://www.drhypermed.com/p/abc123');
  });

  it('uses the public production domain for non-local hosts', () => {
    expect(
      getPublicBookingOrigin({
        origin: 'https://example.com',
        hostname: 'example.com',
      }),
    ).toBe('https://www.drhypermed.com');
  });

  it('adds only the verified branch id to public booking paths', () => {
    expect(
      appendBranchToPublicBookingUrl('/p/abc123', { id: 'branch-1', name: 'Maadi branch' }),
    ).toBe('/p/abc123?branch=branch-1');
  });

  it('removes old public-entry query params when building branch links', () => {
    expect(
      appendBranchToPublicBookingUrl('/p/abc123?entry=public-site&source=directory', {
        id: 'branch-1',
        name: 'Maadi branch',
      }),
    ).toBe('/p/abc123?branch=branch-1');
  });

  it('does not add an unverified branch to public booking links', () => {
    expect(
      appendBranchToPublicBookingUrl('/p/abc123', { id: '', name: 'Unlinked ad branch' }),
    ).toBe('/p/abc123');
  });

  it('resolves an advertisement branch to the real published booking branch', () => {
    expect(
      resolvePublicBookingBranchForLink(
        [
          { id: 'clinic-branch-1', name: 'Maadi branch' },
          { id: 'clinic-branch-2', name: 'Nasr City branch' },
        ],
        { id: 'ad-branch-random', name: 'Maadi branch' },
      ),
    ).toEqual({ id: 'clinic-branch-1', name: 'Maadi branch', address: '' });
  });

  it('refuses ambiguous branch-name matches', () => {
    expect(
      resolvePublicBookingBranchForLink(
        [
          { id: 'clinic-branch-1', name: 'Maadi branch' },
          { id: 'clinic-branch-2', name: 'Maadi branch' },
        ],
        { id: 'ad-branch-random', name: 'Maadi branch' },
      ),
    ).toBeNull();
  });

  it('resolves an ad branch by address when ids and names differ', () => {
    expect(
      resolvePublicBookingBranchForLink(
        [
          { id: 'main', name: 'Main', address: 'Benha - Main st' },
          { id: 'branch_2', name: 'Clinic branch', address: 'Benha - Side st' },
        ],
        { id: 'ad-branch-2', name: 'Ad branch 2', address: 'Benha - Side st' },
      ),
    ).toEqual({ id: 'branch_2', name: 'Clinic branch', address: 'Benha - Side st' });
  });

  it('maps a clearly-main ad branch to the real main booking branch', () => {
    expect(
      resolvePublicBookingBranchForLink(
        [
          { id: 'main', name: 'Main', address: 'Benha - Main st' },
          { id: 'branch_2', name: 'Second branch', address: 'Benha - Side st' },
        ],
        { id: 'ad-main-random', name: 'Main' },
      ),
    ).toEqual({ id: 'main', name: 'Main', address: 'Benha - Main st' });
  });

  it('does not silently map an unknown non-main ad branch to main', () => {
    expect(
      resolvePublicBookingBranchForLink(
        [
          { id: 'main', name: 'Main', address: 'Benha - Main st' },
          { id: 'branch_2', name: 'Second branch', address: 'Benha - Side st' },
        ],
        { id: 'ad-unknown', name: 'Unknown branch', address: 'Unknown address' },
      ),
    ).toBeNull();
  });

  it('reconciles stale published branch ids with real slot branch ids', () => {
    const slots = [
      { id: 'slot-1', dateTime: '2026-06-04T18:00:00.000Z', branchId: 'main' },
      { id: 'slot-2', dateTime: '2026-06-04T19:00:00.000Z', branchId: 'branch_2' },
    ];

    expect(getPublicSlotBranchIds(slots)).toEqual(['main', 'branch_2']);
    expect(
      reconcilePublicBranchesWithSlots(
        [
          { id: 'ad-main-random', name: 'Main', isActive: true },
          { id: 'branch_2', name: 'Second branch', isActive: true },
        ],
        getPublicSlotBranchIds(slots),
      ),
    ).toEqual([
      { id: 'main', name: 'Main', isActive: true },
      { id: 'branch_2', name: 'Second branch', isActive: true },
    ]);
  });
});
