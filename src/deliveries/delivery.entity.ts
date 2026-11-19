import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type DeliveryStatus = 'pending' | 'delivered' | 'failed';

@Entity('deliveries')
@Index('IDX_deliveries_due', ['status', 'nextAttemptAt'])
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  eventId!: string;

  @Column({ type: 'uuid' })
  endpointId!: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: DeliveryStatus;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'timestamptz', nullable: true })
  nextAttemptAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  lastStatusCode!: number | null;

  @Column({ type: 'text', nullable: true })
  lastError!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
