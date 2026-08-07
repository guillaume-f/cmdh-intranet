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

  @Column({ type: 'boolean', default: false })
  active!: boolean;

  @Column({ type: 'varchar', length: 20 })
  niss!: string;

  @Column({ type: 'int', nullable: true })
  entryYear!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  refreshTokenId!: string | null;

  @Column({ type: 'datetime', nullable: true })
  refreshTokenExpiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
