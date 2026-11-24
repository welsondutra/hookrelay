import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('endpoints')
export class Endpoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'text' })
  secret!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Event types this endpoint subscribes to. Empty means every event. */
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  eventTypes!: string[];

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
