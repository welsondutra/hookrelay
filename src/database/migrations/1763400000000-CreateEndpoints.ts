import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEndpoints1763400000000 implements MigrationInterface {
  name = 'CreateEndpoints1763400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      CREATE TABLE "endpoints" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "url" text NOT NULL,
        "secret" text NOT NULL,
        "description" text,
        "enabled" boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_endpoints_id" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "endpoints"`);
  }
}
