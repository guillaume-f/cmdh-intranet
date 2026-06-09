import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from './activity.entity';

@Entity('attendance_validations')
export class AttendanceValidation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Activity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity!: Activity;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'boolean' })
  isPresent!: boolean;

  @CreateDateColumn()
  validatedAt!: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'validatedById' })
  validatedBy!: User | null;
}
