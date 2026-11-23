import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, type DeliveryStatus } from './delivery.entity.js';

export interface ListDeliveriesQuery {
  status?: DeliveryStatus;
  endpointId?: string;
  limit?: number;
}

@Injectable()
export class DeliveriesService {
  constructor(@InjectRepository(Delivery) private readonly repository: Repository<Delivery>) {}

  list({ status, endpointId, limit = 50 }: ListDeliveriesQuery): Promise<Delivery[]> {
    return this.repository.find({
      where: { ...(status && { status }), ...(endpointId && { endpointId }) },
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 200),
    });
  }

  async findOne(id: string): Promise<Delivery> {
    const delivery = await this.repository.findOneBy({ id });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    return delivery;
  }

  /** Puts a dead-lettered delivery back in the queue with a fresh attempt budget. */
  async redeliver(id: string): Promise<Delivery> {
    const delivery = await this.findOne(id);
    if (delivery.status !== 'failed') {
      throw new ConflictException(`Only failed deliveries can be redelivered, this one is ${delivery.status}`);
    }
    Object.assign(delivery, { status: 'pending', attempts: 0, nextAttemptAt: new Date(), lastError: null });
    return this.repository.save(delivery);
  }
}
