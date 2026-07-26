import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
type SecretaryUsernameFunctionsModule = ((context: Record<string, unknown>) => {
  setSecretaryUsername: (request: Record<string, unknown>) => Promise<unknown>;
}) & {
  parseSecretaryLoginIdentifier: (data: Record<string, unknown>) => {
    loginIdentifier: string;
    secretaryUsername: string;
  };
};

const registerSecretaryUsernameFunctions = require(
  '../../functions/src/functions/secretaryUsernameFunctions.js'
) as SecretaryUsernameFunctionsModule;
const registerSecretaryLoginFunctions = require(
  '../../functions/src/functions/secretaryLoginFunctions.js'
) as (context: Record<string, unknown>) => {
  secretaryLogin: (request: Record<string, unknown>) => Promise<unknown>;
};

class TestHttpsError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const createFirestoreStub = (initialDocs: Record<string, Record<string, unknown>>) => {
  const docs = new Map(Object.entries(initialDocs));
  const writes: Array<{ path: string; data: Record<string, unknown> }> = [];
  const deletes: string[] = [];
  const makeRef = (path: string): any => ({
    path,
    collection: (name: string) => makeCollection(`${path}/${name}`),
  });
  const makeCollection = (path: string): any => ({
    doc: (id: string) => makeRef(`${path}/${id}`),
  });
  const snapshotFor = (path: string) => ({
    exists: docs.has(path),
    data: () => docs.get(path),
  });

  return {
    writes,
    deletes,
    db: {
      collection: makeCollection,
      runTransaction: async (callback: (transaction: Record<string, unknown>) => Promise<void>) =>
        callback({
          get: async (ref: { path: string }) => snapshotFor(ref.path),
          set: (ref: { path: string }, data: Record<string, unknown>) => {
            writes.push({ path: ref.path, data });
          },
          delete: (ref: { path: string }) => {
            deletes.push(ref.path);
          },
        }),
    },
  };
};

const makeHandler = (db: unknown) => registerSecretaryUsernameFunctions({
  HttpsError: TestHttpsError,
  getDb: () => db,
  admin: { firestore: { Timestamp: { now: () => 'now' } } },
}).setSecretaryUsername;

describe('setSecretaryUsername', () => {
  it('claims the username without replacing the doctor or branch identity', async () => {
    const secret = 'b_1234567890';
    const { db, writes, deletes } = createFirestoreStub({
      'users/doctor-1': { bookingSecret: secret, doctorEmail: 'doctor@example.com' },
      'secretaryLoginIndex/doctor@example.com': { userId: 'doctor-1' },
    });

    await makeHandler(db)({
      auth: { uid: 'doctor-1', token: {} },
      data: { username: 'Clinic.One', branchId: 'main', secret },
    });

    expect(writes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: 'secretaryUsernameIndex/clinic.one',
        data: expect.objectContaining({ userId: 'doctor-1', branchId: 'main' }),
      }),
      expect.objectContaining({
        path: 'users/doctor-1',
        data: expect.objectContaining({ secretaryUsernameByBranch: { main: 'clinic.one' } }),
      }),
      expect.objectContaining({ path: `bookingConfig/${secret}` }),
    ]));
    expect(deletes).toContain('secretaryLoginIndex/doctor@example.com');
  });

  it('rejects a username that is still owned by another doctor branch', async () => {
    const secret = 'b_1234567890';
    const { db, writes } = createFirestoreStub({
      'users/doctor-1': { bookingSecret: secret },
      'users/doctor-2': { secretaryUsernameByBranch: { main: 'clinic.one' } },
      'secretaryUsernameIndex/clinic.one': {
        username: 'clinic.one',
        userId: 'doctor-2',
        branchId: 'main',
      },
    });

    await expect(makeHandler(db)({
      auth: { uid: 'doctor-1', token: {} },
      data: { username: 'clinic.one', branchId: 'main', secret },
    })).rejects.toMatchObject({ code: 'already-exists', message: 'SECRETARY_USERNAME_TAKEN' });
    expect(writes).toHaveLength(0);
  });
});

describe('parseSecretaryLoginIdentifier', () => {
  it('does not accept the legacy doctor email field as a secretary login identifier', () => {
    expect(registerSecretaryUsernameFunctions.parseSecretaryLoginIdentifier({
      doctorEmail: 'doctor@example.com',
    })).toEqual({ loginIdentifier: '', secretaryUsername: '' });
  });

  it('normalizes a secretary username', () => {
    expect(registerSecretaryUsernameFunctions.parseSecretaryLoginIdentifier({
      secretaryUsername: ' Clinic.One ',
    })).toEqual({ loginIdentifier: 'clinic.one', secretaryUsername: 'clinic.one' });
  });
});

describe('secretaryLogin', () => {
  it('rejects legacy email-only login before reading Firestore', async () => {
    const handler = registerSecretaryLoginFunctions({
      HttpsError: TestHttpsError,
      getDb: () => {
        throw new Error('Firestore should not be read for legacy email login');
      },
      admin: {},
      getCairoDateKey: () => '2026-07-18',
    }).secretaryLogin;

    await expect(handler({
      data: {
        doctorEmail: 'doctor@example.com',
        secretaryPassword: 'secret123',
      },
    })).rejects.toMatchObject({
      code: 'invalid-argument',
      message: 'MISSING_LOGIN_IDENTIFIER',
    });
  });
});
