import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from './activity.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Activity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity!: Activity;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  registeredAt!: Date;
}
