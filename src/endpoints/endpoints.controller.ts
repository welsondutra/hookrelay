import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreateEndpointDto } from './dto/create-endpoint.dto.js';
import { UpdateEndpointDto } from './dto/update-endpoint.dto.js';
import { EndpointsService, toPublic, type PublicEndpoint } from './endpoints.service.js';
import type { Endpoint } from './endpoint.entity.js';

@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpoints: EndpointsService) {}

  // The signing secret is only ever returned once, when the endpoint is created.
  @Post()
  create(@Body() dto: CreateEndpointDto): Promise<Endpoint> {
    return this.endpoints.create(dto);
  }

  @Get()
  async findAll(): Promise<PublicEndpoint[]> {
    return (await this.endpoints.findAll()).map(toPublic);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PublicEndpoint> {
    return toPublic(await this.endpoints.findOne(id));
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEndpointDto): Promise<PublicEndpoint> {
    return toPublic(await this.endpoints.update(id, dto));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.endpoints.remove(id);
  }
}
