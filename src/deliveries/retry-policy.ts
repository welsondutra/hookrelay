import { computeBackoffMs } from './backoff.js';
import type { DeliveryOutcome } from './deliver.js';
import type { Delivery } from './delivery.entity.js';

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
}

export type DeliveryPatch = Pick<
  Delivery,
  'status' | 'attempts' | 'nextAttemptAt' | 'lastStatusCode' | 'lastError' | 'deliveredAt'
>;

/**
 * Decides the next state after an attempt: delivered, scheduled for retry,
 * or moved to the dead-letter state once the attempts are exhausted.
 */
export function planNextState(
  currentAttempts: number,
  outcome: DeliveryOutcome,
  policy: RetryPolicy,
  now: Date = new Date(),
  random: () => number = Math.random,
): DeliveryPatch {
  const attempts = currentAttempts + 1;
  const base = { attempts, lastStatusCode: outcome.statusCode, lastError: outcome.error };

  if (outcome.ok) {
    return { ...base, status: 'delivered', nextAttemptAt: null, deliveredAt: now };
  }
  if (attempts >= policy.maxAttempts) {
    return { ...base, status: 'failed', nextAttemptAt: null, deliveredAt: null };
  }
  const delay = computeBackoffMs(attempts, { baseMs: policy.baseDelayMs, random });
  return { ...base, status: 'pending', nextAttemptAt: new Date(now.getTime() + delay), deliveredAt: null };
}
