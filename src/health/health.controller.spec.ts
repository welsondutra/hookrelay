import { ServiceUnavailableException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports ok when the database answers', async () => {
    const controller = new HealthController({ query: async () => [{ '?column?': 1 }] } as unknown as DataSource);
    await expect(controller.check()).resolves.toMatchObject({ status: 'ok', database: 'up' });
  });

  it('answers 503 when the database is unreachable', async () => {
    const dataSource = {
      query: async () => {
        throw new Error('connection refused');
      },
    } as unknown as DataSource;
    await expect(new HealthController(dataSource).check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
