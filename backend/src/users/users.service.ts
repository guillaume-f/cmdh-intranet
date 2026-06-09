import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceValidation } from '../activities/entities/attendance-validation.entity';
import { RolesService } from '../roles/roles.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AttendanceValidation)
    private readonly attendanceRepository: Repository<AttendanceValidation>,
    private readonly rolesService: RolesService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: { role: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { role: true },
    });
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({ relations: { role: true } });
    return users.map((user) => this.toResponseDto(user));
  }

  async getUserById(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return this.toResponseDto(user);
  }

  async getValidatedActivitiesByUserId(userId: string) {
    const validations = await this.attendanceRepository.find({
      where: { user: { id: userId }, isPresent: true },
      relations: { activity: true, validatedBy: true },
    });

    const items = validations.map((v) => ({
      validationId: v.id,
      activityId: v.activity?.id ?? '',
      activityTitle: v.activity?.title ?? 'Unknown activity',
      points: v.activity?.points ?? 0,
      validatedAt: v.validatedAt,
      validatedBy: v.validatedBy?.id ?? null,
    }));

    return {
      userId,
      items,
      totalPoints: items.reduce((sum, item) => sum + item.points, 0),
    };
  }

  async updateUser(userId: string, payload: Record<string, unknown>) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (typeof payload.firstName === 'string') user.firstName = payload.firstName;
    if (typeof payload.lastName === 'string') user.lastName = payload.lastName;
    if (typeof payload.email === 'string') user.email = payload.email;
    if (typeof payload.niss === 'string') user.niss = payload.niss;
    if (typeof payload.active === 'boolean') user.active = payload.active;
    if (payload.entryYear === null || typeof payload.entryYear === 'number') {
      user.entryYear = payload.entryYear as number | null;
    }
    if (Array.isArray(payload.extraPermissions)) {
      user.extraPermissions = payload.extraPermissions as string[];
    }
    if (Array.isArray(payload.deniedPermissions)) {
      user.deniedPermissions = payload.deniedPermissions as string[];
    }
    if (typeof payload.role === 'string') {
      const role = await this.rolesService.findById(payload.role);
      if (role) user.role = role;
    }

    const updated = await this.usersRepository.save(user);
    return this.toResponseDto(updated);
  }

  async addUser(payload: Record<string, unknown>) {
    const user = this.usersRepository.create();
    user.firstName = typeof payload.firstName === 'string' ? payload.firstName : '';
    user.lastName = typeof payload.lastName === 'string' ? payload.lastName : '';
    user.email = typeof payload.email === 'string' ? payload.email : '';
    user.niss = typeof payload.niss === 'string' ? payload.niss : '';
    user.active = typeof payload.active === 'boolean' ? payload.active : true;
    user.entryYear = typeof payload.entryYear === 'number' ? payload.entryYear : null;
    user.extraPermissions = Array.isArray(payload.extraPermissions) ? (payload.extraPermissions as string[]) : [];
    user.deniedPermissions = Array.isArray(payload.deniedPermissions) ? (payload.deniedPermissions as string[]) : [];

    // Temporary placeholder password â€” must be set via reset flow
    user.password = '';

    if (typeof payload.role === 'string') {
      const role = await this.rolesService.findById(payload.role);
      if (role) user.role = role;
    }

    const created = await this.usersRepository.save(user);
    return this.toResponseDto(created);
  }

  private toResponseDto(user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.id ?? '',
      extraPermissions: user.extraPermissions,
      deniedPermissions: user.deniedPermissions,
      active: user.active,
      niss: user.niss,
      entryYear: user.entryYear,
      permissions: this.rolesService.resolvePermissions(user),
    };
  }
}
