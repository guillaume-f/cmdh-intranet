import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  label!: string;

  @Column({ type: 'simple-json' })
  permissions!: string[];
}
