export interface Env {
  PORT: number;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
}

function readPort(value: unknown, name: string, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be a valid port number, received ${JSON.stringify(value)}`);
  }
  return port;
}

function readString(value: unknown, name: string, fallback?: string): string {
  if (typeof value === 'string' && value.length > 0) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`${name} is required`);
}

export function validateEnv(config: Record<string, unknown>): Env {
  return {
    PORT: readPort(config.PORT, 'PORT', 3000),
    DATABASE_HOST: readString(config.DATABASE_HOST, 'DATABASE_HOST', 'localhost'),
    DATABASE_PORT: readPort(config.DATABASE_PORT, 'DATABASE_PORT', 5432),
    DATABASE_USER: readString(config.DATABASE_USER, 'DATABASE_USER', 'hookrelay'),
    DATABASE_PASSWORD: readString(config.DATABASE_PASSWORD, 'DATABASE_PASSWORD'),
    DATABASE_NAME: readString(config.DATABASE_NAME, 'DATABASE_NAME', 'hookrelay'),
  };
}
