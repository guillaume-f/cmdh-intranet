import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ActivityStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamp' })
  datetime!: Date;

  @Column({ type: 'int', default: 0 })
  points!: number;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @Column({ type: 'enum', enum: ActivityStatus, default: ActivityStatus.DRAFT })
  status!: ActivityStatus;

  @Column({ type: 'uuid', nullable: true })
  createdById!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'boolean', default: false })
  requiresAttendanceValidation!: boolean;

  @Column({ type: 'boolean', default: false })
  requiresRegistration!: boolean;
}
