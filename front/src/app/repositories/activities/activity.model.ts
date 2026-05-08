export interface ActivityDto {
  id: string;
  title: string;
  description: string;
  datetime: Date;
  points: number;
  location: string;
  status: string;
  createdBy: string;
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
}