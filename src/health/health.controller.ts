import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthStatus {
  status: 'ok';
  database: 'up';
  uptimeSeconds: number;
}

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check(): Promise<HealthStatus> {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
    return { status: 'ok', database: 'up', uptimeSeconds: Math.round(process.uptime()) };
  }
}
