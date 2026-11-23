import { Controller, Get, Param, ParseEnumPipe, ParseIntPipe, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service.js';
import type { Delivery, DeliveryStatus } from './delivery.entity.js';

const STATUSES: DeliveryStatus[] = ['pending', 'delivered', 'failed'];

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveries: DeliveriesService) {}

  @Get()
  list(
    @Query('status', new ParseEnumPipe(STATUSES, { optional: true })) status?: DeliveryStatus,
    @Query('endpointId', new ParseUUIDPipe({ optional: true })) endpointId?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<Delivery[]> {
    return this.deliveries.list({ status, endpointId, limit });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Delivery> {
    return this.deliveries.findOne(id);
  }

  @Post(':id/redeliver')
  redeliver(@Param('id', ParseUUIDPipe) id: string): Promise<Delivery> {
    return this.deliveries.redeliver(id);
  }
}
