import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
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

  async findAll(
    userId?: string,
  ): Promise<
    Array<Activity & { isRegistered: boolean; registeredAt: Date | null }>
  > {
    const activities = await this.activitiesRepository.find();

    if (!userId) {
      return activities.map((activity) => ({
        ...activity,
        isRegistered: false,
        registeredAt: null,
      }));
    }

    const registrationActivityIds = activities
      .filter((activity) => activity.requiresRegistration)
      .map((activity) => activity.id);

    if (registrationActivityIds.length === 0) {
      return activities.map((activity) => ({
        ...activity,
        isRegistered: false,
        registeredAt: null,
      }));
    }

    const registrations = await this.registrationsRepository.find({
      where: {
        activity: { id: In(registrationActivityIds) },
        user: { id: userId },
      },
      relations: { activity: true },
    });

    const registrationsByActivityId = new Map(
      registrations.map((registration) => [
        registration.activity.id,
        registration,
      ]),
    );

    return activities.map((activity) => {
      const registration = registrationsByActivityId.get(activity.id);

      return {
        ...activity,
        isRegistered: Boolean(registration),
        registeredAt: registration?.registeredAt ?? null,
      };
    });
  }

  async findById(id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({ where: { id } });
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity;
  }

  async findByIdWithRegistration(
    id: string,
    userId?: string,
  ): Promise<Activity & { isRegistered: boolean; registeredAt: Date | null }> {
    const activity = await this.findById(id);

    if (!activity.requiresRegistration) {
      return {
        ...activity,
        isRegistered: false,
        registeredAt: null,
      };
    }

    const registration = await this.registrationsRepository.findOne({
      where: { activity: { id }, user: { id: userId } },
    });

    return {
      ...activity,
      isRegistered: Boolean(registration),
      registeredAt: registration?.registeredAt ?? null,
    };
  }

  async getParticipants(activityId: string): Promise<AttendanceValidation[]> {
    return this.attendanceRepository.find({
      where: { activity: { id: activityId } },
      relations: { user: true, validatedBy: true },
    });
  }

  async validatePresence(
    activityId: string,
    userId: string,
    isPresent: boolean,
  ): Promise<AttendanceValidation> {
    let validation = await this.attendanceRepository.findOne({
      where: { activity: { id: activityId }, user: { id: userId } },
    });

    if (!validation) {
      validation = this.attendanceRepository.create({
        activity: { id: activityId } as Activity,
        user: { id: userId },
        isPresent,
      });
    } else {
      validation.isPresent = isPresent;
    }

    return this.attendanceRepository.save(validation);
  }

  async deleteParticipant(activityId: string, userId: string): Promise<void> {
    await this.registrationsRepository.delete({
      activity: { id: activityId },
      user: { id: userId },
    });
    await this.attendanceRepository.delete({
      activity: { id: activityId },
      user: { id: userId },
    });
  }

  async register(activityId: string, userId: string): Promise<Registration> {
    const activity = await this.findById(activityId);

    if (!activity.requiresRegistration) {
      throw new BadRequestException(
        `Activity ${activityId} does not require registration`,
      );
    }

    const existing = await this.registrationsRepository.findOne({
      where: { activity: { id: activityId }, user: { id: userId } },
    });

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

  async bulkAddParticipants(
    activityId: string,
    userIds: string[],
  ): Promise<void> {
    for (const userId of userIds) {
      const exists = await this.attendanceRepository.findOne({
        where: { activity: { id: activityId }, user: { id: userId } },
      });
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

  async deleteActivity(id: string): Promise<void> {
    await this.activitiesRepository.delete(id);
  }

  async create(
    activityData: Partial<Activity>,
    userId: string,
  ): Promise<Activity> {
    const activity = this.activitiesRepository.create(activityData);
    activity.createdById = userId;
    const savedActivity = await this.activitiesRepository.save(activity);
    return this.findById(savedActivity.id);
  }
}
