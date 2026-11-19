import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Delivery } from '../deliveries/delivery.entity.js';
import { Endpoint } from '../endpoints/endpoint.entity.js';
import type { CreateEventDto } from './dto/create-event.dto.js';
import { Event } from './event.entity.js';

export interface IngestResult {
  id: string;
  type: string;
  deliveries: number;
}

@Injectable()
export class EventsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** Stores the event and schedules one delivery per enabled endpoint, atomically. */
  ingest(dto: CreateEventDto): Promise<IngestResult> {
    return this.dataSource.transaction(async (manager) => {
      const event = await manager.save(manager.create(Event, { type: dto.type, payload: dto.payload }));
      const endpoints = await manager.findBy(Endpoint, { enabled: true });
      const now = new Date();
      const deliveries = endpoints.map((endpoint) =>
        manager.create(Delivery, { eventId: event.id, endpointId: endpoint.id, status: 'pending', nextAttemptAt: now }),
      );
      if (deliveries.length > 0) await manager.save(deliveries);
      return { id: event.id, type: event.type, deliveries: deliveries.length };
    });
  }
}
