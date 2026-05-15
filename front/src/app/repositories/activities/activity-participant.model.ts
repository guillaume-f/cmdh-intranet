export interface ActivityAttendanceDto {
  userId: string;
  firstName: string;
  lastName: string;
  isPresent: boolean | null;
  presenceValidatedAt: Date | null;
}