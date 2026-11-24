import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEndpointEventTypes1763500000000 implements MigrationInterface {
  name = 'AddEndpointEventTypes1763500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // An empty array means "all event types", so existing endpoints keep receiving everything.
    await queryRunner.query(`ALTER TABLE "endpoints" ADD "eventTypes" text[] NOT NULL DEFAULT '{}'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "endpoints" DROP COLUMN "eventTypes"`);
  }
}
