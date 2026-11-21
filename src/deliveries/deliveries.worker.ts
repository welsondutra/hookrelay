import { Injectable, Logger, type OnApplicationBootstrap, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import type { Env } from '../config/env.validation.js';
import { Endpoint } from '../endpoints/endpoint.entity.js';
import { Event } from '../events/event.entity.js';
import { deliverOnce } from './deliver.js';
import { Delivery } from './delivery.entity.js';
import { planNextState, type RetryPolicy } from './retry-policy.js';

const BATCH_SIZE = 10;
// While an attempt is in flight the row is pushed forward so other workers skip it.
const LEASE_MS = 60_000;

@Injectable()
export class DeliveriesWorker implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(DeliveriesWorker.name);
  private timer?: NodeJS.Timeout;
  private busy = false;
  private readonly policy: RetryPolicy;
  private readonly pollIntervalMs: number;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    config: ConfigService<Env, true>,
  ) {
    this.policy = {
      maxAttempts: config.get('DELIVERY_MAX_ATTEMPTS', { infer: true }),
      baseDelayMs: config.get('DELIVERY_BASE_DELAY_MS', { infer: true }),
    };
    this.pollIntervalMs = config.get('DELIVERY_POLL_INTERVAL_MS', { infer: true });
  }

  onApplicationBootstrap(): void {
    this.timer = setInterval(() => void this.tick(), this.pollIntervalMs);
  }

  onApplicationShutdown(): void {
    clearInterval(this.timer);
  }

  async tick(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      const due = await this.claimDue();
      await Promise.all(due.map((delivery) => this.process(delivery)));
    } catch (error) {
      this.logger.error(`Delivery tick failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.busy = false;
    }
  }

  private claimDue(): Promise<Delivery[]> {
    return this.dataSource.transaction(async (manager) => {
      const due = await manager
        .createQueryBuilder(Delivery, 'd')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where(`d.status = 'pending' AND d."nextAttemptAt" <= :now`, { now: new Date() })
        .orderBy('d."nextAttemptAt"', 'ASC')
        .limit(BATCH_SIZE)
        .getMany();
      if (due.length > 0) {
        await manager.update(
          Delivery,
          { id: In(due.map((d) => d.id)) },
          { nextAttemptAt: new Date(Date.now() + LEASE_MS) },
        );
      }
      return due;
    });
  }

  private async process(delivery: Delivery): Promise<void> {
    const [endpoint, event] = await Promise.all([
      this.dataSource.getRepository(Endpoint).findOneBy({ id: delivery.endpointId }),
      this.dataSource.getRepository(Event).findOneBy({ id: delivery.eventId }),
    ]);

    const outcome =
      endpoint && event
        ? await deliverOnce({
            url: endpoint.url,
            secret: endpoint.secret,
            deliveryId: delivery.id,
            eventId: event.id,
            eventType: event.type,
            payload: event.payload,
          })
        : { ok: false, statusCode: null, error: 'Endpoint or event no longer exists' };

    const patch = planNextState(delivery.attempts, outcome, this.policy);
    await this.dataSource.getRepository(Delivery).update({ id: delivery.id }, patch);
    this.logger.log(`Delivery ${delivery.id} attempt ${patch.attempts}: ${patch.status}`);
  }
}
