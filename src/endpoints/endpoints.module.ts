import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endpoint } from './endpoint.entity.js';
import { EndpointsController } from './endpoints.controller.js';
import { EndpointsService } from './endpoints.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Endpoint])],
  controllers: [EndpointsController],
  providers: [EndpointsService],
  exports: [EndpointsService],
})
export class EndpointsModule {}
