import { planNextState } from './retry-policy.js';

const policy = { maxAttempts: 3, baseDelayMs: 1000 };
const now = new Date('2026-01-01T00:00:00Z');
const failure = { ok: false, statusCode: 503, error: 'Endpoint answered with HTTP 503' };

describe('planNextState', () => {
  it('marks the delivery as delivered on success', () => {
    const patch = planNextState(0, { ok: true, statusCode: 200, error: null }, policy, now);
    expect(patch).toMatchObject({ status: 'delivered', attempts: 1, nextAttemptAt: null, deliveredAt: now });
  });

  it('schedules a retry with backoff after a failure', () => {
    const patch = planNextState(0, failure, policy, now, () => 0.5);
    expect(patch.status).toBe('pending');
    expect(patch.attempts).toBe(1);
    expect(patch.nextAttemptAt?.getTime()).toBe(now.getTime() + 1000);
    expect(patch.lastStatusCode).toBe(503);
  });

  it('waits longer after each consecutive failure', () => {
    const second = planNextState(1, failure, policy, now, () => 0.5);
    expect(second.nextAttemptAt?.getTime()).toBe(now.getTime() + 2000);
  });

  it('moves the delivery to failed once attempts are exhausted', () => {
    const patch = planNextState(2, failure, policy, now);
    expect(patch).toMatchObject({ status: 'failed', attempts: 3, nextAttemptAt: null });
    expect(patch.lastError).toContain('503');
  });
});
