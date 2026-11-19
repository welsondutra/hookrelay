import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsAndDeliveries1763400100000 implements MigrationInterface {
  name = 'CreateEventsAndDeliveries1763400100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" varchar(120) NOT NULL,
        "payload" jsonb NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_events_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "deliveries" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "eventId" uuid NOT NULL,
        "endpointId" uuid NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "attempts" integer NOT NULL DEFAULT 0,
        "nextAttemptAt" timestamptz,
        "lastStatusCode" integer,
        "lastError" text,
        "deliveredAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_deliveries_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_deliveries_event" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_deliveries_endpoint" FOREIGN KEY ("endpointId") REFERENCES "endpoints"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_deliveries_due" ON "deliveries" ("status", "nextAttemptAt")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "deliveries"`);
    await queryRunner.query(`DROP TABLE "events"`);
  }
}
