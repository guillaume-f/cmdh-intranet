import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityDto } from 'src/models/activities/activity.dto';
import { AttendanceValidationDto } from 'src/models/activities/attendance-validation.dto';
import { Repository } from 'typeorm';
import { Activity, ActivityStatus } from './entities/activity.entity';
import { AttendanceValidation } from './entities/attendance-validation.entity';
import { Registration } from './entities/registration.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    @InjectRepository(AttendanceValidation)
    private readonly attendanceRepository: Repository<AttendanceValidation>,
  ) {}

  async findAll(userId?: string): Promise<Array<ActivityDto>> {
    const activities = await this.activitiesRepository.find();

    if (!userId) {
      return activities.map(
        (activity) =>
          ({
            ...activity,
            isRegistered: false,
            registeredAt: null,
          }) as ActivityDto,
      );
    }

    const registrationActivityIds = activities
      .filter((activity) => activity.requiresRegistration)
      .map((activity) => activity.id);

    if (registrationActivityIds.length === 0) {
      return activities.map(
        (activity) =>
          ({
            ...activity,
            isRegistered: false,
            registeredAt: null,
          }) as ActivityDto,
      );
    }

    const registrations = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.activityId', 'activityId')
      .addSelect('registration.registeredAt', 'registeredAt')
      .where('registration.activityId IN (:...activityIds)', {
        activityIds: registrationActivityIds,
      })
      .andWhere('registration.userId = :userId', { userId })
      .getRawMany<{ activityId: string; registeredAt: Date }>();

    const registrationsByActivityId = new Map(
      registrations.map((registration) => [
        registration.activityId,
        registration,
      ]),
    );

    return activities.map((activity) => {
      const registration = registrationsByActivityId.get(activity.id);

      return {
        ...activity,
        isRegistered: Boolean(registration),
        registeredAt: registration ? new Date(registration.registeredAt) : null,
      } as ActivityDto;
    });
  }

  async findById(id: string): Promise<ActivityDto> {
    const activity = await this.activitiesRepository.findOne({ where: { id } });
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity as ActivityDto;
  }

  async findByIdWithRegistration(
    id: string,
    userId?: string,
  ): Promise<ActivityDto> {
    const activity = await this.findById(id);

    if (!activity.requiresRegistration) {
      return {
        ...activity,
        isRegistered: false,
        registeredAt: null,
      };
    }

    const registration = await this.registrationsRepository
      .createQueryBuilder('registration')
      .select('registration.id', 'id')
      .addSelect('registration.registeredAt', 'registeredAt')
      .where('registration.activityId = :activityId', { activityId: id })
      .andWhere('registration.userId = :userId', { userId })
      .getRawOne<{ id: string; registeredAt: Date }>();

    return {
      ...activity,
      isRegistered: Boolean(registration),
      registeredAt: registration?.registeredAt ?? null,
    };
  }

  async deleteActivity(id: string): Promise<void> {
    await this.activitiesRepository.delete(id);
  }

  async create(
    activityData: Partial<Activity>,
    userId: string,
  ): Promise<ActivityDto> {
    const activity = this.activitiesRepository.create(activityData);
    activity.createdById = userId;
    const savedActivity = await this.activitiesRepository.save(activity);
    return this.findById(savedActivity.id);
  }

  async getParticipants(
    activityId: string,
  ): Promise<AttendanceValidationDto[]> {
    const validations = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .where('attendance.activityId = :activityId', { activityId })
      .getMany();

    return validations.map((validation) => ({
      userId: validation.user.id,
      firstName: validation.user.firstName,
      lastName: validation.user.lastName,
      isPresent: validation.isPresent,
      presenceValidatedAt: validation.validatedAt,
    }));
  }

  async deleteParticipant(activityId: string, userId: string): Promise<void> {
    await this.registrationsRepository
      .createQueryBuilder()
      .delete()
      .from(Registration)
      .where('activityId = :activityId', { activityId })
      .andWhere('userId = :userId', { userId })
      .execute();
    await this.attendanceRepository
      .createQueryBuilder()
      .delete()
      .from(AttendanceValidation)
      .where('activityId = :activityId', { activityId })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  async validatePresence(
    activityId: string,
    userId: string,
    isPresent: boolean,
  ): Promise<void> {
    let validation = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.activityId = :activityId', { activityId })
      .andWhere('attendance.userId = :userId', { userId })
      .getOne();

    if (!validation) {
      validation = this.attendanceRepository.create({
        activity: { id: activityId } as Activity,
        user: { id: userId },
        isPresent,
      });
    } else {
      validation.isPresent = isPresent;
    }

    await this.attendanceRepository.save(validation);
  }

  async bulkAddParticipants(
    activityId: string,
    userIds: string[],
  ): Promise<void> {
    for (const userId of userIds) {
      const exists = await this.attendanceRepository
        .createQueryBuilder('attendance')
        .where('attendance.activityId = :activityId', { activityId })
        .andWhere('attendance.userId = :userId', { userId })
        .getOne();
      if (!exists) {
        const validation = this.attendanceRepository.create({
          activity: { id: activityId } as Activity,
          user: { id: userId },
          isPresent: true,
        });
        await this.attendanceRepository.save(validation);
      }
    }
  }

  async register(activityId: string, userId: string): Promise<Registration> {
    const activity = await this.findById(activityId);

    if (!activity.requiresRegistration) {
      throw new BadRequestException(
        `Activity ${activityId} does not require registration`,
      );
    }

    const existing = await this.registrationsRepository
      .createQueryBuilder('registration')
      .where('registration.activityId = :activityId', { activityId })
      .andWhere('registration.userId = :userId', { userId })
      .getOne();

    if (existing) {
      return existing;
    }

    const registration = this.registrationsRepository.create({
      activity: { id: activityId } as Activity,
      user: { id: userId },
    });

    return this.registrationsRepository.save(registration);
  }

  async unregister(activityId: string, userId: string): Promise<void> {
    await this.findById(activityId);
    await this.deleteParticipant(activityId, userId);
  }

  async updateStatus(
    activityId: string,
    status: ActivityStatus,
  ): Promise<ActivityDto> {
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId },
    });

    if (!Object.values(ActivityStatus).includes(status)) {
      throw new BadRequestException(
        `Invalid activity status: ${status}. Allowed values: ${Object.values(ActivityStatus).join(', ')}`,
      );
    }

    if (!activity) {
      throw new NotFoundException(`Activity ${activityId} not found`);
    }

    activity.status = status;
    const updatedActivity = await this.activitiesRepository.save(activity);

    return {
      ...updatedActivity,
      isRegistered: false,
      registeredAt: null,
    } as ActivityDto;
  }
}
