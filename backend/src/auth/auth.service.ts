import { Injectable } from '@nestjs/common';

type Permission = string;

interface MockRole {
  id: string;
  permissions: Permission[];
}

interface MockUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  extraPermissions: Permission[];
  deniedPermissions: Permission[];
  active: boolean;
  niss: string;
  entryYear: number | null;
}

@Injectable()
export class AuthService {
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

  login(payload: Record<string, unknown>) {
    const email = typeof payload.email === 'string' ? payload.email : '';
    const password = typeof payload.password === 'string' ? payload.password : '';

    const user = this.users.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.toLowerCase() &&
        candidate.password === password,
    );

    if (!user) {
      return {
        token: '',
        user: null,
        message: 'Invalid credentials.',
      };
    }

    const permissions = this.resolvePermissions(user);

    return {
      token: `mock-jwt-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions,
      },
    };
  }

  forgotPassword(payload: Record<string, unknown>) {
    return {
      message: 'If this email exists, a reset link has been sent.',
      request: payload,
      resetTokenPreview: 'mock-reset-token',
    };
  }

  resetPassword(payload: Record<string, unknown>) {
    return {
      message: 'Password updated successfully.',
      request: payload,
    };
  }

  me() {
    const currentUser = this.users[0];

    return {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      permissions: this.resolvePermissions(currentUser),
    };
  }

  private resolvePermissions(user: MockUser): string[] {
    const rolePermissions =
      this.roles.find((role) => role.id === user.role)?.permissions ?? [];

    const mergedPermissions = [...rolePermissions, ...user.extraPermissions];
    return Array.from(new Set(mergedPermissions)).filter(
      (permission) => !user.deniedPermissions.includes(permission),
    );
  }
}