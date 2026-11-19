import { createHmac, timingSafeEqual } from 'node:crypto';

export const SIGNATURE_HEADER = 'x-hookrelay-signature';
const DEFAULT_TOLERANCE_SECONDS = 300;

function computeSignature(secret: string, timestamp: number, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

/** Builds the header value: `t=<unix seconds>,v1=<hex hmac>`. */
export function signPayload(secret: string, body: string, now: Date = new Date()): string {
  const timestamp = Math.floor(now.getTime() / 1000);
  return `t=${timestamp},v1=${computeSignature(secret, timestamp, body)}`;
}

export interface VerifyOptions {
  now?: Date;
  toleranceSeconds?: number;
}

/** Verifies a header produced by signPayload, rejecting stale timestamps to block replays. */
export function verifySignature(secret: string, body: string, header: string, options: VerifyOptions = {}): boolean {
  const parts = Object.fromEntries(header.split(',').map((part) => part.trim().split('=') as [string, string]));
  const timestamp = Number(parts.t);
  const received = parts.v1;
  if (!Number.isInteger(timestamp) || !received) return false;

  const now = Math.floor((options.now ?? new Date()).getTime() / 1000);
  if (Math.abs(now - timestamp) > (options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS)) return false;

  const expected = Buffer.from(computeSignature(secret, timestamp, body), 'hex');
  const actual = Buffer.from(received, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
