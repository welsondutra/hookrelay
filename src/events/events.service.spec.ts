import type { DataSource, EntityManager } from 'typeorm';
import { EventsService } from './events.service.js';

function makeService(enabledEndpoints: number, eventTypes: string[][] = []) {
  const saved: unknown[] = [];
  const manager = {
    create: (_entity: unknown, data: Record<string, unknown>) => ({ ...data, id: `id-${saved.length}` }),
    save: async (value: unknown) => {
      saved.push(value);
      return Array.isArray(value) ? value : { ...(value as object), id: 'event-1' };
    },
    findBy: async () => Array.from({ length: enabledEndpoints }, (_, i) => ({ id: `endpoint-${i}`, eventTypes: eventTypes[i] ?? [] })),
  } as unknown as EntityManager;
  const dataSource = { transaction: async (work: (m: EntityManager) => unknown) => work(manager) } as unknown as DataSource;
  return { service: new EventsService(dataSource), saved };
}

describe('EventsService', () => {
  it('creates one pending delivery per enabled endpoint', async () => {
    const { service, saved } = makeService(3);
    const result = await service.ingest({ type: 'order.created', payload: { id: 1 } });
    expect(result).toEqual({ id: 'event-1', type: 'order.created', deliveries: 3 });
    const deliveries = saved[1] as Array<{ status: string; eventId: string }>;
    expect(deliveries).toHaveLength(3);
    expect(deliveries.every((d) => d.status === 'pending' && d.eventId === 'event-1')).toBe(true);
  });

  it('stores the event even when no endpoint is enabled', async () => {
    const { service, saved } = makeService(0);
    const result = await service.ingest({ type: 'ping', payload: {} });
    expect(result.deliveries).toBe(0);
    expect(saved).toHaveLength(1);
  });
});
