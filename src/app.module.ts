import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { DeliveriesModule } from './deliveries/deliveries.module.js';
import { EndpointsModule } from './endpoints/endpoints.module.js';
import { EventsModule } from './events/events.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    DatabaseModule,
    EndpointsModule,
    EventsModule,
    DeliveriesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
