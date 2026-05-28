import { Injectable } from '@nestjs/common';
import { MockActivity } from './interfaces/mock-activity.interface';
import { MockAttendanceValidation } from './interfaces/mock-attendance-validation.interface';
import { MockRole } from './interfaces/mock-role.interface';
import { MockUser } from './interfaces/mock-user.interface';

@Injectable()
export class UsersService {
  private readonly roles: MockRole[] = [
    { id: 'candidate', permissions: ['activity:read'] },
    {
      id: 'member',
      permissions: [
        'activity:read',
        'registration:create',
        'registration:read',
        'registration:delete',
      ],
    },
    {
      id: 'encoder',
      permissions: [
        'activity:read',
        'activity:create',
        'activity:edit',
        'activity:delete',
        'activity:publish',
        'registration:create',
        'registration:read',
        'registration:delete',
        'attendance:validate',
      ],
    },
    {
      id: 'admin',
      permissions: [
        'activity:read',
        'activity:create',
        'activity:edit',
        'activity:delete',
        'activity:publish',
        'registration:create',
        'registration:read',
        'registration:delete',
        'attendance:validate',
        'user:manage',
      ],
    },
  ];

  private readonly activities: MockActivity[] = [
    { id: '3CBxUoi', title: 'Deuxieme repetition', points: 5 },
    {
      id: '6C1iuyq',
      title: 'Un After framerisois - Edition 2026',
      points: 0,
    },
    { id: 'DEvLzyE', title: 'Messe de Paques a la geriatrie', points: 1 },
    {
      id: 'c0Ci3uq',
      title: 'Fete de sainte Waudru - Hommage a la Patronne de la Cite',
      points: 3,
    },
    {
      id: 'pyCDv1O',
      title: 'Frameries fete sa Patronne - Procession de Frameries',
      points: 3,
    },
  ];

  private readonly attendanceValidations: MockAttendanceValidation[] = [
    {
      id: 'av1778845342888',
      activityId: 'pyCDv1O',
      userId: 'u1',
      isPresent: true,
      validatedAt: '2026-05-15T12:32:17.808Z',
      validatedBy: 'u1',
    },
    {
      id: 'av1778846398017',
      activityId: 'DEvLzyE',
      userId: 'u1',
      isPresent: true,
      validatedAt: '2026-05-15T14:40:36.513Z',
      validatedBy: 'u1',
    },
    {
      id: 'av1778849989444-u3',
      activityId: 'pyCDv1O',
      userId: 'u3',
      isPresent: false,
      validatedAt: '2026-05-15T13:00:06.677Z',
      validatedBy: 'u1',
    },
    {
      id: 'av1778851521785-u5',
      activityId: 'pyCDv1O',
      userId: 'u5',
      isPresent: true,
      validatedAt: '2026-05-15T13:25:29.264Z',
      validatedBy: 'u1',
    },
    {
      id: 'av1778854251990-u1',
      activityId: '3CBxUoi',
      userId: 'u1',
      isPresent: true,
      validatedAt: '2026-05-15T14:10:51.989Z',
      validatedBy: 'u1',
    },
    {
      id: 'av1778854252011-u3',
      activityId: '3CBxUoi',
      userId: 'u3',
      isPresent: true,
      validatedAt: '2026-05-15T14:10:51.989Z',
      validatedBy: 'u1',
    },
    {
      id: 'av1778854252030-u5',
      activityId: '3CBxUoi',
      userId: 'u5',
      isPresent: true,
      validatedAt: '2026-05-15T14:10:51.989Z',
      validatedBy: 'u1',
    },
    {
      id: 'av1778857813120-u7',
      activityId: 'c0Ci3uq',
      userId: 'u7',
      isPresent: true,
      validatedAt: '2026-05-15T15:10:13.119Z',
      validatedBy: 'u1',
    },
  ];

  private readonly users: MockUser[] = [
    {
      id: 'u1',
      email: 'admin@intranet.be',
      password: 'admin123',
      firstName: 'Sophie',
      lastName: 'Dumont',
      role: 'admin',
      extraPermissions: [],
      deniedPermissions: [],
      active: true,
      niss: '12345678901',
      entryYear: 2010,
    },
    {
      id: 'u2',
      email: 'encoder@intranet.be',
      password: 'encoder123',
      firstName: 'Marc',
      lastName: 'Lefevreeee',
      role: 'encoder',
      extraPermissions: [],
      deniedPermissions: [],
      active: true,
      niss: '12345678902',
      entryYear: 2012,
    },
    {
      id: 'u3',
      email: 'member@intranet.be',
      password: 'member123',
      firstName: 'Julie',
      lastName: 'Martin',
      role: 'member',
      extraPermissions: [],
      deniedPermissions: [],
      active: true,
      niss: '12345678903',
      entryYear: 2015,
    },
    {
      id: 'u4',
      email: 'candidate@intranet.be',
      password: 'candidate123',
      firstName: 'Thomas',
      lastName: 'Bernard',
      role: 'candidate',
      extraPermissions: [],
      deniedPermissions: [],
      active: true,
      niss: '12345678904',
      entryYear: null,
    },
    {
      id: 'u5',
      email: 'julie.special@intranet.be',
      password: 'special123',
      firstName: 'Julie',
      lastName: 'Speciale',
      role: 'member',
      extraPermissions: ['activity:create'],
      deniedPermissions: [],
      active: true,
      niss: '12345678905',
      entryYear: 2018,
    },
    {
      id: 'u6',
      email: 'encoder.limite@intranet.be',
      password: 'limite123',
      firstName: 'Paul',
      lastName: 'Limite',
      role: 'encoder',
      extraPermissions: [],
      deniedPermissions: ['activity:delete', 'activity:publish'],
      active: true,
      niss: '12345678906',
      entryYear: 2011,
    },
    {
      id: 'u7',
      email: 'jpd@gmail.com',
      password: 'changeMe123!',
      firstName: 'Jean Paul',
      lastName: 'Doe',
      role: 'member',
      extraPermissions: [],
      deniedPermissions: [],
      active: true,
      niss: '12345678910',
      entryYear: 2020,
    },
  ];

  getAllUsers() {
    return this.users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      extraPermissions: user.extraPermissions,
      deniedPermissions: user.deniedPermissions,
      active: user.active,
      niss: user.niss,
      entryYear: user.entryYear,
      permissions: this.resolvePermissions(user),
    }));
  }

  getUserById(userId: string) {
    const user = this.users.find((candidate) => candidate.id === userId);

    if (!user) {
      return { id: userId, found: false };
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      extraPermissions: user.extraPermissions,
      deniedPermissions: user.deniedPermissions,
      active: user.active,
      niss: user.niss,
      entryYear: user.entryYear,
      permissions: this.resolvePermissions(user),
      found: true,
    };
  }

  getValidatedActivitiesByUserId(userId: string) {
    const items = this.attendanceValidations
      .filter(
        (validation) => validation.userId === userId && validation.isPresent,
      )
      .map((validation) => {
        const activity = this.activities.find(
          (candidate) => candidate.id === validation.activityId,
        );

        return {
          validationId: validation.id,
          activityId: validation.activityId,
          activityTitle: activity?.title ?? 'Unknown activity',
          points: activity?.points ?? 0,
          validatedAt: validation.validatedAt,
          validatedBy: validation.validatedBy,
        };
      });

    return {
      userId,
      items,
      totalPoints: items.reduce((sum, item) => sum + item.points, 0),
    };
  }

  updateUser(userId: string, payload: Record<string, unknown>) {
    const user = this.users.find((candidate) => candidate.id === userId);

    if (!user) {
      return {
        id: userId,
        found: false,
        updates: payload,
      };
    }

    return {
      id: userId,
      found: true,
      updates: payload,
    };
  }

  addUser(payload: Record<string, unknown>) {
    const id = `u${this.users.length + 1}`;
    return {
      id,
      created: payload,
    };
  }

  private resolvePermissions(user: Omit<MockUser, 'password'>): string[] {
    const rolePermissions =
      this.roles.find((role) => role.id === user.role)?.permissions ?? [];
    const mergedPermissions = [...rolePermissions, ...user.extraPermissions];

    return Array.from(new Set(mergedPermissions)).filter(
      (permission) => !user.deniedPermissions.includes(permission),
    );
  }
}
