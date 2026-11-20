import { computeBackoffMs } from './backoff.js';

const noJitter = { jitter: 0 };

describe('computeBackoffMs', () => {
  it('doubles the delay on every attempt', () => {
    expect(computeBackoffMs(1, noJitter)).toBe(30_000);
    expect(computeBackoffMs(2, noJitter)).toBe(60_000);
    expect(computeBackoffMs(3, noJitter)).toBe(120_000);
  });

  it('never exceeds the cap', () => {
    expect(computeBackoffMs(20, noJitter)).toBe(3_600_000);
  });

  it('keeps jitter within the configured fraction', () => {
    const low = computeBackoffMs(1, { random: () => 0 });
    const high = computeBackoffMs(1, { random: () => 1 });
    expect(low).toBe(24_000);
    expect(high).toBe(36_000);
  });
});
