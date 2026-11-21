import { Module } from '@nestjs/common';
import { DeliveriesWorker } from './deliveries.worker.js';

@Module({
  providers: [DeliveriesWorker],
})
export class DeliveriesModule {}
