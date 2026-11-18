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
});
