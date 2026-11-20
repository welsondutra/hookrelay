import { validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('applies defaults and requires the database password', () => {
    const env = validateEnv({ DATABASE_PASSWORD: 'secret' });
    expect(env.PORT).toBe(3000);
    expect(env.DATABASE_HOST).toBe('localhost');
    expect(env.DATABASE_PORT).toBe(5432);
  });

  it('throws when the database password is missing', () => {
    expect(() => validateEnv({})).toThrow('DATABASE_PASSWORD is required');
  });

  it('rejects invalid ports', () => {
    expect(() => validateEnv({ DATABASE_PASSWORD: 'x', PORT: 'abc' })).toThrow('PORT must be a valid port');
    expect(() => validateEnv({ DATABASE_PASSWORD: 'x', DATABASE_PORT: '70000' })).toThrow('DATABASE_PORT');
  });

  it('exposes delivery tuning with sensible defaults', () => {
    const env = validateEnv({ DATABASE_PASSWORD: 'secret' });
    expect(env.DELIVERY_POLL_INTERVAL_MS).toBe(2000);
    expect(env.DELIVERY_BASE_DELAY_MS).toBe(30000);
    expect(env.DELIVERY_MAX_ATTEMPTS).toBe(6);
  });

  it('rejects non-positive delivery settings', () => {
    expect(() => validateEnv({ DATABASE_PASSWORD: 'x', DELIVERY_MAX_ATTEMPTS: '0' })).toThrow('DELIVERY_MAX_ATTEMPTS');
  });
});
