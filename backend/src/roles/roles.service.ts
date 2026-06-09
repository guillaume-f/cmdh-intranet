import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  findById(id: string): Promise<Role | null> {
    return this.rolesRepository.findOneBy({ id });
  }

  resolvePermissions(user: User): string[] {
    const rolePermissions = user.role?.permissions ?? [];
    const merged = [...rolePermissions, ...user.extraPermissions];
    return Array.from(new Set(merged)).filter(
      (permission) => !user.deniedPermissions.includes(permission),
    );
  }
}
