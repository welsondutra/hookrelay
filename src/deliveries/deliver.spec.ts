import { deliverOnce, type DeliveryRequest, type FetchLike } from './deliver.js';
import { verifySignature } from '../signing/signature.js';

const request: DeliveryRequest = {
  url: 'https://example.com/hook',
  secret: 'whsec_test',
  deliveryId: 'delivery-1',
  eventId: 'event-1',
  eventType: 'order.created',
  payload: { id: 42 },
};

describe('deliverOnce', () => {
  it('posts a signed body and reports success on 2xx', async () => {
    let captured: { url: string; init: RequestInit } | undefined;
    const fetchImpl: FetchLike = async (url, init) => {
      captured = { url, init };
      return { ok: true, status: 200 };
    };

    const outcome = await deliverOnce(request, fetchImpl);

    expect(outcome).toEqual({ ok: true, statusCode: 200, error: null });
    const headers = captured!.init.headers as Record<string, string>;
    expect(headers['x-hookrelay-event']).toBe('order.created');
    expect(verifySignature('whsec_test', captured!.init.body as string, headers['x-hookrelay-signature'])).toBe(true);
  });

  it('reports the status code when the endpoint rejects the request', async () => {
    const outcome = await deliverOnce(request, async () => ({ ok: false, status: 500 }));
    expect(outcome).toEqual({ ok: false, statusCode: 500, error: 'Endpoint answered with HTTP 500' });
  });

  it('turns network errors into a failed outcome instead of throwing', async () => {
    const outcome = await deliverOnce(request, async () => {
      throw new Error('connect ECONNREFUSED');
    });
    expect(outcome).toEqual({ ok: false, statusCode: null, error: 'connect ECONNREFUSED' });
  });
});
