export interface ActivityDto {
  id: string;
  title: string;
  description: string;
  datetime: Date;
  points: number;
  location: string;
  requiresRegistration: boolean;
  requiresAttendanceValidation: boolean;
  status: 'published' | 'draft';
  createdById: string;
  createdAt: Date;
  isRegistered: boolean;
  registeredAt?: Date | null;
}

export interface ActivityDtoRequest {
  title: string;
  description: string;
  datetime: Date;
  points: number;
  location: string;
  requiresRegistration: boolean;
  requiresAttendanceValidation: boolean;
}
