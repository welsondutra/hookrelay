export interface BackoffOptions {
  baseMs?: number;
  capMs?: number;
  /** Fraction of the delay randomly added or removed, to avoid retry storms. */
  jitter?: number;
  random?: () => number;
}

/** Exponential backoff: base * 2^(attempt - 1), capped, with symmetric jitter. */
export function computeBackoffMs(attempt: number, options: BackoffOptions = {}): number {
  const { baseMs = 30_000, capMs = 3_600_000, jitter = 0.2, random = Math.random } = options;
  const exponential = Math.min(capMs, baseMs * 2 ** Math.max(0, attempt - 1));
  const spread = exponential * jitter * (random() * 2 - 1);
  return Math.max(0, Math.round(exponential + spread));
}
