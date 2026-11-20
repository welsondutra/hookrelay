import { SIGNATURE_HEADER, signPayload } from '../signing/signature.js';

export interface DeliveryRequest {
  url: string;
  secret: string;
  deliveryId: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface DeliveryOutcome {
  ok: boolean;
  statusCode: number | null;
  error: string | null;
}

export type FetchLike = (url: string, init: RequestInit) => Promise<Pick<Response, 'status' | 'ok'>>;

const REQUEST_TIMEOUT_MS = 10_000;

/** Sends one signed POST. Any non-2xx answer or network failure counts as a failed attempt. */
export async function deliverOnce(request: DeliveryRequest, fetchImpl: FetchLike = fetch): Promise<DeliveryOutcome> {
  const body = JSON.stringify({ id: request.eventId, type: request.eventType, data: request.payload });
  try {
    const response = await fetchImpl(request.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'hookrelay/0.1',
        'x-hookrelay-delivery': request.deliveryId,
        'x-hookrelay-event': request.eventType,
        [SIGNATURE_HEADER]: signPayload(request.secret, body),
      },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return response.ok
      ? { ok: true, statusCode: response.status, error: null }
      : { ok: false, statusCode: response.status, error: `Endpoint answered with HTTP ${response.status}` };
  } catch (error) {
    return { ok: false, statusCode: null, error: error instanceof Error ? error.message : 'Unknown delivery error' };
  }
}
