import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { tryMatchSecretaryPasswordAcrossBranches } = require('../../functions/src/functions/secretaryBranchAuth.js') as {
  tryMatchSecretaryPasswordAcrossBranches: (args: Record<string, unknown>) => Promise<unknown>;
};

describe('secretary branch-bound login', () => {
  it('does not accept a password from another branch when a branch is preferred', async () => {
    const db = {
      collection: (collectionName: string) => ({
        doc: () => ({
          collection: () => ({
            doc: () => ({
              get: async () => ({
                exists: true,
                data: () => ({ passwordHash: 'branch-password' }),
              }),
            }),
            get: async () => ({ docs: [{ id: 'branch-b' }] }),
          }),
          get: async () => ({ exists: collectionName === 'users', data: () => ({}) }),
        }),
      }),
    };

    const result = await tryMatchSecretaryPasswordAcrossBranches({
      db,
      admin: {},
      auth: {
        secretaryPasswordHash: 'main-password',
        secretarySessionToken: '',
        secretarySessionTokenUpdatedAtMs: 0,
      },
      secret: 'b_mainsecret000000',
      userId: 'doctor-1',
      secretaryPassword: 'main-password',
      resolvedDoctorEmail: 'doctor@example.com',
      verifyPassword: (plain: string, hash: string) => plain === hash,
      hashPassword: () => 'new-hash',
      generateSessionToken: () => 'new-token',
      nowMs: Date.now(),
      nowTs: {},
      preferredBranchId: 'branch-b',
    });

    expect(result).toBeNull();
  });
});
