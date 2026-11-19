import { signPayload, verifySignature } from './signature.js';

const secret = 'whsec_test';
const body = JSON.stringify({ hello: 'world' });
const issuedAt = new Date('2026-01-01T00:00:00Z');

describe('signature', () => {
  it('verifies a header it just produced', () => {
    const header = signPayload(secret, body, issuedAt);
    expect(verifySignature(secret, body, header, { now: issuedAt })).toBe(true);
  });

  it('rejects a tampered body', () => {
    const header = signPayload(secret, body, issuedAt);
    expect(verifySignature(secret, body + ' ', header, { now: issuedAt })).toBe(false);
  });

  it('rejects the wrong secret', () => {
    const header = signPayload(secret, body, issuedAt);
    expect(verifySignature('whsec_other', body, header, { now: issuedAt })).toBe(false);
  });

  it('rejects timestamps outside the tolerance window', () => {
    const header = signPayload(secret, body, issuedAt);
    const later = new Date(issuedAt.getTime() + 10 * 60 * 1000);
    expect(verifySignature(secret, body, header, { now: later })).toBe(false);
  });

  it('rejects malformed headers', () => {
    expect(verifySignature(secret, body, 'garbage', { now: issuedAt })).toBe(false);
    expect(verifySignature(secret, body, 't=abc,v1=00', { now: issuedAt })).toBe(false);
  });
});
