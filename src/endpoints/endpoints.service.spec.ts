import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import type { Endpoint } from './endpoint.entity.js';
import { EndpointsService, generateSecret, toPublic } from './endpoints.service.js';
import { UpdateEndpointDto } from './dto/update-endpoint.dto.js';

function makeEndpoint(overrides: Partial<Endpoint> = {}): Endpoint {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    url: 'https://example.com/hook',
    secret: 'whsec_test',
    description: 'original',
    enabled: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

function makeService(stored: Endpoint | null) {
  const repository = {
    create: (data: Partial<Endpoint>) => Object.assign(makeEndpoint(), data),
    save: async (endpoint: Endpoint) => endpoint,
    find: async () => (stored ? [stored] : []),
    findOneBy: async () => stored,
    remove: async (endpoint: Endpoint) => endpoint,
  };
  return new EndpointsService(repository as unknown as Repository<Endpoint>);
}

describe('EndpointsService', () => {
  it('generates a prefixed random secret on create', async () => {
    const created = await makeService(null).create({ url: 'https://example.com/hook' });
    expect(created.secret).toMatch(/^whsec_[0-9a-f]{48}$/);
    expect(created.description).toBeNull();
  });

  it('throws NotFoundException for unknown ids', async () => {
    await expect(makeService(null).findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('keeps existing fields when an update omits them', async () => {
    const service = makeService(makeEndpoint());
    // Instantiating the DTO reproduces the empty fields a real request produces.
    const dto = Object.assign(new UpdateEndpointDto(), { enabled: false });
    const updated = await service.update('11111111-1111-1111-1111-111111111111', dto);
    expect(updated.url).toBe('https://example.com/hook');
    expect(updated.description).toBe('original');
    expect(updated.enabled).toBe(false);
  });

  it('never exposes the secret in the public shape', () => {
    expect(toPublic(makeEndpoint())).not.toHaveProperty('secret');
    expect(generateSecret()).not.toBe(generateSecret());
  });
});
