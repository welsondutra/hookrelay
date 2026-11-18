import { randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CreateEndpointDto } from './dto/create-endpoint.dto.js';
import type { UpdateEndpointDto } from './dto/update-endpoint.dto.js';
import { Endpoint } from './endpoint.entity.js';

export type PublicEndpoint = Omit<Endpoint, 'secret'>;

export function generateSecret(): string {
  return `whsec_${randomBytes(24).toString('hex')}`;
}

export function toPublic(endpoint: Endpoint): PublicEndpoint {
  const { secret: _secret, ...rest } = endpoint;
  return rest;
}

@Injectable()
export class EndpointsService {
  constructor(@InjectRepository(Endpoint) private readonly repository: Repository<Endpoint>) {}

  create(dto: CreateEndpointDto): Promise<Endpoint> {
    const endpoint = this.repository.create({
      url: dto.url,
      description: dto.description ?? null,
      secret: generateSecret(),
    });
    return this.repository.save(endpoint);
  }

  findAll(): Promise<Endpoint[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Endpoint> {
    const endpoint = await this.repository.findOneBy({ id });
    if (!endpoint) throw new NotFoundException(`Endpoint ${id} not found`);
    return endpoint;
  }

  async update(id: string, dto: UpdateEndpointDto): Promise<Endpoint> {
    const endpoint = await this.findOne(id);
    // DTO classes declare every field, so skip the ones the client did not send.
    const changes = Object.fromEntries(Object.entries(dto).filter(([, value]) => value !== undefined));
    Object.assign(endpoint, changes);
    return this.repository.save(endpoint);
  }

  async remove(id: string): Promise<void> {
    const endpoint = await this.findOne(id);
    await this.repository.remove(endpoint);
  }
}
