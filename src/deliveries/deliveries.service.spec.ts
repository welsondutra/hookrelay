import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { DeliveriesService } from './deliveries.service.js';
import type { Delivery } from './delivery.entity.js';

function makeDelivery(overrides: Partial<Delivery> = {}): Delivery {
  return {
    id: 'delivery-1',
    eventId: 'event-1',
    endpointId: 'endpoint-1',
    status: 'failed',
    attempts: 6,
    nextAttemptAt: null,
    lastStatusCode: 500,
    lastError: 'Endpoint answered with HTTP 500',
    deliveredAt: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

function makeService(stored: Delivery | null) {
  const repository = {
    findOneBy: async () => stored,
    save: async (delivery: Delivery) => delivery,
    find: async () => (stored ? [stored] : []),
  };
  return new DeliveriesService(repository as unknown as Repository<Delivery>);
}

describe('DeliveriesService', () => {
  it('resets a failed delivery so the worker picks it up again', async () => {
    const result = await makeService(makeDelivery()).redeliver('delivery-1');
    expect(result.status).toBe('pending');
    expect(result.attempts).toBe(0);
    expect(result.lastError).toBeNull();
    expect(result.nextAttemptAt).toBeInstanceOf(Date);
  });

  it('refuses to redeliver deliveries that are not failed', async () => {
    const service = makeService(makeDelivery({ status: 'delivered' }));
    await expect(service.redeliver('delivery-1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws NotFoundException for unknown deliveries', async () => {
    await expect(makeService(null).findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
