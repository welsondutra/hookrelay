import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Env } from '../config/env.validation.js';
import { Delivery } from '../deliveries/delivery.entity.js';
import { Endpoint } from '../endpoints/endpoint.entity.js';
import { Event } from '../events/event.entity.js';
import { CreateEndpoints1763400000000 } from './migrations/1763400000000-CreateEndpoints.js';
import { CreateEventsAndDeliveries1763400100000 } from './migrations/1763400100000-CreateEventsAndDeliveries.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        type: 'postgres' as const,
        host: config.get('DATABASE_HOST', { infer: true }),
        port: config.get('DATABASE_PORT', { infer: true }),
        username: config.get('DATABASE_USER', { infer: true }),
        password: config.get('DATABASE_PASSWORD', { infer: true }),
        database: config.get('DATABASE_NAME', { infer: true }),
        entities: [Endpoint, Event, Delivery],
        migrations: [CreateEndpoints1763400000000, CreateEventsAndDeliveries1763400100000],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
