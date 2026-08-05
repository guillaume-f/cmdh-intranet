import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'boolean', default: false })
  requiresAttendanceValidation!: boolean;

  @Column({ type: 'boolean', default: false })
  requiresRegistration!: boolean;
}
