export const PERMISSIONS = {
  ACTIVITY_CREATE: 'activity:create',
  ACTIVITY_EDIT: 'activity:edit',
  ACTIVITY_DELETE: 'activity:delete',
  ACTIVITY_PUBLISH: 'activity:publish',
  ATTENDANCE_VALIDATE: 'attendance:validate',
  REGISTRATION_CREATE: 'registration:create',
  REGISTRATION_READ: 'registration:read',
  REGISTRATION_DELETE: 'registration:delete',
  USER_MANAGE: 'user:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
