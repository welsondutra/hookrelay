import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveriesController } from './deliveries.controller.js';
import { DeliveriesService } from './deliveries.service.js';
import { DeliveriesWorker } from './deliveries.worker.js';
import { Delivery } from './delivery.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery])],
  controllers: [DeliveriesController],
  providers: [DeliveriesService, DeliveriesWorker],
})
export class DeliveriesModule {}
