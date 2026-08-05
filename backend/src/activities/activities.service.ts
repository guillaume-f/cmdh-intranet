import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(): Promise<Activity[]> {
    return this.activitiesRepository.find({ relations: { createdBy: true } });
  }

  async findById(id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({
      where: { id },
      relations: { createdBy: true },
    });
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return activity;
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

  async create(activityData: Partial<Activity>): Promise<Activity> {
    const activity = this.activitiesRepository.create(activityData);
    return this.activitiesRepository.save(activity);
  }
}
