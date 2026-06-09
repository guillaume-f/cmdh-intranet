import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @Column({ type: 'simple-json' })
  extraPermissions!: string[];

  @Column({ type: 'simple-json' })
  deniedPermissions!: string[];

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'varchar', length: 20 })
  niss!: string;

  @Column({ type: 'int', nullable: true })
  entryYear!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
