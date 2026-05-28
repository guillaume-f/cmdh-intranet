export interface MockAttendanceValidation {
  id: string;
  activityId: string;
  userId: string;
  isPresent: boolean;
  validatedAt: string;
  validatedBy: string;
}
